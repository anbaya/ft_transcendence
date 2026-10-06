import requests
from django.conf import settings


def delete_project_documents(project_id):
    if not settings.DOCUMENT_SERVICE_URL:
        raise RuntimeError("DOCUMENT_SERVICE_URL not configured.")

    if not settings.INTERNAL_SERVICE_TOKEN:
        raise RuntimeError("INTERNAL_SERVICE_TOKEN not configured.")

    url = (
        f"{settings.DOCUMENT_SERVICE_URL.rstrip('/')}"
        f"/internal/projects/{project_id}/documents/"
    )

    response = requests.delete(
        url,
        headers={
            "X-Internal-Token": settings.INTERNAL_SERVICE_TOKEN
        },
        timeout=5,
    )

    response.raise_for_status()