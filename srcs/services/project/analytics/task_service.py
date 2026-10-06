import requests
from django.conf import settings


def get_project_tasks(project_id, authorization_header):
    if not settings.TASK_SERVICE_URL:
        raise RuntimeError("TASK_SERVICE_URL not configured.")

    url = (
        f"{settings.TASK_SERVICE_URL.rstrip('/')}"
        f"/api/projects/{project_id}/tasks/"
    )

    response = requests.get(
        url,
        headers={
            "Authorization": authorization_header
        },
        timeout=5
    )
    response.raise_for_status()

    return response.json()

