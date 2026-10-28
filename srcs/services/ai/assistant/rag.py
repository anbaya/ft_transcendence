import math
import re
import os
import hashlib
import logging
from django.conf import settings
from .models import DocumentChunk
from .document_extractor import extract_text, clean_text
from .gemini_service import generate_embedding, generate_answer
from .document_service import get_project_documents, download_document
from .project_service import get_project, get_project_tasks, get_project_members

logger = logging.getLogger(__name__)


_chroma_client = None
_chroma_init_attempted = False

def get_chroma_client():
    global _chroma_client, _chroma_init_attempted
    if _chroma_client is None and not _chroma_init_attempted:
        _chroma_init_attempted = True
        try:
            import chromadb
            chroma_dir = getattr(settings, "CHROMA_PERSIST_DIR", None) or os.path.join(settings.BASE_DIR, "chroma_data")
            os.makedirs(chroma_dir, exist_ok=True)
            _chroma_client = chromadb.PersistentClient(path=chroma_dir)
        except Exception as e:
            logger.info(f"ChromaDB PersistentClient not available ({e}); using database fallback.")
            return None
    return _chroma_client

def get_chroma_collection():
    client = get_chroma_client()
    if client is None:
        return None
    try:
        return client.get_or_create_collection(
            name="project_documents",
            metadata={"hnsw:space": "cosine"}
        )
    except Exception as e:
        logger.warning(f"Could not get or create Chroma collection: {e}")
        return None

def delete_document_from_chroma(document_id):
    collection = get_chroma_collection()
    if collection is None:
        return
    try:
        collection.delete(where={"document_id": str(document_id)})
    except Exception as e:
        logger.warning(f"Error deleting doc {document_id} from Chroma: {e}")

def index_chunks_in_chroma(chunks_data):
    collection = get_chroma_collection()
    if collection is None or not chunks_data:
        return
    try:
        ids = [c["id"] for c in chunks_data]
        documents = [c["content"] for c in chunks_data]
        embeddings = [c["embedding"] for c in chunks_data]
        metadatas = [c["metadata"] for c in chunks_data]
        collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )
    except Exception as e:
        logger.warning(f"Error upserting chunks in Chroma: {e}")


def split_text(text, chunk_size=1200, overlap=200):
    """
    Splits text into chunks using natural semantic boundaries (paragraphs, newlines, sentences).
    Normalizes and deduplicates chunks.
    """
    text = clean_text(text)
    if not text:
        return []

    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end >= len(text):
            chunk = text[start:].strip()
            if chunk:
                chunks.append(chunk)
            break

        boundary = text.rfind("\n\n", start, end)
        if boundary == -1 or boundary <= start:
            boundary = text.rfind("\n", start, end)
        if boundary == -1 or boundary <= start:
            boundary = text.rfind(". ", start, end)
            if boundary != -1:
                boundary += 1

        if boundary > start:
            chunk = text[start:boundary].strip()
            if chunk:
                chunks.append(chunk)
            start = max(boundary - overlap, start + 1)
        else:
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            start = end - overlap

    return [c for c in chunks if c]


def index_document(project_id, document_id, filename, file_bytes, file_hash=None):
    if not file_hash:
        file_hash = hashlib.sha256(file_bytes).hexdigest()

    text = extract_text(file_bytes, filename)
    if not text:
        return

    chunks = split_text(text)
    if not chunks:
        return

    DocumentChunk.objects.filter(document_id=document_id).delete()
    delete_document_from_chroma(document_id)

    chroma_records = []
    seen_hashes = set()

    for idx, chunk in enumerate(chunks):
        chunk_hash = hashlib.sha256(chunk.encode("utf-8")).hexdigest()
        if chunk_hash in seen_hashes:
            continue
        seen_hashes.add(chunk_hash)

        embedding = generate_embedding(chunk)

        DocumentChunk.objects.create(
            project_id=project_id,
            document_id=document_id,
            content=chunk,
            embedding=embedding,
            content_hash=chunk_hash,
            doc_hash=file_hash,
            chunk_index=idx,
        )

        if embedding:
            chroma_records.append({
                "id": f"doc_{document_id}_chunk_{idx}",
                "content": chunk,
                "embedding": embedding,
                "metadata": {
                    "project_id": str(project_id),
                    "document_id": str(document_id),
                    "filename": str(filename),
                    "chunk_index": int(idx),
                    "content_hash": str(chunk_hash),
                    "doc_hash": str(file_hash),
                }
            })

    if chroma_records:
        index_chunks_in_chroma(chroma_records)

