import logging
import threading
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def _send_post_webhook(url, payload, headers):
    try:
        requests.post(url, json=payload, headers=headers, timeout=5)
    except Exception as e:
        logger.warning(f"Failed to send document index webhook to AI service ({url}): {e}")


def _send_delete_webhook(url, headers):
    try:
        requests.delete(url, headers=headers, timeout=5)
    except Exception as e:
        logger.warning(f"Failed to send document delete webhook to AI service ({url}): {e}")


def notify_document_created(document_id, project_id, filename):
    ai_url = getattr(settings, "AI_SERVICE_URL", "http://ai-service:8000")
    if not ai_url:
        return

    url = f"{ai_url.rstrip('/')}/internal/documents/index/"
    token = getattr(settings, "INTERNAL_SERVICE_TOKEN", "")
    headers = {
        "X-Internal-Token": token,
        "Content-Type": "application/json",
    }
    payload = {
        "document_id": document_id,
        "project_id": project_id,
        "filename": filename,
    }

    thread = threading.Thread(
        target=_send_post_webhook,
        args=(url, payload, headers),
        daemon=True,
    )
    thread.start()


def notify_document_deleted(document_id, project_id=None):
    ai_url = getattr(settings, "AI_SERVICE_URL", "http://ai-service:8000")
    if not ai_url:
        return

    url = f"{ai_url.rstrip('/')}/internal/documents/{document_id}/"
    token = getattr(settings, "INTERNAL_SERVICE_TOKEN", "")
    headers = {
        "X-Internal-Token": token,
    }

    thread = threading.Thread(
        target=_send_delete_webhook,
        args=(url, headers),
        daemon=True,
    )
    thread.start()
