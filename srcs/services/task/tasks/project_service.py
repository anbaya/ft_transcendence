import os
import requests


PROJECT_SERVICE_URL = os.environ.get(
    "PROJECT_SERVICE_URL",
    "http://localhost:8001"
)


def get_project(project_id, access_token):
    url = f"{PROJECT_SERVICE_URL}/api/projects/{project_id}/"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=5
    )

    if response.status_code == 404:
        return None

    response.raise_for_status()

    return response.json()

def get_project_members(project_id, access_token):
    url = f"{PROJECT_SERVICE_URL}/api/projects/{project_id}/members/"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=5
    )

    if response.status_code == 404:
        return None

    response.raise_for_status()

    return response.json()