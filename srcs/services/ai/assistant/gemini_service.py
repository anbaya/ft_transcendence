import os
import re
import time
import hashlib
import logging

logger = logging.getLogger(__name__)


class LLMServiceError(Exception):
    """Raised when all LLM providers, models, or network calls fail."""
    pass


def get_api_key():
    return os.environ.get("GEMINI_API_KEY", "").strip()


def get_gemini_client(timeout_ms=15000):
    api_key = get_api_key()
    if not api_key:
        return None, (
            "Gemini API key (GEMINI_API_KEY) is not configured yet. "
            "Please provide your GEMINI_API_KEY in the .env file."
        )

    try:
        from google import genai
        from google.genai import types
        try:
            http_options = types.HttpOptions(timeout=timeout_ms)
            return genai.Client(api_key=api_key, http_options=http_options), None
        except Exception:
            return genai.Client(api_key=api_key), None
    except ImportError:
        return None, (
            "Error initializing Gemini client: the 'google-genai' SDK is not installed or importable. "
            "Run 'pip install google-genai'."
        )
    except Exception as e:
        return None, f"Error initializing Gemini client: {e}"


def generate_fallback_embedding(text, dimension=768):
    """
    Deterministic pseudo-embedding fallback matching text-embedding-004 dimension (768).
    Avoids ChromaDB dimension mismatch crashes when switching between Gemini and fallback.
    """
    tokens = text.lower().split()
    vector = [0.0] * dimension
    if not tokens:
        return vector

    for token in tokens:
        h = int(hashlib.md5(token.encode('utf-8')).hexdigest(), 16)
        index = h % dimension
        vector[index] += 1.0

    magnitude = sum(x * x for x in vector) ** 0.5
    if magnitude > 0:
        vector = [x / magnitude for x in vector]

    return vector


def generate_answer(prompt, max_output_tokens=800, temperature=0.2):
    primary_model = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash").strip() or "gemini-3.8-flash"
    fallback_model = os.environ.get("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite").strip() or "gemini-3.5-flash-lite"

    # correction: cascade de repli robuste pour eviter l'erreur 503 / 504 de haute affluence
    candidate_names = [primary_model, fallback_model, "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash"]
    seen = set()
    model_configs = []
    for name in candidate_names:
        if name and name not in seen:
            seen.add(name)
            model_configs.append({
                "name": name,
                "timeout_ms": 10000 if len(model_configs) == 0 else 15000,
                "is_primary": (len(model_configs) == 0)
            })

    last_error = None

    for m_cfg in model_configs:
        model_name = m_cfg["name"]
        timeout_ms = m_cfg["timeout_ms"]
        is_primary = m_cfg["is_primary"]

        client, error_msg = get_gemini_client(timeout_ms=timeout_ms)
        if not client:
            last_error = error_msg
            continue

        attempt = 0
        while attempt < 2:  # at most 2 attempts (initial + 1 retry if eligible)
            attempt += 1
            t_start = time.perf_counter()
            try:
                from google.genai import types
                try:
                    if "3.1" in model_name:
                        thinking_cfg = types.ThinkingConfig(thinking_budget=0)
                        gen_config = types.GenerateContentConfig(
                            temperature=temperature,
                            max_output_tokens=max_output_tokens,
                            thinking_config=thinking_cfg,
                        )
                    else:
                        gen_config = types.GenerateContentConfig(
                            temperature=temperature,
                            max_output_tokens=max_output_tokens,
                        )
                except Exception:
                    gen_config = types.GenerateContentConfig(
                        temperature=temperature,
                        max_output_tokens=max_output_tokens,
                    )

                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=gen_config,
                    )
                except Exception as inner_e:
                    if "invalid_argument" in str(inner_e).lower() or "400" in str(inner_e):
                        fallback_cfg = types.GenerateContentConfig(
                            temperature=temperature,
                            max_output_tokens=max_output_tokens,
                        )
                        response = client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                            config=fallback_cfg,
                        )
                    else:
                        raise inner_e

                if response and response.text:
                    return response.text.strip()
                elif response and response.candidates and response.candidates[0].content:
                    parts = response.candidates[0].content.parts
                    text = "".join(getattr(p, "text", "") for p in parts if getattr(p, "text", None))
                    if text.strip():
                        return text.strip()

            except Exception as e:
                elapsed = time.perf_counter() - t_start
                last_error = e
                err_str = str(e).lower()

                is_timeout = (
                    "timeout" in err_str or "timed out" in err_str
                    or "deadline" in err_str or "504" in err_str
                    or elapsed >= (timeout_ms / 1000.0 - 0.5)
                )

                # Règle 1: en cas de timeout, bascule immédiatement sur le modèle de secours, sans réessayer le même modèle
                if is_timeout:
                    logger.warning(
                        f"Model {model_name} timed out after {elapsed:.2f}s (timeout={timeout_ms/1000}s). "
                        "Switching immediately to fallback model without retrying."
                    )
                    break

                # Règle 2: réessaie le même modèle une seule fois seulement pour une erreur rapide (429/503 retournée en moins de 3 s)
                is_transient_error = (
                    "429" in err_str or "resource_exhausted" in err_str
                    or "503" in err_str or "unavailable" in err_str
                )
                is_daily_quota = "per day" in err_str or "retry in 6h" in err_str or "daily" in err_str

                if is_transient_error and not is_daily_quota and elapsed < 3.0 and attempt == 1:
                    logger.info(
                        f"Model {model_name} fast transient error ({e}) in {elapsed:.2f}s (< 3s). "
                        "Retrying once after 1s backoff..."
                    )
                    time.sleep(1.0)
                    continue

                # Autre erreur ou tentative épuisée: bascule vers le modèle suivant
                logger.warning(
                    f"Model {model_name} error ({e}) in {elapsed:.2f}s (attempt {attempt}). Switching model."
                )
                break

    logger.error(f"All Gemini models and retries failed: {last_error}")
    raise LLMServiceError(f"All Gemini models and retries failed: {last_error}")


