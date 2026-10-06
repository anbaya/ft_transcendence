from django.urls import path
from .views import ProjectDocumentsDeleteView


urlpatterns = [
    path(
        'projects/<int:project_id>/documents/',
        ProjectDocumentsDeleteView.as_view(),
        name='internal-project-documents-delete'
    ),
]