import os
import logging
import requests

logger = logging.getLogger(__name__)


def send_notification(user_id, title, message):
    base_url = os.environ.get(
        "NOTIFICATION_SERVICE_URL"
    )

    internal_token = os.environ.get(
        "INTERNAL_SERVICE_TOKEN"
    )

    if not base_url or not internal_token:
        logger.error(
            "Notification service is not configured"
        )
        return False

    url = f"{base_url.rstrip('/')}/internal/notifications/"

    headers = {
        "X-Internal-Token": internal_token
    }

    payload = {
        "user_id": user_id,
        "title": title,
        "message": message
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=5
        )

        response.raise_for_status()
        return True

    except requests.RequestException:
        logger.exception(
            "Failed to send notification"
        )
        return False