from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    MeView,
    LogoutView,
    ChangePasswordView,
    UserAvatarView,
    UserAvatarUploadView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("me/avatar/", UserAvatarUploadView.as_view(), name="me-avatar"),
    path("users/<int:user_id>/avatar/", UserAvatarView.as_view(), name="user-avatar"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
