import os
import secrets

from rest_framework.permissions import BasePermission


class IsInternalService(BasePermission):

    def has_permission(self, request, view):
        received_token = request.headers.get("X-Internal-Token")
        expected_token = os.environ.get("INTERNAL_SERVICE_TOKEN")

        if not received_token or not expected_token:
            return False

        return secrets.compare_digest(
            received_token,
            expected_token
        )