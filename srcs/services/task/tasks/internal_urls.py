from django.urls import path
from .views import ProjectTasksDeleteView

urlpatterns = [
    path(
        'projects/<int:project_id>/tasks/',
        ProjectTasksDeleteView.as_view(),
        name='internal-project-tasks-delete'
    ),
]