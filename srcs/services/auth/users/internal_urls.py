from django.urls import path

from .views import InternalUserDetailView


urlpatterns = [
    path(
        "users/<int:pk>/",
        InternalUserDetailView.as_view(),
        name="internal-user-detail",
    ),
]