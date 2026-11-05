import hmac
from django.conf import settings
from rest_framework.permissions import BasePermission


class IsInternalService(BasePermission):
    def has_permission(self, request, view):
        expected = getattr(settings, "INTERNAL_SERVICE_TOKEN", "")
        provided = request.headers.get("X-Internal-Token", "")
        if not expected or not hmac.compare_digest(provided, expected):
            return False
        return True