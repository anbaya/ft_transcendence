import os

from django.conf import settings
from django.utils.crypto import constant_time_compare
from rest_framework.permissions import BasePermission


class HasInternalToken(BasePermission):
    def has_permission(self, request, view):
        expected_token = os.environ.get(
            "INTERNAL_SERVICE_TOKEN", ""
        )

        received_token = request.headers.get(
            "X-Internal-Token", ""
        )

        return bool(
            expected_token
            and received_token
            and constant_time_compare(
                expected_token,
                received_token
            )
        )