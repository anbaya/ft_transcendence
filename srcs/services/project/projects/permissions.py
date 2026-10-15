from rest_framework.permissions import BasePermission, SAFE_METHODS

def is_admin(request):
    return getattr(request.user, "role", None) in ["ADMIN", "admin"]

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

        if request.method in SAFE_METHODS:
            return project.members.filter(
                user_id=request.user.id
            ).exists()

        return False