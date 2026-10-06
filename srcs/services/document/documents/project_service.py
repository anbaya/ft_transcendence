import os
import requests

from rest_framework.exceptions import (
    PermissionDenied,
    APIException,
)


PROJECT_SERVICE_URL = os.environ.get(
    "PROJECT_SERVICE_URL",
    "http://localhost:8001"
)


class ProjectServiceUnavailable(APIException):
    status_code = 503
    default_detail = "Project Service is currently unavailable."
    default_code = "project_service_unavailable"


def _get(url, access_token):
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=5
        )

    except requests.RequestException:
        raise ProjectServiceUnavailable()

    if response.status_code == 404:
        return None

    if response.status_code == 403:
        raise PermissionDenied(
            "You do not have access to this project."
        )

    if response.status_code == 401:
        raise PermissionDenied(
            "Authentication was rejected by Project Service."
        )

    if not response.ok:
        raise ProjectServiceUnavailable()

    try:
        return response.json()
    except ValueError:
        raise ProjectServiceUnavailable()


def get_project(project_id, access_token):
    url = (
        f"{PROJECT_SERVICE_URL}"
        f"/api/projects/{project_id}/"
    )

    return _get(url, access_token)


def get_project_members(project_id, access_token):
    url = (
        f"{PROJECT_SERVICE_URL}"
        f"/api/projects/{project_id}/members/"
    )

    return _get(url, access_token)