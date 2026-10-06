import requests
from django.conf import settings


def get_project(project_id, authorization_header):
    if not settings.PROJECT_SERVICE_URL:
        raise RuntimeError("PROJECT_SERVICE_URL not configured.")

    url = (
        f"{settings.PROJECT_SERVICE_URL.rstrip('/')}"
        f"/api/projects/{project_id}/"
    )

    response = requests.get(
        url,
        headers={"Authorization": authorization_header},
        timeout=5,
    )
    response.raise_for_status()

    return response.json()


def get_project_members(project_id, authorization_header):
    if not settings.PROJECT_SERVICE_URL:
        raise RuntimeError("PROJECT_SERVICE_URL not configured.")

    url = (
        f"{settings.PROJECT_SERVICE_URL.rstrip('/')}"
        f"/api/projects/{project_id}/members/"
    )

    response = requests.get(
        url,
        headers={"Authorization": authorization_header},
        timeout=5,
    )

    response.raise_for_status()

    return response.json()
