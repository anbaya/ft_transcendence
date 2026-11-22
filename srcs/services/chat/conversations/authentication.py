import os
import requests
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class ServiceJWTAuthentication(JWTAuthentication):

    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")
        role = validated_token.get("role")

        if user_id is None:
            raise AuthenticationFailed("Token does not contain user_id.")

        auth_url = getattr(settings, "AUTH_SERVICE_URL", "http://auth-service:8000") or os.environ.get("AUTH_SERVICE_URL", "http://auth-service:8000")
        internal_token = getattr(settings, "INTERNAL_SERVICE_TOKEN", "") or os.environ.get("INTERNAL_SERVICE_TOKEN", "")
        try:
            resp = requests.get(
                f"{auth_url.rstrip('/')}/internal/users/{user_id}/",
                headers={"X-Internal-Token": internal_token},
                timeout=3,
            )
            if resp.status_code == 404:
                raise AuthenticationFailed("User account no longer exists or is inactive.")
        except requests.RequestException:
            pass

        class AuthenticatedUser:
            def __init__(self, user_id, role):
                self.id = user_id
                self.pk = user_id
                self.role = role
                self.is_authenticated = True

        return AuthenticatedUser(user_id, role)
