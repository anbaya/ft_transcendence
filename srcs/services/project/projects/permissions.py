import os
import secrets
from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_admin(request):
    return getattr(request.user, "role", None) in ["ADMIN", "admin"]


class IsInternalService(BasePermission):
    def has_permission(self, request, view):
        received_token = request.headers.get("X-Internal-Token")
        expected_token = os.environ.get("INTERNAL_SERVICE_TOKEN")
        if not received_token or not expected_token:
            return False
        return secrets.compare_digest(received_token, expected_token)


class IsProjectOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if is_admin(request):
            return True

        return str(obj.created_by) == str(getattr(request.user, 'id', None))


class IsProjectMemberOrOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if is_admin(request):
            return True

        if str(obj.created_by) == str(getattr(request.user, 'id', None)):
            return True

        return obj.members.filter(
            user_id=request.user.id
        ).exists()


class ProjectMemberPermission(BasePermission):
    def has_permission(self, request, view):
        project = view.get_project()

        if is_admin(request):
            return True

        if str(project.created_by) == str(getattr(request.user, 'id', None)):
            return True

        if request.method in SAFE_METHODS or request.method == "DELETE":
            return project.members.filter(
                user_id=request.user.id
            ).exists()

        return False

    def has_object_permission(self, request, view, obj):
        if is_admin(request):
            return True

        if str(obj.project.created_by) == str(getattr(request.user, 'id', None)):
            return True

        if request.method == "DELETE" and str(obj.user_id) == str(getattr(request.user, 'id', None)):
            return True

        if request.method in SAFE_METHODS:
            return True

        return False
