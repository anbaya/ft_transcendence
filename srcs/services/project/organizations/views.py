from django.shortcuts import render, get_object_or_404
from rest_framework import generics
from django.db.models import Q
from .models import Organization, OrganizationMember
from .serializers import OrganizationSerializer, OrganizationMemberSerializer
from .permissions import IsOrganizationOwnerOrAdmin, IsOrganizationMemberOrOwnerOrAdmin, OrganizationMemberPermission, is_admin
from django.db.models.deletion import ProtectedError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied


class OrganizationListView(generics.ListCreateAPIView):
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        if is_admin(self.request):
            return Organization.objects.all()

        return Organization.objects.filter(
            Q(owner_id=self.request.user.id) |
            Q(members__user_id=self.request.user.id)
        ).distinct()

    def perform_create(self, serializer):
        organization = serializer.save(
            owner_id=self.request.user.id
        )

        OrganizationMember.objects.create(
            organization=organization,
            user_id=self.request.user.id
        )


class OrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsOrganizationMemberOrOwnerOrAdmin()]

        return [IsOrganizationOwnerOrAdmin()]
    
    def destroy(self, request, *args, **kwargs):
        organization = self.get_object()

        try:
            organization.delete()
        except ProtectedError:
            return Response(
                {
                    "detail":
                    "Cannot delete an organization that contains projects."
                },
                status=status.HTTP_409_CONFLICT
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class OrganizationMemberListView(generics.ListCreateAPIView):
    serializer_class = OrganizationMemberSerializer
    permission_classes = [OrganizationMemberPermission]

    def get_queryset(self):
        organization = get_object_or_404(
            Organization,
            pk=self.kwargs['organization_id']
        )
        return OrganizationMember.objects.filter(
            organization=organization
        )

    def perform_create(self, serializer):
        organization = get_object_or_404(
            Organization,
            pk=self.kwargs['organization_id']
        )
        serializer.save(organization=organization)

    def get_organization(self):
        return get_object_or_404(
            Organization,
            pk=self.kwargs['organization_id']
        )
    


class OrganizationMemberDetailView(generics.DestroyAPIView):
    serializer_class = OrganizationMemberSerializer
    permission_classes = [OrganizationMemberPermission]

    def perform_destroy(self, instance):
        if instance.user_id == instance.organization.owner_id:
            raise PermissionDenied(
                "The organization owner cannot be removed."
            )

        instance.delete()

    def get_organization(self):
        return get_object_or_404(
            Organization,
            pk=self.kwargs['organization_id']
        )

    def get_queryset(self):
        organization = get_object_or_404(
            Organization,
            pk=self.kwargs['organization_id']
        )
        return OrganizationMember.objects.filter(
            organization=organization
        )