def generate_answer_stream(prompt, max_output_tokens=800, temperature=0.2):
    """
    Streams the answer and yields chunks (text, ttft_seconds).
    Enables measurement of Time-To-First-Token (TTFT).
    """
    client, error_msg = get_gemini_client()
    if not client:
        raise LLMServiceError(error_msg or "Gemini client initialization failed")

    primary_model = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash").strip() or "gemini-3.8-flash"
    fallback_model = os.environ.get("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite").strip() or "gemini-3.5-flash-lite"
    candidate_names = [primary_model, fallback_model, "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash"]
    models_to_try = []
    for m in candidate_names:
        if m and m not in models_to_try:
            models_to_try.append(m)

    for model_name in models_to_try:
        for use_thinking in [True, False]:
            try:
                from google.genai import types
                if use_thinking:
                    try:
                        thinking_cfg = types.ThinkingConfig(thinking_budget=0)
                        gen_config = types.GenerateContentConfig(
                            temperature=temperature,
                            max_output_tokens=max_output_tokens,
                            thinking_config=thinking_cfg,
                        )
                    except Exception:
                        gen_config = types.GenerateContentConfig(
                            temperature=temperature,
                            max_output_tokens=max_output_tokens,
                        )
                else:
                    gen_config = types.GenerateContentConfig(
                        temperature=temperature,
                        max_output_tokens=max_output_tokens,
                    )

                t0 = time.perf_counter()
                stream = client.models.generate_content_stream(
                    model=model_name,
                    contents=prompt,
                    config=gen_config,
                )
                ttft = None
                for chunk in stream:
                    if ttft is None and chunk.text:
                        ttft = time.perf_counter() - t0
                    if chunk.text:
                        yield chunk.text, (ttft if ttft is not None else 0.0)
                return
            except Exception as e:
                err_str = str(e).lower()
                if ("thinking" in err_str or "invalid argument" in err_str) and use_thinking:
                    continue
                logger.warning(f"Streaming failed with {model_name}: {e}")
                last_stream_error = e
                break

    raise LLMServiceError(f"Streaming failed with all candidate models. Last error: {last_stream_error if 'last_stream_error' in locals() else 'unknown'}")