def index_project_documents(project_id, authorization_header):
    """
    Synchronizes project documents:
    - Deletes removed documents.
    - Re-indexes modified documents (using SHA256 file_hash comparison).
    - Indexes newly added documents.
    """
    try:
        documents = get_project_documents(project_id, authorization_header)
    except Exception:
        return

    if not isinstance(documents, list):
        return

    current_document_ids = [
        doc["id"] for doc in documents if isinstance(doc, dict) and "id" in doc
    ]

    deleted_chunks = DocumentChunk.objects.filter(project_id=project_id).exclude(
        document_id__in=current_document_ids
    )
    deleted_doc_ids = set(deleted_chunks.values_list("document_id", flat=True))
    for del_id in deleted_doc_ids:
        delete_document_from_chroma(del_id)
    deleted_chunks.delete()

    for document in documents:
        if not isinstance(document, dict):
            continue
        document_id = document.get("id")
        filename = document.get("filename") or document.get("name") or "document"

        if not document_id:
            continue

        try:
            file_bytes = download_document(document_id, authorization_header)
            if not file_bytes:
                continue

            file_hash = hashlib.sha256(file_bytes).hexdigest()

            existing_chunk = DocumentChunk.objects.filter(document_id=document_id).first()
            if existing_chunk and existing_chunk.doc_hash == file_hash:
                continue

            index_document(
                project_id=project_id,
                document_id=document_id,
                filename=filename,
                file_bytes=file_bytes,
                file_hash=file_hash,
            )
        except Exception as e:
            logger.warning(f"Error checking/indexing document {document_id}: {e}")


def tokenize_bm25(text):
    return [w for w in re.findall(r"\w+", text.lower()) if len(w) > 1]

class FallbackBM25:
    """Lightweight pure-python BM25Okapi implementation."""
    def __init__(self, corpus, k1=1.5, b=0.75):
        self.k1 = k1
        self.b = b
        self.corpus_size = len(corpus)
        self.avgdl = sum(len(doc) for doc in corpus) / self.corpus_size if self.corpus_size > 0 else 1.0
        self.doc_freqs = []
        self.idf = {}
        self.doc_len = [len(doc) for doc in corpus]

        df = {}
        for doc in corpus:
            frequencies = {}
            for word in doc:
                frequencies[word] = frequencies.get(word, 0) + 1
            self.doc_freqs.append(frequencies)
            for word in frequencies:
                df[word] = df.get(word, 0) + 1

        for word, freq in df.items():
            self.idf[word] = math.log((self.corpus_size - freq + 0.5) / (freq + 0.5) + 1)

    def get_scores(self, query):
        score = [0.0] * self.corpus_size
        for q in query:
            if q not in self.idf:
                continue
            q_idf = self.idf[q]
            for i, doc in enumerate(self.doc_freqs):
                freq = doc.get(q, 0)
                denom = freq + self.k1 * (1 - self.b + self.b * (self.doc_len[i] / self.avgdl))
                score[i] += q_idf * (freq * (self.k1 + 1)) / (denom or 1.0)
        return score

def get_bm25_model(corpus):
    try:
        from rank_bm25 import BM25Okapi
        return BM25Okapi(corpus)
    except Exception:
        return FallbackBM25(corpus)


def reciprocal_rank_fusion(dense_results, bm25_results, k=60):
    """
    Combines dense vector and BM25 sparse results using Reciprocal Rank Fusion:
    RRF_score(d) = sum( 1 / (k + rank(d)) )
    """
    scores = {}
    items_by_key = {}

    for rank, item in enumerate(dense_results):
        key = (item["document_id"], item["chunk_index"])
        scores[key] = scores.get(key, 0.0) + (1.0 / (k + rank + 1))
        items_by_key[key] = item

    for rank, item in enumerate(bm25_results):
        key = (item["document_id"], item["chunk_index"])
        scores[key] = scores.get(key, 0.0) + (1.0 / (k + rank + 1))
        items_by_key[key] = item

    sorted_keys = sorted(scores.keys(), key=lambda k_val: scores[k_val], reverse=True)
    return [items_by_key[k_val] for k_val in sorted_keys]

