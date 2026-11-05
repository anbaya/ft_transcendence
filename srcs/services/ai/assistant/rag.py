import math
import re
import os
import time
import hashlib
import logging
import threading
import concurrent.futures
from django.conf import settings
from .models import DocumentChunk
from .document_extractor import extract_text, clean_text
from .gemini_service import generate_embedding, generate_embeddings_batch, generate_answer, rewrite_followup_question
from .document_service import get_project_documents, download_document
from .project_service import get_project, get_project_tasks, get_project_members

logger = logging.getLogger(__name__)

_indexing_lock = threading.Lock()
_active_document_indexing = set()
_active_project_syncing = set()

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

def reset_chroma_collection():
    client = get_chroma_client()
    if client is None:
        return
    try:
        client.delete_collection("project_documents")
        logger.info("Deleted project_documents Chroma collection due to dimension reset.")
    except Exception as e:
        logger.warning(f"Error deleting Chroma collection for reset: {e}")

def delete_document_from_chroma(document_id):
    collection = get_chroma_collection()
    if collection is None:
        return
    try:
        collection.delete(where={"document_id": str(document_id)})
    except Exception as e:
        logger.warning(f"Error deleting doc {document_id} from Chroma: {e}")

def get_project_embedding_model(project_id, default="gemini-embedding-2-preview"):
    """
    Retrieves the embedding model name stored in Chroma metadata for this project.
    Guarantees that questions for a project are always embedded with the exact
    same model used when indexing that project.
    """
    collection = get_chroma_collection()
    if collection:
        try:
            res = collection.get(where={"project_id": str(project_id)}, limit=1, include=["metadatas"])
            if res and res["metadatas"] and res["metadatas"][0]:
                saved_model = res["metadatas"][0].get("embedding_model")
                if saved_model:
                    return saved_model
        except Exception as e:
            logger.debug(f"Could not read embedding model from project metadata: {e}")
    return default

def index_chunks_in_chroma(chunks_data):
    collection = get_chroma_collection()
    if collection is None or not chunks_data:
        return
    ids = [c["id"] for c in chunks_data]
    documents = [c["content"] for c in chunks_data]
    embeddings = [c["embedding"] for c in chunks_data]
    metadatas = [c["metadata"] for c in chunks_data]
    try:
        collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )
    except Exception as e:
        if "dimension" in str(e).lower():
            logger.warning(f"Chroma dimension mismatch detected ({e}). Resetting collection and retrying upsert.")
            reset_chroma_collection()
            new_coll = get_chroma_collection()
            if new_coll:
                try:
                    new_coll.upsert(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)
                except Exception as retry_err:
                    logger.error(f"Failed upserting chunks after collection reset: {retry_err}")
        else:
            logger.warning(f"Error upserting chunks in Chroma: {e}")


