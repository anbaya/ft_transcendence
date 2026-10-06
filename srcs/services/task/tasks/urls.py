from django.urls import path
from .views import (
    ProjectTaskListCreateView,
    TaskDetailView,
    TaskStatusUpdateView,
    TaskAssigneeUpdateView,
    ProjectTasksDeleteView,
    MyTaskListView,
)

urlpatterns = [
    path(
        'projects/<int:project_id>/tasks/',
        ProjectTaskListCreateView.as_view(),
        name='project-tasks'
    ),

    path(
        'tasks/<int:pk>/',
        TaskDetailView.as_view(),
        name='task-detail'
    ),

    path(
        'tasks/<int:pk>/status/',
        TaskStatusUpdateView.as_view(),
        name='task-status'
    ),

    path(
    'tasks/<int:pk>/assignee/',
    TaskAssigneeUpdateView.as_view(),
    name='task-assignee'
    ),

    path(
    'internal/projects/<int:project_id>/tasks/',
    ProjectTasksDeleteView.as_view(),
    name='internal-project-tasks-delete'
    ),

    path(
    'users/me/tasks/',
    MyTaskListView.as_view(),
    name='my-tasks'
    ),
]