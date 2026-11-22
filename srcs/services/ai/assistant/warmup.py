import os
import sys
import time
import threading
import logging

logger = logging.getLogger(__name__)

WARMUP_STATUS = "idle"
_warmup_lock = threading.Lock()
_warmup_started = False


def get_warmup_status():
    return WARMUP_STATUS


def start_warmup_thread():
    global _warmup_started
    with _warmup_lock:
        if _warmup_started:
            return
        _warmup_started = True

    thread = threading.Thread(target=_run_warmup, daemon=True, name="ai_warmup_thread")
    thread.start()


def _run_warmup():
    global WARMUP_STATUS
    WARMUP_STATUS = "warming_up"
    logger.info("Starting AI service warmup background thread...")
    t0 = time.time()

    time.sleep(1.0)

    try:
        try:
            from .rag import get_chroma_collection
            coll = get_chroma_collection()
            if coll:
                try:
                    dummy_vec = [0.0] * 768
                    coll.query(query_embeddings=[dummy_vec], n_results=1)
                except Exception:
                    pass
                logger.info("ChromaDB collection warmed up.")
        except Exception as e:
            logger.warning(f"ChromaDB warmup warning: {e}")

        try:
            from .gemini_service import generate_embedding
            generate_embedding("warmup ping", task_type="RETRIEVAL_QUERY", dimension=768)
            logger.info("Gemini Embedding client warmed up.")
        except Exception as e:
            logger.warning(f"Gemini Embedding warmup warning: {e}")

        try:
            from .gemini_service import generate_answer
            generate_answer("ping", max_output_tokens=5)
            logger.info("Gemini LLM generation client warmed up.")
        except Exception as e:
            logger.warning(f"Gemini LLM generation warmup warning: {e}")

        try:
            from .rag import warm_bm25_cache_for_all_projects
            warm_bm25_cache_for_all_projects()
            logger.info("BM25 cache warmed up for existing projects.")
        except Exception as e:
            logger.warning(f"BM25 warmup warning: {e}")

        WARMUP_STATUS = "ready"
        logger.info(f"AI service warmup completed in {time.time() - t0:.2f}s. Service is READY.")
    except Exception as e:
        logger.warning(f"Unexpected error during warmup: {e}")
        WARMUP_STATUS = "failed"
