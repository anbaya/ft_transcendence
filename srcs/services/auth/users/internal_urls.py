from django.urls import path

from .views import (
    InternalUserDetailView,
    InternalUserByEmailView,
    InternalUserBulkView,
)

urlpatterns = [
    path(
        "users/<int:pk>/",
        InternalUserDetailView.as_view(),
        name="internal-user-detail",
    ),
    path(
        "users/by-email/",
        InternalUserByEmailView.as_view(),
        name="internal-user-by-email",
    ),
    path(
        "users/bulk/",
        InternalUserBulkView.as_view(),
        name="internal-user-bulk",
    ),
]