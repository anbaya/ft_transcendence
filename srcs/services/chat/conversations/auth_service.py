import requests
from django.conf import settings


def get_user(user_id):
    if not settings.AUTH_SERVICE_URL:
        raise RuntimeError("AUTH_SERVICE_URL not configured.")

    if not settings.INTERNAL_SERVICE_TOKEN:
        raise RuntimeError("INTERNAL_SERVICE_TOKEN not configured.")

    url = (
        f"{settings.AUTH_SERVICE_URL.rstrip('/')}"
        f"/internal/users/{user_id}/"
    )

    response = requests.get(
        url,
        headers={
            "X-Internal-Token": settings.INTERNAL_SERVICE_TOKEN
        },
        timeout=5,
    )

    response.raise_for_status()

    return response.json()