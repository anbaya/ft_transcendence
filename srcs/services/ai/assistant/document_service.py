import requests
from django.conf import settings

def get_project_documents(project_id, authorization_header):
    if not settings.DOCUMENT_SERVICE_URL:
        raise RuntimeError("DOCUMENT_SERVICE_URL is not configured.")

    url = f"{settings.DOCUMENT_SERVICE_URL.rstrip('/')}/api/documents/projects/{project_id}/documents/"

    try:
        response = requests.get(
            url,
            headers={"Authorization": authorization_header},
            timeout=5,
        )
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass

    url_fallback = f"{settings.DOCUMENT_SERVICE_URL.rstrip('/')}/api/projects/{project_id}/documents/"
    response = requests.get(
        url_fallback,
        headers={"Authorization": authorization_header},
        timeout=5,
    )
    response.raise_for_status()
    return response.json()

def download_document(document_id, authorization_header):
    if not settings.DOCUMENT_SERVICE_URL:
        raise RuntimeError("DOCUMENT_SERVICE_URL is not configured.")

    url = f"{settings.DOCUMENT_SERVICE_URL.rstrip('/')}/api/documents/documents/{document_id}/download/"

    try:
        response = requests.get(
            url,
            headers={"Authorization": authorization_header},
            timeout=10,
        )
        if response.status_code == 200:
            return response.content
    except Exception:
        pass

    url_fallback = f"{settings.DOCUMENT_SERVICE_URL.rstrip('/')}/api/documents/{document_id}/download/"
    response = requests.get(
        url_fallback,
        headers={"Authorization": authorization_header},
        timeout=10,
    )
    response.raise_for_status()
    return response.content