def rewrite_followup_question(question, conversation_history):
    """
    Transforms a follow-up question (e.g. 'and the minor ones', 'et pour la deuxieme ?', 'qui s\'en occupe ?')
    into a standalone search query using the recent conversation context.
    If no history or call fails, returns original question enriched with key topics if elliptical.
    """
    if not conversation_history or not conversation_history.strip():
        return question

    words = question.strip().lower().split()
    if len(words) > 12:
        return question

    pronouns = {
        "il", "elle", "ils", "elles", "lui", "leur", "eux", "ce", "cet", "cette", "ces",
        "celui", "celle", "ceux", "celles", "it", "they", "them", "this", "that", "these", "those"
    }
    has_pronoun = any(w in pronouns for w in words)
    is_short_followup = len(words) <= 4 or any(
        question.strip().lower().startswith(p)
        for p in ["et ", "and ", "pourquoi", "why", "qui ", "who", "ou ", "where", "quid", "combien", "how "]
    )
    if not (has_pronoun or is_short_followup):
        return question

    # Extract recent subject topic from previous User prompt for fast/reliable heuristic grounding
    history_context = conversation_history.strip()
    last_user_query = ""
    for line in reversed(history_context.splitlines()):
        if line.strip().lower().startswith("user:"):
            last_user_query = line.split(":", 1)[1].strip()
            break

    # Build fallback topic keywords from last user query
    stopwords = {
        "what", "is", "are", "the", "a", "an", "in", "on", "at", "for", "of", "to", "and", "or",
        "list", "all", "please", "can", "you", "tell", "me", "about", "show", "give",
        "quel", "quelle", "quels", "quelles", "est", "sont", "le", "la", "les", "un", "une",
        "des", "dans", "sur", "pour", "de", "du", "et", "ou", "liste", "tous", "toutes"
    }
    fallback_topic_words = [
        w for w in re.findall(r'[A-Za-z0-9_-]+', last_user_query)
        if w.lower() not in stopwords and len(w) > 1
    ]
    fallback_topic = " ".join(fallback_topic_words[:6])

    # correction: inject follow-up qualifier (minor/major) from current question into fallback topic
    # so "and the minor ones" becomes "minor AI modules" instead of just "AI"
    _QUALIFIER_MAP = {
        "minor": "minor modules",
        "mineurs": "modules mineurs",
        "mineures": "modules mineurs",
        "major": "major modules",
        "majeurs": "modules majeurs",
        "majeures": "modules majeurs",
    }
    _q_lower = question.strip().lower()
    _qualifier_hit = next((v for k, v in _QUALIFIER_MAP.items() if k in _q_lower), "")
    if _qualifier_hit and fallback_topic:
        fallback_topic = f"{_qualifier_hit} {fallback_topic}"
    elif _qualifier_hit:
        fallback_topic = _qualifier_hit

    if len(history_context) > 400:
        history_context = history_context[-400:]

    prompt = f"""Given the following recent context and follow-up question, rewrite it into a concise standalone search query for document retrieval. Return ONLY the search query.

Recent Context:
{history_context}

Follow-up Question: {question}
Standalone Search Query:"""

    def _is_error_response(txt):
        if not txt:
            return True
        t = txt.lower()
        return any(p in t for p in [
            "service d'assistance",
            "ai assistant service",
            "temporarily unavailable",
            "indisponible",
            "deadline",
            "error",
            "quota",
            "rate limit",
            "504",
            "503",
        ])

    try:
        rewritten = generate_answer(prompt, max_output_tokens=40, temperature=0.0)
        if rewritten and not _is_error_response(rewritten):
            clean_q = rewritten.strip().strip('"').strip("'")
            if clean_q and len(clean_q) > 2:
                if fallback_topic and not any(w.lower() in clean_q.lower() for w in fallback_topic_words[:3]):
                    clean_q = f"{clean_q} {fallback_topic}"
                return clean_q
    except Exception as e:
        logger.warning(f"Failed to rewrite follow-up question with LLM: {e}")

    # Fallback when LLM rewriting fails or times out: ground the follow-up with the previous topic
    if fallback_topic:
        return f"{question} {fallback_topic}".strip()

    return question

