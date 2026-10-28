import os
import requests

AUTH_SERVICE_URL = os.environ.get(
    "AUTH_SERVICE_URL",
    "http://auth-service:8000"
)
INTERNAL_SERVICE_TOKEN = os.environ.get(
    "INTERNAL_SERVICE_TOKEN",
    ""
)


def get_user(user_id):
    if not AUTH_SERVICE_URL or not user_id:
        return None
    url = f"{AUTH_SERVICE_URL.rstrip('/')}/internal/users/{user_id}/"
    headers = {}
    if INTERNAL_SERVICE_TOKEN:
        headers["X-Internal-Token"] = INTERNAL_SERVICE_TOKEN
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 404:
            return None
        response.raise_for_status()
        return response.json()
    except Exception:
        return None
