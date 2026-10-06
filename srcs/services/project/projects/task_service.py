import requests
from django.conf import settings


def delete_project_tasks(project_id):
    if not settings.TASK_SERVICE_URL:
        raise RuntimeError("TASK_SERVICE_URL not configured.")

    if not settings.INTERNAL_SERVICE_TOKEN:
        raise RuntimeError("INTERNAL_SERVICE_TOKEN not configured.")

    url = (
        f"{settings.TASK_SERVICE_URL.rstrip('/')}"
        f"/internal/projects/{project_id}/tasks/"
    )

    response = requests.delete(
        url,
        headers={
            "X-Internal-Token": settings.INTERNAL_SERVICE_TOKEN
        },
        timeout=5,
    )

    response.raise_for_status()