def generate_embedding(text, task_type="RETRIEVAL_DOCUMENT", dimension=768, model_name=None):
    """
    Generates an embedding with standardized dimension (768) and explicit task_type
    ('RETRIEVAL_DOCUMENT' for indexing, 'RETRIEVAL_QUERY' for search).
    For search queries (RETRIEVAL_QUERY): exclusively uses 'gemini-embedding-2-preview',
    with no fallback model and no deterministic pseudo-vector. If failed, returns (None, False).
    """
    is_query = (task_type == "RETRIEVAL_QUERY")

    # Question embedding: gemini-embedding-001 or fallback
    if is_query:
        cur_model = os.environ.get("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001").strip() or "gemini-embedding-001"
        client, _ = get_gemini_client(timeout_ms=15000)
        if not client:
            logger.warning("No Gemini client available for question embedding.")
            return None, False

        for attempt in range(3):
            try:
                from google.genai import types
                try:
                    embed_config = types.EmbedContentConfig(
                        task_type=task_type,
                        output_dimensionality=dimension,
                    )
                except Exception:
                    embed_config = {
                        "task_type": task_type,
                        "output_dimensionality": dimension,
                    }

                response = client.models.embed_content(
                    model=cur_model,
                    contents=text,
                    config=embed_config,
                )

                if response and response.embeddings:
                    values = response.embeddings[0].values
                    return values, False

            except Exception as e:
                err_str = str(e).lower()
                is_daily = "per day" in err_str or "retry in 6h" in err_str or "daily" in err_str
                if is_daily:
                    logger.warning(f"Question embedding model {cur_model} daily quota exceeded: {e}")
                    break
                if attempt < 2:
                    backoff = 1.0 + 0.5 * attempt
                    logger.info(f"Question embedding attempt {attempt+1} failed ({e}), retrying in {backoff}s...")
                    time.sleep(backoff)
                else:
                    logger.warning(f"Question embedding model {cur_model} exhausted retries ({e}).")

        logger.warning(f"Question embedding failed with {cur_model}. Returning None (dense search will be skipped).")
        return None, False

    # Document indexing embedding
    client, _ = get_gemini_client(timeout_ms=15000)
    if not client:
        return generate_fallback_embedding(text, dimension=dimension), True

    chosen_model = model_name or os.environ.get("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001").strip()
    fallback_model = "gemini-embedding-2" if chosen_model != "gemini-embedding-2" else "gemini-embedding-001"
    models_to_try = [chosen_model]
    if fallback_model not in models_to_try:
        models_to_try.append(fallback_model)

    for cur_model in models_to_try:
        for attempt in range(3):
            try:
                from google.genai import types
                try:
                    embed_config = types.EmbedContentConfig(
                        task_type=task_type,
                        output_dimensionality=dimension,
                    )
                except Exception:
                    embed_config = {
                        "task_type": task_type,
                        "output_dimensionality": dimension,
                    }

                response = client.models.embed_content(
                    model=cur_model,
                    contents=text,
                    config=embed_config,
                )

                if response and response.embeddings:
                    values = response.embeddings[0].values
                    return values, False

            except Exception as e:
                err_str = str(e).lower()
                is_daily = "per day" in err_str or "retry in 6h" in err_str or "daily" in err_str
                if is_daily:
                    logger.warning(f"Embedding model {cur_model} daily quota exceeded.")
                    break
                if attempt < 2:
                    backoff = 1.0 + 0.5 * attempt
                    logger.info(f"Embedding {cur_model} attempt {attempt+1} failed ({e}), retrying in {backoff}s...")
                    time.sleep(backoff)
                else:
                    logger.warning(f"Embedding model {cur_model} exhausted retries ({e}). Switching model.")

    return generate_fallback_embedding(text, dimension=dimension), True


