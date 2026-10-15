import requests
from django.conf import settings


def get_user(user_id):
    if not settings.AUTH_SERVICE_URL:
        raise RuntimeError("AUTH_SERVICE_URL not configured.")

    url = (
        f"{settings.AUTH_SERVICE_URL.rstrip('/')}"
        f"/internal/users/{user_id}/"
    )

    response = requests.get(
        url,
        headers={
            "X-Internal-Token": settings.INTERNAL_SERVICE_TOKEN
        },
        timeout=5
    )

    response.raise_for_status()

    return response.json()


def get_user_by_email(email):
    if not settings.AUTH_SERVICE_URL:
        raise RuntimeError("AUTH_SERVICE_URL not configured.")

    url = (
        f"{settings.AUTH_SERVICE_URL.rstrip('/')}"
        f"/internal/users/by-email/"
    )

    response = requests.get(
        url,
        params={"email": email},
        headers={
            "X-Internal-Token": settings.INTERNAL_SERVICE_TOKEN
        },
        timeout=5
    )

    response.raise_for_status()

    return response.json()


def get_users_bulk(user_ids):
    if not settings.AUTH_SERVICE_URL:
        raise RuntimeError("AUTH_SERVICE_URL not configured.")

    url = (
        f"{settings.AUTH_SERVICE_URL.rstrip('/')}"
        f"/internal/users/bulk/"
    )

    response = requests.post(
        url,
        json={"ids": list(user_ids)},
        headers={
            "X-Internal-Token": settings.INTERNAL_SERVICE_TOKEN
        },
        timeout=5
    )

    response.raise_for_status()

    return response.json()