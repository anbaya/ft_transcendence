from rest_framework.permissions import BasePermission
from .project_service import get_project
import requests


def is_admin(request):
    return getattr(request.user, "role", None) == "ADMIN"


class IsProjectChatMember(BasePermission):

    def has_permission(self, request, view):
        if is_admin(request):
            return True

        project_id = view.get_project_id()

        authorization = request.headers.get("Authorization", "")

        try:
            get_project(project_id, authorization)
            return True
        except (requests.RequestException, RuntimeError):
            return False


class IsMessageOwnerOrAdmin(BasePermission):

    def has_object_permission(self, request, view, obj):
        if is_admin(request):
            return True

        if obj.sender_id != request.user.id:
            return False

        project_id = obj.conversation.project_id
        authorization = request.headers.get("Authorization", "")

        try:
            get_project(project_id, authorization)
            return True
        except (requests.RequestException, RuntimeError):
            return False