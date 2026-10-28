from django.urls import path
from .views import (
    InternalNotificationCreateView,
    InternalUserNotificationsDeleteView,
)

urlpatterns = [
    path(
        'notifications/',
        InternalNotificationCreateView.as_view(),
        name='internal-notification-create'
    ),
    path(
        'users/<int:user_id>/',
        InternalUserNotificationsDeleteView.as_view(),
        name='internal-user-notifications-delete'
    ),
]
