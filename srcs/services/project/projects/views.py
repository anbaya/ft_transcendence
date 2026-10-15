from django.shortcuts import render, get_object_or_404
from rest_framework import generics
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer
from .chat_service import create_project_conversation, delete_project_conversation
from django.db import transaction
from rest_framework.exceptions import APIException,PermissionDenied
import logging
import requests
from .permissions import IsProjectOwnerOrAdmin, IsProjectMemberOrOwnerOrAdmin, ProjectMemberPermission, is_admin
from django.db.models import Q
from .task_service import delete_project_tasks
from .document_service import delete_project_documents
from rest_framework.response import Response
from rest_framework import status
from .chat_service import create_notification
from .auth_service import get_user, get_users_bulk

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

    def list(self, request, *args, **kwargs):
        project = self.get_project()
        queryset = list(self.get_queryset())
        user_ids = [m.user_id for m in queryset]

        users_by_id = {}
        if user_ids:
            try:
                bulk_users = get_users_bulk(user_ids)
                for u in bulk_users:
                    users_by_id[u.get('id')] = u
            except Exception:
                for uid in user_ids:
                    try:
                        u = get_user(uid)
                        users_by_id[u.get('id')] = u
                    except Exception:
                        pass

        for member in queryset:
            u_info = users_by_id.get(member.user_id, {})
            member.first_name = u_info.get('first_name', '')
            member.last_name = u_info.get('last_name', '')
            member.email = u_info.get('email', '')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        project = self.get_project()
        member = serializer.save(project=project)

        try:
            user_data = get_user(member.user_id)
            member.first_name = user_data.get('first_name', '')
            member.last_name = user_data.get('last_name', '')
            member.email = user_data.get('email', '')
        except Exception:
            pass

        actor_name = ""
        try:
            actor_user = get_user(self.request.user.id)
            actor_name = f"{actor_user.get('first_name', '')} {actor_user.get('last_name', '')}".strip() or actor_user.get('email', '')
        except Exception:
            pass
        if not actor_name:
            actor_name = "Project manager"

        notif_text = f"{actor_name} added you to project {project.name}"

        try:
            create_notification(
                user_id=member.user_id,
                title=notif_text,
                message=notif_text
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

        actor_name = ""
        try:
            actor_user = get_user(self.request.user.id)
            actor_name = f"{actor_user.get('first_name', '')} {actor_user.get('last_name', '')}".strip() or actor_user.get('email', '')
        except Exception:
            pass
        if not actor_name:
            actor_name = "Project manager"

        notif_text = f"{actor_name} removed you from project {project.name}"

        try:
            create_notification(
                user_id=user_id,
                title=notif_text,
                message=notif_text
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