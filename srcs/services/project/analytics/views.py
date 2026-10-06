from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import date
import requests
from .task_service import get_project_tasks
from projects.models import Project
from projects.permissions import IsProjectMemberOrOwnerOrAdmin


class ProjectAnalyticsView(APIView):

    permission_classes = [IsProjectMemberOrOwnerOrAdmin]

    def get_object(self):
        project = get_object_or_404(
            Project,
            pk=self.kwargs['id']
        )
        self.check_object_permissions(self.request, project)
        return project

    def get(self, request, id):
        project = self.get_object()

        try:
            tasks = get_project_tasks(
                project.id,
                request.headers.get("Authorization", "")
            )
        except (requests.RequestException, RuntimeError):
            return Response(
                {"detail": "Task statistics are unavailable."},
                status=503
            )

        today = date.today()

        return Response({
            "project_id": project.id,
            "project_name": project.name,
            "status": project.status,
            "priority": project.priority,
            "members_count": project.members.count(),
            "tasks": {
                "total": len(tasks),
                "todo": sum(t["status"] == "TODO" for t in tasks),
                "in_progress": sum(
                    t["status"] == "IN_PROGRESS" for t in tasks
                ),
                "completed": sum(
                    t["status"] == "COMPLETED" for t in tasks
                ),
                "overdue": sum(
                    t["status"] != "COMPLETED"
                    and t.get("deadline") is not None
                    and date.fromisoformat(t["deadline"]) < today
                    for t in tasks
                ),
            }
        })