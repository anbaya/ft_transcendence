import requests
from django.conf import settings


def get_project_documents(project_id, authorization_header=None):
    if not settings.DOCUMENT_SERVICE_URL:
        raise RuntimeError("DOCUMENT_SERVICE_URL is not configured.")

    internal_token = getattr(settings, "INTERNAL_SERVICE_TOKEN", "")
    headers = {}
    if authorization_header:
        headers["Authorization"] = authorization_header
    if internal_token:
        headers["X-Internal-Token"] = internal_token

    url_internal = f"{settings.DOCUMENT_SERVICE_URL.rstrip('/')}/internal/projects/{project_id}/documents/"
    try:
        response = requests.get(
            url_internal,
            headers=headers,
            timeout=5,
        )
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass

    url = f"{settings.DOCUMENT_SERVICE_URL.rstrip('/')}/api/documents/projects/{project_id}/documents/"

    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=5,
        )
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass

    url_fallback = f"{settings.DOCUMENT_SERVICE_URL.rstrip('/')}/api/projects/{project_id}/documents/"
    response = requests.get(
        url_fallback,
        headers=headers,
        timeout=5,
    )
    response.raise_for_status()
    return response.json()


def download_document(document_id, authorization_header=None):
    if not settings.DOCUMENT_SERVICE_URL:
        raise RuntimeError("DOCUMENT_SERVICE_URL is not configured.")

    internal_token = getattr(settings, "INTERNAL_SERVICE_TOKEN", "")
    headers = {}
    if authorization_header:
        headers["Authorization"] = authorization_header
    if internal_token:
        headers["X-Internal-Token"] = internal_token

    try:
        url_internal = f"{settings.DOCUMENT_SERVICE_URL.rstrip('/')}/internal/documents/{document_id}/download/"
        response = requests.get(url_internal, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.content
    except Exception:
        pass

    urls_to_try = [
        f"{settings.DOCUMENT_SERVICE_URL.rstrip('/')}/api/documents/documents/{document_id}/download/",
        f"{settings.DOCUMENT_SERVICE_URL.rstrip('/')}/api/documents/{document_id}/download/",
    ]
    for url in urls_to_try:
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                return response.content
        except Exception:
            pass

    return None
