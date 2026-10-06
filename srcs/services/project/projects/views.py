from django.shortcuts import render, get_object_or_404
from rest_framework import generics
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer
from .chat_service import create_project_conversation, delete_project_conversation
from django.db import transaction
from rest_framework.exceptions import APIException,PermissionDenied
import logging
import requests
from organizations.models import OrganizationMember
from organizations.permissions import is_admin
from .permissions import IsProjectOwnerOrAdmin, IsProjectMemberOrOwnerOrAdmin, ProjectMemberPermission
from django.db.models import Q
from .task_service import delete_project_tasks
from .document_service import delete_project_documents
from rest_framework.response import Response
from rest_framework import status
from .chat_service import create_notification

logger = logging.getLogger(__name__)
class ProjectListView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        if is_admin(self.request):
            return Project.objects.all()

        return Project.objects.filter(
            Q(created_by=self.request.user.id) |
            Q(members__user_id=self.request.user.id)
        ).distinct()

    def perform_create(self, serializer):
        organization = serializer.validated_data.get('organization')

        if organization and not is_admin(self.request):
            is_owner = organization.owner_id == self.request.user.id

            is_member = OrganizationMember.objects.filter(
                organization=organization,
                user_id=self.request.user.id
            ).exists()

            if not is_owner and not is_member:
                raise PermissionDenied(
                    "You must be a member of this organization "
                    "to create a project in it."
                )
        project = serializer.save(
            created_by=self.request.user.id
        )
        ProjectMember.objects.create(
            project=project,
            user_id=self.request.user.id
        )

        try:
            create_project_conversation(project.id)
        except (requests.RequestException, RuntimeError):
            logger.exception(
                "Failed to create chat for project %s",
                project.id
            )
            project.chat_sync_status = 'failed'
            project.save(update_fields=['chat_sync_status'])
        else:
            project.chat_sync_status = 'ready'
            project.save(update_fields=['chat_sync_status'])

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsProjectMemberOrOwnerOrAdmin()]

        return [IsProjectOwnerOrAdmin()]

    def destroy(self, request, *args, **kwargs):
        project = self.get_object()

        try:
            delete_project_tasks(project.id)
            delete_project_documents(project.id)
            delete_project_conversation(project.id)

        except (requests.RequestException, RuntimeError):
            logger.exception(
                "Failed to delete resources for project %s",
                project.id
            )
            return Response(
                {"detail": "Deletion incomplete. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        project.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectMemberListView(generics.ListCreateAPIView):
    serializer_class = ProjectMemberSerializer
    permission_classes = [ProjectMemberPermission]

    def get_project(self):
        return get_object_or_404(
            Project,
            pk=self.kwargs['project_id']
        )

    def get_queryset(self):
        project = self.get_project()
        return ProjectMember.objects.filter(project=project)

    def perform_create(self, serializer):
        project = self.get_project()

        member = serializer.save(project=project)

        try:
            create_notification(
                user_id=member.user_id,
                title="Added to a project",
                message=f"You have been added to the project {project.name}."
            )
        except (requests.RequestException, RuntimeError):
            logger.exception(
                "Failed to create notification for user %s",
                member.user_id
            )



class ProjectMemberDetailView(generics.DestroyAPIView):
    serializer_class = ProjectMemberSerializer
    permission_classes = [ProjectMemberPermission]

    def perform_destroy(self, instance):
        if instance.user_id == instance.project.created_by:
            raise PermissionDenied(
                "The project owner cannot be removed from the project."
            )

        user_id = instance.user_id
        project = instance.project

        instance.delete()

        try:
            create_notification(
                user_id=user_id,
                title="Removed from a project",
                message=f"You have been removed from the project {project.name}."
            )
        except (requests.RequestException, RuntimeError):
            logger.exception(
                "Failed to create notification for user %s",
                user_id
            )
        
    def get_project(self):
        return get_object_or_404(
            Project,
            pk=self.kwargs['project_id']
        )

    def get_queryset(self):
        project = self.get_project()

        return ProjectMember.objects.filter(
            project=project
        )