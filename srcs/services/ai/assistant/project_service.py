import requests
from django.conf import settings

def get_project(project_id, authorization_header):
    if not settings.PROJECT_SERVICE_URL:
        raise RuntimeError("PROJECT_SERVICE_URL is not configured.")

    url = f"{settings.PROJECT_SERVICE_URL.rstrip('/')}/api/projects/{project_id}/"

    response = requests.get(
        url,
        headers={"Authorization": authorization_header},
        timeout=5,
    )
    response.raise_for_status()
    return response.json()

def get_project_tasks(project_id, authorization_header):
    if not settings.TASK_SERVICE_URL:
        return []

    url = f"{settings.TASK_SERVICE_URL.rstrip('/')}/api/tasks/projects/{project_id}/tasks/"

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

    return []

def get_project_members(project_id, authorization_header):
    if not settings.PROJECT_SERVICE_URL:
        return []

    url = f"{settings.PROJECT_SERVICE_URL.rstrip('/')}/api/projects/{project_id}/members/"

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

    return []