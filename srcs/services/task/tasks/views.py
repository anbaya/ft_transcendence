from rest_framework import generics, status
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from rest_framework.permissions import IsAuthenticated
from .permissions import IsInternalService
from rest_framework.exceptions import PermissionDenied, NotFound
from .project_service import get_project, get_project_members
from .notification_service import send_notification

class ProjectTaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    
    def get_queryset(self):
        project_id = self.kwargs['project_id']
        user_id = self.request.user.id
        role = self.request.user.role

        
        if role == "ADMIN":
            return Task.objects.filter(
                project_id=project_id
            )

        
        auth_header = self.request.headers.get(
            "Authorization",
            ""
        )

        if not auth_header.startswith("Bearer "):
            raise PermissionDenied(
                "Invalid authorization header."
            )

        access_token = auth_header.split(" ", 1)[1]

        
        project = get_project(
            project_id,
            access_token
        )

        if project is None:
            raise NotFound("Project not found.")

        
        if str(project.get("created_by")) == str(user_id):
            return Task.objects.filter(
                project_id=project_id
            )

        members = get_project_members(
            project_id,
            access_token
        )

        if members is None:
            raise NotFound("Project not found.")

        is_member = any(
            str(member.get("user_id")) == str(user_id)
            for member in members
        )

        if not is_member:
            raise PermissionDenied(
                "You do not have access to this project's tasks."
            )

        return Task.objects.filter(
            project_id=project_id
        )

    
    def perform_create(self, serializer):
        project_id = self.kwargs['project_id']
        user_id = self.request.user.id
        role = self.request.user.role

        auth_header = self.request.headers.get(
            "Authorization",
            ""
        )

        if not auth_header.startswith("Bearer "):
            raise PermissionDenied(
                "Invalid authorization header."
            )

        access_token = auth_header.split(" ", 1)[1]

       
        project = get_project(
            project_id,
            access_token
        )

        if project is None:
            raise NotFound("Project not found.")

        
        if role != "ADMIN" and str(project.get("created_by")) != str(user_id):
            raise PermissionDenied(
                "Only the project creator or ADMIN can create tasks."
            )

        assignee_id = serializer.validated_data.get(
            "assignee_id"
        )

        if assignee_id is not None:
            members = get_project_members(
                project_id,
                access_token
            )

            if members is None:
                raise NotFound("Project not found.")

            is_member = any(
                str(member.get("user_id")) == str(assignee_id)
                for member in members
            )

            if not is_member:
                raise PermissionDenied(
                    "The assignee must be a member of the project."
                )

        task = serializer.save(
            project_id=project_id,
            creator_id=user_id
        )
        if assignee_id:
            try:
                send_notification(
                    user_id=assignee_id,
                    title="New task assigned",
                    message=f"A task was assigned to you in project {project.get('name', '')}: {task.title}"
                )
            except Exception:
                pass

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_access_token(self):
        auth_header = self.request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            raise PermissionDenied(
                "Invalid authorization header."
            )

        return auth_header.split(" ", 1)[1]

    
    def retrieve(self, request, *args, **kwargs):
        task = self.get_object()

        user_id = request.user.id
        role = request.user.role

        
        if role == "ADMIN":
            return Response(
                TaskSerializer(task).data,
                status=status.HTTP_200_OK
            )

        access_token = self.get_access_token()

        
        project = get_project(
            task.project_id,
            access_token
        )

        if project is None:
            raise NotFound("Project not found.")

        
        if str(project.get("created_by")) == str(user_id):
            return Response(
                TaskSerializer(task).data,
                status=status.HTTP_200_OK
            )

        members = get_project_members(
            task.project_id,
            access_token
        )

        if members is None:
            raise NotFound("Project not found.")

        is_member = any(
            str(member.get("user_id")) == str(user_id)
            for member in members
        )

        if not is_member:
            raise PermissionDenied(
                "You do not have access to this task."
            )

        return Response(
            TaskSerializer(task).data,
            status=status.HTTP_200_OK
        )

    
    def update(self, request, *args, **kwargs):
        task = self.get_object()

        user_id = request.user.id
        role = request.user.role

        forbidden_fields = {
            "project_id",
            "creator_id"
        }

        attempted_forbidden_fields = forbidden_fields.intersection(
            request.data.keys()
        )

        if attempted_forbidden_fields:
            return Response(
                {
                    "error": "These fields cannot be updated from this endpoint.",
                    "fields": list(attempted_forbidden_fields)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if role != "ADMIN":
            access_token = self.get_access_token()

            project = get_project(
                task.project_id,
                access_token
            )

            if project is None:
                raise NotFound("Project not found.")

            if str(project.get("created_by")) != str(user_id):
                raise PermissionDenied(
                    "Only the project creator or ADMIN can update tasks."
                )

        assignee_id = request.data.get("assignee_id")
        if assignee_id is not None and str(assignee_id) != str(task.assignee_id):
            access_token = self.get_access_token()
            members = get_project_members(task.project_id, access_token)
            if members is not None:
                is_member = any(
                    str(member.get("user_id")) == str(assignee_id)
                    for member in members
                )
                if not is_member:
                    raise PermissionDenied(
                        "The assignee must be a member of the project."
                    )
            try:
                send_notification(
                    user_id=assignee_id,
                    title="New task assigned",
                    message=f"A task was assigned to you: {task.title}"
                )
            except Exception:
                pass

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()

        user_id = request.user.id
        role = request.user.role

        if role != "ADMIN":
            access_token = self.get_access_token()

            project = get_project(
                task.project_id,
                access_token
            )

            if project is None:
                raise NotFound("Project not found.")

            if str(project.get("created_by")) != str(user_id):
                raise PermissionDenied(
                    "Only the project creator or ADMIN can delete tasks."
                )

        return super().destroy(request, *args, **kwargs)


class TaskStatusUpdateView(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        task = self.get_object()

        user_id = request.user.id
        role = request.user.role
        project_id = task.project_id

        
        new_status = request.data.get("status")

        if new_status not in dict(Task.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        
        if role == "ADMIN":
            task.status = new_status
            task.save()

            return Response(
                TaskSerializer(task).data,
                status=status.HTTP_200_OK
            )

        
        if str(task.assignee_id) == str(user_id):
            task.status = new_status
            task.save()

            return Response(
                TaskSerializer(task).data,
                status=status.HTTP_200_OK
            )

        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            raise PermissionDenied(
                "Invalid authorization header."
            )

        access_token = auth_header.split(" ", 1)[1]

        project = get_project(
            project_id,
            access_token
        )

        if project is None:
            raise NotFound("Project not found.")

        if str(project.get("created_by")) != str(user_id):
            raise PermissionDenied(
                "You are not allowed to update this task status."
            )

        task.status = new_status
        task.save()

        return Response(
            TaskSerializer(task).data,
            status=status.HTTP_200_OK
        )


class TaskAssigneeUpdateView(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        task = self.get_object()

        user_id = request.user.id
        role = request.user.role
        project_id = task.project_id

        assignee_id = request.data.get("assignee_id")

        if assignee_id is None:
            return Response(
                {"error": "assignee_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            raise PermissionDenied(
                "Invalid authorization header."
            )

        access_token = auth_header.split(" ", 1)[1]

        project = get_project(
            project_id,
            access_token
        )

        if project is None:
            raise NotFound("Project not found.")

        if role != "ADMIN" and str(project.get("created_by")) != str(user_id):
            raise PermissionDenied(
                "Only the project creator or ADMIN can assign tasks."
            )

        members = get_project_members(
            project_id,
            access_token
        )

        if members is None:
            raise NotFound("Project not found.")

        is_member = any(
            str(member.get("user_id")) == str(assignee_id)
            for member in members
        )

        if not is_member:
            raise PermissionDenied(
                "The assignee must be a member of the project."
            )

        task.assignee_id = assignee_id
        task.save()
        try:
            send_notification(
                user_id=assignee_id,
                title="New task assigned",
                message=f"You have been assigned to task: {task.title}"
            )
        except Exception:
            pass

        return Response(
            TaskSerializer(task).data,
            status=status.HTTP_200_OK
        )
    
class ProjectMemberTasksUnassignView(generics.GenericAPIView):
    permission_classes = [IsInternalService]

    def post(self, request, project_id, user_id, *args, **kwargs):
        Task.objects.filter(
            project_id=project_id,
            assignee_id=user_id
        ).update(assignee_id=None)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectTasksDeleteView(generics.GenericAPIView):
    permission_classes = [IsInternalService]

    def delete(self, request, project_id, *args, **kwargs):
        Task.objects.filter(project_id=project_id).delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

class MyTaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.user.id

        return Task.objects.filter(
            assignee_id=user_id
        ).order_by('-created_at')