def generate_embeddings_batch(texts, task_type="RETRIEVAL_DOCUMENT", dimension=768, model_name=None):
    """
    Generates embeddings in batch for a list of texts using a single API call when possible.
    Returns a list of tuples: [(embedding, is_fallback), ...]
    """
    if not texts:
        return []

    client, _ = get_gemini_client(timeout_ms=15000)
    if model_name:
        primary_model = model_name
    else:
        primary_model = os.environ.get("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001").strip()

    fallback_model = "gemini-embedding-2" if primary_model != "gemini-embedding-2" else "gemini-embedding-001"
    models_to_try = [primary_model]
    if fallback_model not in models_to_try:
        models_to_try.append(fallback_model)

    if client:
        for model_name in models_to_try:
            for attempt in range(3):
                try:
                    from google.genai import types
                    try:
                        embed_config = types.EmbedContentConfig(
                            task_type=task_type,
                            output_dimensionality=dimension,
                        )
                    except Exception:
                        embed_config = {
                            "task_type": task_type,
                            "output_dimensionality": dimension,
                        }

                    response = client.models.embed_content(
                        model=model_name,
                        contents=texts,
                        config=embed_config,
                    )

                    if response and response.embeddings and len(response.embeddings) == len(texts):
                        return [(emb.values, False) for emb in response.embeddings]
                except Exception as e:
                    err_str = str(e).lower()
                    is_daily = "per day" in err_str or "retry in 6h" in err_str or "daily" in err_str
                    if is_daily:
                        logger.warning(f"Batch embedding model {model_name} daily quota exceeded, switching model.")
                        break
                    if attempt < 2:
                        backoff = 1.0 + 0.5 * attempt
                        logger.info(f"Batch embedding attempt {attempt + 1} failed ({e}), retrying in {backoff}s...")
                        time.sleep(backoff)
                    else:
                        logger.warning(f"Batch embedding model {model_name} exhausted retries ({e}).")

    results = []
    for t in texts:
        results.append(generate_embedding(t, task_type=task_type, dimension=dimension))
    return results


# correction: fonction OCR multimodale supportant PDF scannes et images (PNG, JPG, WEBP)
def ocr_file_multimodal(file_bytes, mime_type="application/pdf"):
    """
    Extracts text from scanned PDFs or images (PNG, JPG, WEBP) using Gemini's native multimodal capabilities.
    """
    client, _ = get_gemini_client()
    if not client or not file_bytes:
        return ""

    try:
        from google.genai import types

        prompt = (
            "You are a specialized OCR and document transcription tool. "
            "Extract and transcribe all text, headings, labels, diagrams text, "
            "tables, and numbers from this image/document exactly as they appear. "
            "Do not summarize, do not provide any commentary, introduction, or conclusions. "
            "Output only the transcribed content verbatim."
        )

        primary_model = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash").strip() or "gemini-3.8-flash"
        fallback_model = os.environ.get("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite").strip() or "gemini-3.5-flash-lite"
        candidate_names = [primary_model, fallback_model, "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash"]
        models_to_try = []
        for m in candidate_names:
            if m and m not in models_to_try:
                models_to_try.append(m)

        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_bytes(
                            data=file_bytes,
                            mime_type=mime_type,
                        ),
                        prompt,
                    ],
                )
                if response and response.text:
                    return response.text.strip()
            except Exception:
                continue
    except Exception as e:
        logger.warning(f"Multimodal OCR failed for {mime_type}: {e}")

    return ""


def ocr_pdf_multimodal(file_bytes):
    return ocr_file_multimodal(file_bytes, mime_type="application/pdf")


def classify_question(question):
    client, _ = get_gemini_client()
    if not client:
        return "PROJECT"

    prompt = f"""Classify the following question. Return exactly one word:
PROJECT - if the question asks about the specific project, its tasks, documents, status, deadlines, members, or requirements.
GENERAL - if it is a general programming, technical, conceptual, or general knowledge question.

Question: {question}"""

    try:
        result = generate_answer(prompt).strip().upper()
        if "PROJECT" in result:
            return "PROJECT"
        if "GENERAL" in result:
            return "GENERAL"
    except Exception:
        pass

    return "PROJECT"
