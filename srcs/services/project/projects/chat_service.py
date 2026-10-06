import requests
from django.conf import settings


def create_project_conversation(project_id):
    if not settings.CHAT_SERVICE_URL:
        raise RuntimeError("CHAT_SERVICE_URL not configured")
    url = (
        f"{settings.CHAT_SERVICE_URL.rstrip('/')}"
        f"/internal/projects/{project_id}/conversation/"
    )

    if not settings.INTERNAL_SERVICE_TOKEN:
        raise RuntimeError("INTERNAL_SERVICE_TOKEN not configured.")

    response = requests.post(
        url,
        headers={
            "X-Internal-Token": settings.INTERNAL_SERVICE_TOKEN
        },
        timeout=5
    )
    response.raise_for_status()

    return response.json()

def delete_project_conversation(project_id):
    if not settings.CHAT_SERVICE_URL:
        raise RuntimeError("CHAT_SERVICE_URL not configured.")

    if not settings.INTERNAL_SERVICE_TOKEN:
        raise RuntimeError("INTERNAL_SERVICE_TOKEN not configured.")

    url = (
        f"{settings.CHAT_SERVICE_URL.rstrip('/')}"
        f"/internal/projects/{project_id}/conversation/delete/"
    )

    response = requests.delete(
        url,
        headers={
            "X-Internal-Token": settings.INTERNAL_SERVICE_TOKEN
        },
        timeout=5,
    )

    response.raise_for_status()

def create_notification(user_id, title, message):
    if not settings.CHAT_SERVICE_URL:
        raise RuntimeError("CHAT_SERVICE_URL not configured.")

    if not settings.INTERNAL_SERVICE_TOKEN:
        raise RuntimeError("INTERNAL_SERVICE_TOKEN not configured.")

    url = (
        f"{settings.CHAT_SERVICE_URL.rstrip('/')}"
        f"/internal/notifications/"
    )

    response = requests.post(
        url,
        headers={
            "X-Internal-Token": settings.INTERNAL_SERVICE_TOKEN
        },
        json={
            "user_id": user_id,
            "title": title,
            "message": message,
        },
        timeout=5,
    )

    response.raise_for_status()

    return response.json()