def cosine_similarity(vector_a, vector_b):
    if not vector_a or not vector_b or len(vector_a) != len(vector_b):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vector_a, vector_b))
    norm_a = math.sqrt(sum(a * a for a in vector_a))
    norm_b = math.sqrt(sum(b * b for b in vector_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def hybrid_retrieve_chunks(project_id, question, top_k=6):
    """
    Hybrid Retrieval Pipeline:
    1. Pre-filtering: Filter strictly by project_id before search.
    2. Dense Retrieval: ChromaDB query (or MySQL cosine fallback).
    3. Sparse Retrieval: BM25 on project chunks.
    4. Fusion: Reciprocal Rank Fusion (RRF).
    5. Re-ordering: Sort top chunks by document_id and chunk_index.
    """
    project_chunks_qs = list(DocumentChunk.objects.filter(project_id=project_id))
    if not project_chunks_qs:
        return []

    if len(project_chunks_qs) <= 10:
        project_chunks_qs.sort(key=lambda c: (c.document_id, c.chunk_index, c.id))
        return [
            {
                "document_id": c.document_id,
                "chunk_index": c.chunk_index,
                "content": c.content,
                "id": c.id,
            }
            for c in project_chunks_qs
        ]

    question_embedding = generate_embedding(question)

    dense_results = []
    chroma_collection = get_chroma_collection()

    if chroma_collection and question_embedding:
        try:
            query_res = chroma_collection.query(
                query_embeddings=[question_embedding],
                where={"project_id": str(project_id)},
                n_results=min(top_k * 2, len(project_chunks_qs)),
            )
            if query_res and query_res["documents"] and query_res["documents"][0]:
                for doc_text, meta in zip(query_res["documents"][0], query_res["metadatas"][0]):
                    dense_results.append({
                        "document_id": int(meta.get("document_id", 0)),
                        "chunk_index": int(meta.get("chunk_index", 0)),
                        "content": doc_text,
                    })
        except Exception as e:
            logger.warning(f"Chroma query failed, falling back to MySQL: {e}")

    if not dense_results and question_embedding:
        scored = []
        for c in project_chunks_qs:
            if c.embedding:
                score = cosine_similarity(question_embedding, c.embedding)
                scored.append((score, c))
        scored.sort(key=lambda item: item[0], reverse=True)
        dense_results = [
            {
                "document_id": c.document_id,
                "chunk_index": c.chunk_index,
                "content": c.content,
            }
            for _, c in scored[:top_k * 2]
        ]

    tokenized_corpus = [tokenize_bm25(c.content) for c in project_chunks_qs]
    bm25 = get_bm25_model(tokenized_corpus)
    tokenized_query = tokenize_bm25(question)
    bm25_scores = bm25.get_scores(tokenized_query)

    scored_bm25 = [
        (bm25_scores[i], project_chunks_qs[i])
        for i in range(len(project_chunks_qs))
    ]
    scored_bm25.sort(key=lambda item: item[0], reverse=True)

    bm25_results = [
        {
            "document_id": c.document_id,
            "chunk_index": c.chunk_index,
            "content": c.content,
        }
        for _, c in scored_bm25[:top_k * 2]
    ]

    fused_chunks = reciprocal_rank_fusion(dense_results, bm25_results, k=60)
    selected = fused_chunks[:top_k]

    selected.sort(key=lambda item: (item["document_id"], item["chunk_index"]))
    return selected

def retrieve_relevant_chunks(project_id, question, top_k=6):
    return hybrid_retrieve_chunks(project_id, question, top_k=top_k)

def build_context(chunks):
    if not chunks:
        return ""
    if isinstance(chunks[0], dict):
        return "\n\n".join(chunk["content"] for chunk in chunks)
    return "\n\n".join(chunk.content for chunk in chunks)


def answer_general_question(question, conversation_history=""):
    history_section = ""
    if conversation_history:
        history_section = f"\nRecent Conversation History:\n{conversation_history}\n"

    prompt = f"""You are a professional, helpful, and concise AI assistant.
Answer the following question in a clear, well-structured, and accurate manner.

Rules:
- Always answer in the exact same language as the user's question (e.g., if asked in French, reply in French; if asked in English, reply in English).
{history_section}
User Question:
{question}"""
    return generate_answer(prompt)

def answer_project_question(project_id, question, authorization_header, project_data=None, conversation_history=""):
    if not project_data:
        try:
            project_data = get_project(project_id, authorization_header)
        except Exception:
            project_data = {}

    from django.utils import timezone
    current_date_str = timezone.now().strftime("%Y-%m-%d")

    project_name = project_data.get("name", f"Project #{project_id}")
    project_desc = project_data.get("description", "No description provided.")
    project_status = project_data.get("status", "Not defined")
    project_priority = project_data.get("priority", "Not defined")
    project_start_date = project_data.get("start_date", "Not defined")
    project_deadline = project_data.get("deadline", "Not defined")

    tasks = get_project_tasks(project_id, authorization_header)
    tasks_text_parts = []
    if isinstance(tasks, list) and tasks:
        for t in tasks:
            t_title = t.get("title", "")
            t_desc = t.get("description", "").strip() if t.get("description") else ""
            t_status = t.get("status", "")
            t_priority = t.get("priority", "")
            t_assignee = t.get("assignee_name") or (f"User #{t.get('assignee_id')}" if t.get('assignee_id') else "Unassigned")
            t_deadline = t.get("deadline", "None")
            desc_part = f" | Description: {t_desc}" if t_desc else ""
            tasks_text_parts.append(f"- Task: {t_title}{desc_part} | Status: {t_status} | Priority: {t_priority} | Assigned to: {t_assignee} | Deadline: {t_deadline}")
        tasks_text = "\n".join(tasks_text_parts)
    else:
        tasks_text = "No tasks recorded for this project."

    members = get_project_members(project_id, authorization_header)
    members_text_parts = []
    if isinstance(members, list) and members:
        for m in members:
            name = f"{m.get('first_name', '')} {m.get('last_name', '')}".strip() or "Member"
            email = m.get('email', '')
            role = m.get('role', 'Member')
            email_part = f" | Email: {email}" if email else ""
            members_text_parts.append(f"- {name}{email_part} (Role: {role})")
        members_text = "\n".join(members_text_parts)
    else:
        members_text = "Member information not available."

    try:
        index_project_documents(project_id, authorization_header)
    except Exception as e:
        logger.warning(f"Project indexing error: {e}")

    relevant_chunks = retrieve_relevant_chunks(project_id, question)
    doc_context = build_context(relevant_chunks)
    if not doc_context:
        doc_context = "No relevant documents indexed for this project."

    history_section = ""
    if conversation_history:
        history_section = f"\nRecent Conversation History:\n{conversation_history}\n"

    prompt = f"""You are the collaborative AI assistant for project "{project_name}".
Here is all available context regarding this project:

Current Server Date: {current_date_str}

General Project Information:
- Name: {project_name}
- Description: {project_desc}
- Status: {project_status}
- Priority: {project_priority}
- Start Date: {project_start_date}
- Deadline: {project_deadline}

Project Team Members:
{members_text}

Project Tasks:
{tasks_text}

Relevant Document Extracts (RAG Hybrid Retrieval):
{doc_context}
{history_section}
User Question:
{question}

Instructions:
- Always answer in the exact same language as the user's question (e.g., if asked in French, reply in French).
- Provide a clear, concise, helpful, and professional answer.
- Temporal awareness: Today's date is {current_date_str}. When answering about overdue tasks, upcoming deadlines, or timeline progress, strictly compare each task or project deadline to this date ({current_date_str}).
- If the question asks about project progress, tasks (overdue tasks, todo tasks, assignments), use the tasks list and their deadlines.
- If the question asks about requirements, specifications, or document contents, use the provided document extracts.
- If the question asks for a summary, synthesize the project goals, team, task completion status, and key documents.
- If information is not present in the provided data, state it politely without inventing data."""

    return generate_answer(prompt)
