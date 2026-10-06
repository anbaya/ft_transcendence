from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_admin(request):
    return getattr(request.user, "role", None) == "ADMIN"


class IsOrganizationOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if is_admin(request):
            return True

        return obj.owner_id == request.user.id


class IsOrganizationMemberOrOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if is_admin(request):
            return True

        if obj.owner_id == request.user.id:
            return True

        return obj.members.filter(
            user_id=request.user.id
        ).exists()




class OrganizationMemberPermission(BasePermission):
    def has_permission(self, request, view):
        organization = view.get_organization()

        if is_admin(request):
            return True

        if organization.owner_id == request.user.id:
            return True

        if request.method in SAFE_METHODS:
            return organization.members.filter(
                user_id=request.user.id
            ).exists()

        return False