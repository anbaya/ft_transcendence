from django.urls import path
from .views import (
    ProjectTasksDeleteView,
    ProjectMemberTasksUnassignView,
)

urlpatterns = [
    path(
        'projects/<int:project_id>/tasks/',
        ProjectTasksDeleteView.as_view(),
        name='internal-project-tasks-delete'
    ),
    path(
        'projects/<int:project_id>/members/<int:user_id>/unassign/',
        ProjectMemberTasksUnassignView.as_view(),
        name='internal-project-member-tasks-unassign'
    ),
]