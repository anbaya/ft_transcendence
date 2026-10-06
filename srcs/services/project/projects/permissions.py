from rest_framework.permissions import BasePermission, SAFE_METHODS
from organizations.permissions import is_admin

class IsProjectOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if is_admin(request):
            return True

        return obj.created_by == request.user.id

class IsProjectMemberOrOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if is_admin(request):
            return True

        if obj.created_by == request.user.id:
            return True

        return obj.members.filter(
            user_id=request.user.id
        ).exists()


class ProjectMemberPermission(BasePermission):
    def has_permission(self, request, view):
        project = view.get_project()

        if is_admin(request):
            return True

        if project.created_by == request.user.id:
            return True

        if request.method in SAFE_METHODS:
            return project.members.filter(
                user_id=request.user.id
            ).exists()

        return False