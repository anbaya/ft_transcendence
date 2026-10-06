from .models import Notification


def create_notification(user_id, title, message):
    return Notification.objects.create(
        user_id=user_id,
        title=title,
        message=message
    )