def split_text(text, chunk_size=1200, overlap=200):
    """
    Splits text into chunks using natural semantic boundaries (paragraphs, newlines, sentences).
    Guarantees that start strictly increases (start_new > start_old) on every iteration.
    No document-specific section title prefixes are added.
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

        # Search for boundary in the end region of the window
        search_start = max(start, end - 350)
        boundary = text.rfind("\n\n", search_start, end)
        if boundary == -1 or boundary <= start:
            boundary = text.rfind("\n", search_start, end)
        if boundary == -1 or boundary <= start:
            boundary = text.rfind(". ", search_start, end)
            if boundary != -1:
                boundary += 1

        if boundary > start and (boundary - overlap) > start:
            chunk = text[start:boundary].strip()
            if chunk:
                chunks.append(chunk)
            next_start = boundary - overlap
        else:
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            next_start = end - overlap

        # Absolute guarantee that start strictly increases
        if next_start <= start:
            next_start = start + 1
        start = next_start

    return [c for c in chunks if c]


def is_table_of_contents_chunk(text: str) -> bool:
    """
    Detects if a chunk belongs to a Table of Contents, List of Figures, or List of Tables.
    Generically checks for repetitive leader dots (e.g. '. . . . 42' or '.... 15')
    or a high proportion of lines ending with page numbers preceded by dots.
    """
    if not text:
        return False
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        return False

    leader_dot_lines = 0
    for line in lines:
        if re.search(r"(?:\.\s*){3,}\s*\d+$", line) or re.search(r"\.{3,}\s*\d+$", line):
            leader_dot_lines += 1

    ratio = leader_dot_lines / len(lines)
    total_dot_sequences = len(re.findall(r"(?:\.\s*){4,}", text))

    return (ratio >= 0.30 and leader_dot_lines >= 4) or total_dot_sequences >= 6


def index_document(project_id, document_id, filename, file_bytes, file_hash=None, batch_size=8):
    """
    Indexes document text into DocumentChunk (MySQL) and ChromaDB in batches (default 8).
    Saves to both MySQL and ChromaDB at each batch with progress logs.
    """
    if not file_hash:
        file_hash = hashlib.sha256(file_bytes).hexdigest()

    text = extract_text(file_bytes, filename)
    if not text:
        logger.warning(f"No text extracted for document {document_id} ({filename})")
        return

    chunks = split_text(text, chunk_size=1200, overlap=200)
    if not chunks:
        logger.warning(f"No chunks produced for document {document_id} ({filename})")
        return

    # Deduplicate chunks while preserving order, filtering out Table of Contents / List of Tables / Figures chunks
    deduped_chunks = []
    seen_hashes = set()
    for chunk in chunks:
        if is_table_of_contents_chunk(chunk):
            logger.info(f"Skipping Table of Contents / List chunk for document {document_id} ({filename})")
            continue
        chash = hashlib.sha256(chunk.encode("utf-8")).hexdigest()
        if chash not in seen_hashes:
            seen_hashes.add(chash)
            deduped_chunks.append((chunk, chash))

    total_chunks = len(deduped_chunks)
    total_batches = (total_chunks + batch_size - 1) // batch_size
    logger.info(
        f"Indexing document {document_id} ({filename}): {total_chunks} chunks to process "
        f"in {total_batches} batches of up to {batch_size}."
    )

    # Clean existing data for this document before inserting new version
    DocumentChunk.objects.filter(document_id=document_id).delete()
    delete_document_from_chroma(document_id)

    embedding_model = os.environ.get("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2-preview").strip() or "gemini-embedding-2-preview"

    for batch_idx in range(total_batches):
        batch_slice = deduped_chunks[batch_idx * batch_size : (batch_idx + 1) * batch_size]
        batch_texts = [item[0] for item in batch_slice]
        batch_hashes = [item[1] for item in batch_slice]

        embeddings_results = generate_embeddings_batch(
            batch_texts,
            task_type="RETRIEVAL_DOCUMENT",
            dimension=768,
            model_name=embedding_model,
        )

        db_records = []
        chroma_records = []

        for offset, (chunk, chash) in enumerate(zip(batch_texts, batch_hashes)):
            global_idx = batch_idx * batch_size + offset
            embedding, is_fallback = embeddings_results[offset]
            actual_doc_hash = f"fallback_{file_hash[:55]}" if is_fallback else file_hash

            db_records.append(
                DocumentChunk(
                    project_id=project_id,
                    document_id=document_id,
                    content=chunk,
                    embedding=embedding,
                    content_hash=chash,
                    doc_hash=actual_doc_hash,
                    chunk_index=global_idx,
                )
            )

            if embedding:
                chroma_records.append({
                    "id": f"doc_{document_id}_chunk_{global_idx}",
                    "content": chunk,
                    "embedding": embedding,
                    "metadata": {
                        "project_id": str(project_id),
                        "document_id": str(document_id),
                        "filename": str(filename),
                        "chunk_index": int(global_idx),
                        "content_hash": str(chash),
                        "doc_hash": str(actual_doc_hash),
                        "is_fallback": str(is_fallback),
                        "embedding_model": str(embedding_model),
                    }
                })

        # Save batch to MySQL
        DocumentChunk.objects.bulk_create(db_records)

        # Save batch to ChromaDB
        if chroma_records:
            index_chunks_in_chroma(chroma_records)

        logger.info(
            f"Indexed batch {batch_idx + 1}/{total_batches} "
            f"({len(batch_slice)} chunks) for doc {document_id} ({filename}) [Chroma & MySQL written]"
        )
        if batch_idx + 1 < total_batches:
            time.sleep(2)

    invalidate_bm25_project_cache(project_id)
    logger.info(f"Completed indexing document {document_id} ({filename}): {total_chunks} chunks indexed successfully.")

def index_project_documents(project_id, authorization_header):
    """
    Safety net reconciliation function:
    - Purges orphaned chunks for documents no longer in document-service.
    - Indexes newly added documents not yet indexed or whose indexing failed.
    - Re-indexes modified documents (using SHA256 file_hash comparison).
    - Re-indexes legacy chunks with dimension != 768.
    Never run in the synchronous user query loop!
    """
    with _indexing_lock:
        if project_id in _active_project_syncing:
            logger.info(f"Reconciliation already running for project {project_id}.")
            return
        _active_project_syncing.add(project_id)

    try:
        documents = get_project_documents(project_id, authorization_header)
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
                if (
                    existing_chunk
                    and existing_chunk.doc_hash == file_hash
                    and existing_chunk.embedding
                    and len(existing_chunk.embedding) == 768
                ):
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
    finally:
        with _indexing_lock:
            _active_project_syncing.discard(project_id)
        from django.db import connections
        connections.close_all()


def index_single_document_by_id(project_id, document_id, filename=None, authorization_header=None):
    """
    Downloads and indexes a single document asynchronously (triggered by webhook).
    Guarded by per-document lock to prevent concurrent redundant indexing.
    """
    with _indexing_lock:
        if document_id in _active_document_indexing:
            logger.info(f"Document {document_id} is already being indexed. Skipping duplicate concurrent run.")
            return False
        _active_document_indexing.add(document_id)

    try:
        file_bytes = download_document(document_id, authorization_header)
        if not file_bytes:
            logger.warning(f"Could not download document {document_id} for indexing.")
            return False

        file_hash = hashlib.sha256(file_bytes).hexdigest()
        existing_chunk = DocumentChunk.objects.filter(document_id=document_id).first()
        if (
            existing_chunk
            and existing_chunk.doc_hash == file_hash
            and existing_chunk.embedding
            and len(existing_chunk.embedding) == 768
        ):
            logger.info(f"Document {document_id} already indexed and unchanged (hash match & dim 768).")
            return True

        index_document(
            project_id=project_id,
            document_id=document_id,
            filename=filename or f"doc_{document_id}",
            file_bytes=file_bytes,
            file_hash=file_hash,
        )
        logger.info(f"Successfully indexed document {document_id} for project {project_id}.")
        return True
    except Exception as e:
        logger.error(f"Error in index_single_document_by_id ({document_id}): {e}")
        return False
    finally:
        with _indexing_lock:
            _active_document_indexing.discard(document_id)
        from django.db import connections
        connections.close_all()


def delete_single_document_data(document_id):
    """
    Purges document chunks from MySQL and ChromaDB upon deletion webhook.
    """
    try:
        project_ids = list(
            DocumentChunk.objects.filter(document_id=document_id).values_list("project_id", flat=True).distinct()
        )
        DocumentChunk.objects.filter(document_id=document_id).delete()
        delete_document_from_chroma(document_id)
        for pid in project_ids:
            invalidate_bm25_project_cache(pid)
        logger.info(f"Successfully deleted chunks for document {document_id}.")
        return True
    except Exception as e:
        logger.error(f"Error deleting chunks for document {document_id}: {e}")
        return False
    finally:
        from django.db import connections
        connections.close_all()


STOPWORDS_FR = {
    "le", "la", "les", "un", "une", "des", "du", "de", "d", "l", "et", "ou", "en", "dans",
    "pour", "par", "sur", "avec", "sans", "est", "sont", "cette", "ce", "ces", "qui", "que",
    "quoi", "dont", "ou", "qu", "a", "au", "aux", "ne", "pas", "plus", "se", "sa", "son", "ses",
    "leur", "leurs", "nous", "vous", "ils", "elles", "mon", "ton", "y", "si", "tout", "tous",
    "comme", "mais", "aussi", "donc", "car", "ni", "soit", "faire", "fait", "ete", "avoir", "etre",
}

STOPWORDS_EN = {
    "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "without", "is",
    "are", "was", "were", "this", "that", "these", "those", "it", "its", "of", "by", "from",
    "what", "how", "when", "where", "which", "who", "whom", "whose", "why", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "can", "could", "will", "would", "should", "shall",
    "so", "than", "too", "very", "just", "about", "into", "through", "during", "before", "after",
}

ALL_STOPWORDS = STOPWORDS_FR | STOPWORDS_EN

def light_stem(word):
    """Lightweight rule-based suffix normalizer for French and English."""
    if len(word) <= 3:
        return word
    if word.endswith("eaux") or word.endswith("aux"):
        return word[:-3]
    if word.endswith("es") and len(word) > 4:
        return word[:-2]
    if word.endswith("ing") and len(word) > 5:
        return word[:-3]
    if word.endswith("ed") and len(word) > 4:
        return word[:-2]
    if word.endswith("s") and len(word) > 3:
        return word[:-1]
    return word

def tokenize_bm25(text):
    raw_words = re.findall(r"\w+", text.lower())
    tokens = []
    for w in raw_words:
        if (len(w) > 1 or w.isdigit()) and w not in ALL_STOPWORDS:
            tokens.append(light_stem(w))
    if not tokens:
        tokens = [w for w in raw_words if len(w) > 1 or w.isdigit()]
    return tokens

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
    Attaches '_rrf_score' to each result for fair-quota arbitration across documents.
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
    results = []
    for k_val in sorted_keys:
        item_copy = dict(items_by_key[k_val])
        item_copy["_rrf_score"] = scores[k_val]
        results.append(item_copy)
    return results


def merge_with_fair_quota(doc_ranked_lists, top_k=8):
    """
    Equitable quota fusion across documents:
    - Base quota = top_k // num_docs per document.
    - Any unused slots (or remainder when top_k % num_docs != 0) are redistributed
      to documents that still have chunks available, prioritized by RRF score.
    - With only 1 document, behavior is identical to today (all top_k slots).
    """
    if not doc_ranked_lists:
        return []

    num_docs = len(doc_ranked_lists)
    if num_docs == 1:
        return list(doc_ranked_lists.values())[0][:top_k]

    base_quota = max(1, top_k // num_docs)
    selected = []
    selected_keys = set()
    remaining_by_doc = {}

    # Round 1: Take up to base_quota per document
    for doc_id, ranked_chunks in doc_ranked_lists.items():
        take_count = min(base_quota, len(ranked_chunks))
        for item in ranked_chunks[:take_count]:
            key = (item["document_id"], item["chunk_index"])
            if key not in selected_keys:
                selected.append(item)
                selected_keys.add(key)
        remaining_by_doc[doc_id] = list(ranked_chunks[take_count:])

    # Round 2: Redistribute unused slots to documents with remaining chunks
    while len(selected) < top_k:
        best_doc = None
        best_score = -1.0
        best_item = None
        for doc_id, rem_list in remaining_by_doc.items():
            if rem_list:
                item = rem_list[0]
                score = item.get("_rrf_score", 0.0)
                if score > best_score:
                    best_score = score
                    best_doc = doc_id
                    best_item = item
        if not best_item or best_doc is None:
            break
        key = (best_item["document_id"], best_item["chunk_index"])
        if key not in selected_keys:
            selected.append(best_item)
            selected_keys.add(key)
        remaining_by_doc[best_doc].pop(0)

    return selected[:top_k]

def cosine_similarity(vector_a, vector_b):
    if not vector_a or not vector_b or len(vector_a) != len(vector_b):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vector_a, vector_b))
    norm_a = math.sqrt(sum(a * a for a in vector_a))
    norm_b = math.sqrt(sum(b * b for b in vector_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

_bm25_project_cache = {}  # {project_id: {"version": (count, max_id), "bm25": ..., "doc_bm25_map": ..., "project_chunks_qs": ..., "doc_chunks_map": ..., "doc_names_map": ...}}

def get_project_chunks_version(project_id):
    """
    Returns a lightweight version tuple (chunks_count, max_chunk_id) from DB.
    Indexed query on (project_id), sub-millisecond execution.
    """
    try:
        from django.db.models import Count, Max
        agg = DocumentChunk.objects.filter(project_id=project_id).aggregate(
            c_count=Count("id"),
            max_id=Max("id")
        )
        return (agg.get("c_count") or 0, agg.get("max_id") or 0)
    except Exception as e:
        logger.warning(f"Error checking project chunks version: {e}")
        return None

def invalidate_bm25_project_cache(project_id=None):
    if project_id is not None:
        _bm25_project_cache.pop(int(project_id), None)
    else:
        _bm25_project_cache.clear()

def build_project_bm25_cache(project_id, authorization_header=None):
    current_ver = get_project_chunks_version(project_id)
    project_chunks_qs = list(DocumentChunk.objects.filter(project_id=project_id))
    if not project_chunks_qs:
        return None

    doc_names_map = {}
    try:
        docs = get_project_documents(project_id, authorization_header)
        if isinstance(docs, list):
            for d in docs:
                d_id = d.get("id")
                d_name = d.get("name") or d.get("filename")
                if not d_name and d.get("file"):
                    d_name = str(d.get("file")).split("/")[-1]
                if d_id and d_name:
                    doc_names_map[int(d_id)] = d_name
    except Exception as e:
        logger.warning(f"Failed to fetch real document filenames: {e}")

    tokenized_corpus = [tokenize_bm25(c.content) for c in project_chunks_qs]
    bm25 = get_bm25_model(tokenized_corpus)

    doc_chunks_map = {}
    for c in project_chunks_qs:
        doc_chunks_map.setdefault(c.document_id, []).append(c)

    doc_bm25_map = {}
    for doc_id, d_chunks in doc_chunks_map.items():
        doc_tokens = [tokenize_bm25(c.content) for c in d_chunks]
        doc_bm25_map[doc_id] = get_bm25_model(doc_tokens)

    cache_entry = {
        "version": current_ver,
        "bm25": bm25,
        "doc_bm25_map": doc_bm25_map,
        "project_chunks_qs": project_chunks_qs,
        "doc_chunks_map": doc_chunks_map,
        "doc_names_map": doc_names_map,
    }
    _bm25_project_cache[int(project_id)] = cache_entry
    return cache_entry

def warm_bm25_cache_for_all_projects():
    """
    Pre-builds BM25 indexes for all projects having chunks in DB.
    Called during application warmup.
    """
    try:
        project_ids = list(DocumentChunk.objects.values_list("project_id", flat=True).distinct())
        for pid in project_ids:
            try:
                build_project_bm25_cache(pid)
            except Exception as e:
                logger.warning(f"Failed to warm BM25 for project {pid}: {e}")
    except Exception as e:
        logger.warning(f"Failed to fetch project IDs for BM25 warmup: {e}")

def hybrid_retrieve_chunks(project_id, question, top_k=8, authorization_header=None):
    """
    Hybrid Retrieval Pipeline:
    1. Pre-filtering: Filter strictly by project_id before search.
    2. Dense Retrieval: ChromaDB query (or MySQL cosine fallback).
    3. Sparse Retrieval: BM25 on project chunks.
    4. Fusion: Reciprocal Rank Fusion (RRF).
    5. Re-ordering: Sort top chunks by document_id and chunk_index.
    """
    current_ver = get_project_chunks_version(project_id)
    cached = _bm25_project_cache.get(int(project_id)) if project_id else None

    if cached and current_ver is not None and cached.get("version") == current_ver:
        bm25 = cached["bm25"]
        doc_bm25_map = cached.get("doc_bm25_map", {})
        project_chunks_qs = cached["project_chunks_qs"]
        doc_chunks_map = cached["doc_chunks_map"]
        doc_names_map = cached["doc_names_map"]
    else:
        cached = build_project_bm25_cache(project_id, authorization_header)
        if not cached:
            return []
        bm25 = cached["bm25"]
        doc_bm25_map = cached.get("doc_bm25_map", {})
        project_chunks_qs = cached["project_chunks_qs"]
        doc_chunks_map = cached["doc_chunks_map"]
        doc_names_map = cached["doc_names_map"]

    question_embedding, _ = generate_embedding(
        question,
        task_type="RETRIEVAL_QUERY",
        dimension=768,
        model_name="gemini-embedding-2-preview",
    )
    if not question_embedding:
        logger.warning(
            "Question embedding failed with gemini-embedding-2-preview; skipping dense retrieval and relying solely on BM25."
        )

    # Group chunks by document_id for per-document dense/sparse search & fair quotas
    doc_chunks_map = {}
    for c in project_chunks_qs:
        doc_chunks_map.setdefault(c.document_id, []).append(c)

    doc_ids = list(doc_chunks_map.keys())
    num_docs = len(doc_ids)

    chroma_collection = get_chroma_collection()
    tokenized_query = tokenize_bm25(question)
    doc_ranked_lists = {}

    for doc_id, doc_chunks in doc_chunks_map.items():
        # a) Dense Retrieval filtered by document_id
        dense_results = []
        if chroma_collection and question_embedding:
            try:
                where_clause = {
                    "$and": [
                        {"project_id": str(project_id)},
                        {"document_id": str(doc_id)}
                    ]
                } if num_docs > 1 else {"project_id": str(project_id)}
                query_res = chroma_collection.query(
                    query_embeddings=[question_embedding],
                    where=where_clause,
                    n_results=min(top_k * 2, len(doc_chunks)),
                )
                if query_res and query_res["documents"] and query_res["documents"][0]:
                    for doc_text, meta in zip(query_res["documents"][0], query_res["metadatas"][0]):
                        doc_id_val = int(meta.get("document_id", doc_id))
                        real_fname = doc_names_map.get(doc_id_val) or str(meta.get("filename") or f"Document #{doc_id_val}")
                        dense_results.append({
                            "document_id": doc_id_val,
                            "chunk_index": int(meta.get("chunk_index", 0)),
                            "filename": real_fname,
                            "content": doc_text,
                        })
            except Exception as e:
                logger.warning(f"Chroma query failed for doc {doc_id}: {e}")

        if not dense_results and question_embedding:
            scored = []
            for c in doc_chunks:
                if c.embedding:
                    score = cosine_similarity(question_embedding, c.embedding)
                    scored.append((score, c))
            scored.sort(key=lambda item: item[0], reverse=True)
            dense_results = [
                {
                    "document_id": c.document_id,
                    "chunk_index": c.chunk_index,
                    "filename": doc_names_map.get(c.document_id) or f"Document #{c.document_id}",
                    "content": c.content,
                }
                for _, c in scored[:top_k * 2]
            ]

        # b) Sparse Retrieval (BM25) on this document's chunks alone
        bm25_doc_model = doc_bm25_map.get(doc_id)
        if not bm25_doc_model:
            tokenized_doc_corpus = [tokenize_bm25(c.content) for c in doc_chunks]
            bm25_doc_model = get_bm25_model(tokenized_doc_corpus)
        doc_bm25_scores = bm25_doc_model.get_scores(tokenized_query)

        scored_bm25 = [
            (doc_bm25_scores[i], doc_chunks[i])
            for i in range(len(doc_chunks))
        ]
        scored_bm25.sort(key=lambda item: item[0], reverse=True)

        bm25_results = [
            {
                "document_id": c.document_id,
                "chunk_index": c.chunk_index,
                "filename": doc_names_map.get(c.document_id) or f"Document #{c.document_id}",
                "content": c.content,
            }
            for _, c in scored_bm25[:top_k * 2]
        ]

        # c) RRF per document
        doc_ranked_lists[doc_id] = reciprocal_rank_fusion(dense_results, bm25_results, k=60)

    # d) Fusion with equitable quota per document
    top_core = merge_with_fair_quota(doc_ranked_lists, top_k=top_k)

    chunk_lookup = {
        (c.document_id, c.chunk_index): {
            "id": f"doc_{c.document_id}_chunk_{c.chunk_index}",
            "document_id": c.document_id,
            "chunk_index": c.chunk_index,
            "filename": doc_names_map.get(c.document_id) or f"Document #{c.document_id}",
            "content": c.content,
        }
        for c in project_chunks_qs
    }

    selected_map = {}
    for rank, chunk in enumerate(top_core):
        key = (chunk["document_id"], chunk["chunk_index"])
        selected_map[key] = (chunk, float(rank))

    # 1. Expansion par chunk PRÉCÉDENT seulement pour le top 3 (rank 0, 1, 2)
    # Priorité 20.0 + rank pour être élagué en premier si le plafond est atteint
    for rank, chunk in enumerate(top_core[:3]):
        doc_id = chunk["document_id"]
        c_idx = chunk["chunk_index"]
        p_key = (doc_id, c_idx - 1)
        if p_key in chunk_lookup and p_key not in selected_map:
            selected_map[p_key] = (chunk_lookup[p_key], 20.0 + rank)

    # 2. Expansion par chunk SUIVANT pour TOUS les chunks retenus (rank 0..top_k-1)
    # Priorité rank + 0.5 (suit immédiatement son chunk parent)
    for rank, chunk in enumerate(top_core):
        doc_id = chunk["document_id"]
        c_idx = chunk["chunk_index"]
        n_key = (doc_id, c_idx + 1)
        if n_key in chunk_lookup and n_key not in selected_map:
            selected_map[n_key] = (chunk_lookup[n_key], float(rank) + 0.5)

    candidate_items = list(selected_map.values())

    def compute_context_len(items):
        return sum(len(f"[Document: {it.get('filename')}]:\n{it.get('content', '').strip()}\n\n") for it in items)

    # Tri par priorité croissante : les priorités les plus élevées (voisins les moins bien classés) en fin de liste
    candidate_items.sort(key=lambda x: x[1])

    # 5. Plafond de caractères : permet d'intégrer les chunks voisins (ex: suite d'une section)
    # sans les tronquer prématurément (35000 pour requêtes larges/globales, 25000 pour requêtes standards)
    max_context_chars = 35000 if top_k > 8 else 25000
    while candidate_items and compute_context_len([x[0] for x in candidate_items]) > max_context_chars:
        candidate_items.pop()

    # Déduplication par id déjà assurée par selected_map, puis tri par chunk_index
    final_chunks = [x[0] for x in candidate_items]
    final_chunks.sort(key=lambda item: (item["document_id"], item["chunk_index"]))
    return final_chunks

def retrieve_relevant_chunks(project_id, question, top_k=8, authorization_header=None):
    return hybrid_retrieve_chunks(project_id, question, top_k=top_k, authorization_header=authorization_header)

def build_context(chunks):
    if not chunks:
        return ""
    parts = []
    for chunk in chunks:
        if isinstance(chunk, dict):
            fname = chunk.get("filename") or f"Document #{chunk.get('document_id')}"
            c_idx = chunk.get("chunk_index")
            content = chunk.get("content", "").strip()
        else:
            fname = getattr(chunk, "filename", None) or f"Document #{getattr(chunk, 'document_id', '')}"
            c_idx = getattr(chunk, "chunk_index", None)
            content = chunk.content.strip()
        header = f"[Document: {fname}]"
        if c_idx is not None:
            header += f" (Extrait #{c_idx})"
        parts.append(f"{header}:\n{content}")
    return "\n\n---\n\n".join(parts)


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
    search_query = question
    if conversation_history:
        search_query = rewrite_followup_question(question, conversation_history)

    tasks = []
    members = []
    relevant_chunks = []
    project_info = project_data or {}

    def fetch_tasks():
        return get_project_tasks(project_id, authorization_header)

    def fetch_members():
        return get_project_members(project_id, authorization_header)

    # correction: extended is_broad detection to also trigger on "minor/major" listing questions
    # and also checks the rewritten search_query (not only the raw question)
    _BROAD_KEYWORDS = [
        "all", "tous", "toutes", "chaque", "every", "each",
        "all categories", "toutes les categories",
        "list all", "liste tous", "summary", "overview",
        "tous les modules", "all modules",
        "minor modules", "modules mineurs", "minor ones",
        "major modules", "modules majeurs",
        "all minor", "tous les mineurs", "all major", "tous les majeurs",
        "enumerate", "enumerez", "enumerate all",
    ]
    _check_broad = (question.lower() + " " + search_query.lower())
    is_broad = any(kw in _check_broad for kw in _BROAD_KEYWORDS)
    effective_top_k = 25 if is_broad else 8

    def fetch_chunks():
        from django.db import close_old_connections
        close_old_connections()
        try:
            return retrieve_relevant_chunks(project_id, search_query, top_k=effective_top_k, authorization_header=authorization_header)
        finally:
            close_old_connections()

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        fut_tasks = executor.submit(fetch_tasks)
        fut_members = executor.submit(fetch_members)
        fut_chunks = executor.submit(fetch_chunks)

        try:
            tasks = fut_tasks.result(timeout=10) or []
        except Exception as e:
            logger.warning(f"Error fetching tasks in parallel: {e}")

        try:
            members = fut_members.result(timeout=10) or []
        except Exception as e:
            logger.warning(f"Error fetching members in parallel: {e}")

        try:
            relevant_chunks = fut_chunks.result(timeout=25) or []
        except Exception as e:
            logger.warning(f"Error retrieving chunks in parallel: {e}")

    from django.utils import timezone
    current_date_str = timezone.now().strftime("%Y-%m-%d")

    project_name = project_info.get("name", f"Project #{project_id}")
    project_desc = project_info.get("description", "No description provided.")
    project_status = project_info.get("status", "Not defined")
    project_priority = project_info.get("priority", "Not defined")
    project_start_date = project_info.get("start_date", "Not defined")
    project_deadline = project_info.get("deadline", "Not defined")

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

    doc_context = build_context(relevant_chunks)
    if not doc_context:
        doc_context = "Aucun document pertinent n'est indexé pour ce projet (documentation vide ou absente)."

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
- Always answer in the exact same language as the user's question (e.g., if asked in French, reply in French; if asked in English, reply in English).
- Multi-Document Synthesis: If the excerpts come from several documents, answer for each document separately and name it. Answer only what is asked.
- Strict Grounding: Base your answer strictly and exclusively on the provided project information and document extracts. Never invent or hallucinate data.
- Information Not Available: If the user's question cannot be answered using the provided document extracts or project metadata, you MUST state clearly: "Cette information n'est pas mentionnée dans les documents du projet." (or in English: "This information is not mentioned in the project documentation."). Do not guess or extrapolate.
- Source Citation: When citing facts, modules, or information from document extracts, ALWAYS cite the real filename of the document as the resource (e.g. "[en.subject.pdf]" or "(Source: en.subject.pdf)"). NEVER cite generic labels like "[Document #1]" or "[Document 1]".
- Temporal awareness: Today's date is {current_date_str}. When answering about overdue tasks, upcoming deadlines, or timeline progress, strictly compare each task or project deadline to this date ({current_date_str}).
- Empty Documentation: If no documents or tasks exist for the question asked, explain politely that no related documentation or tasks are registered for this project."""

    return generate_answer(prompt)
