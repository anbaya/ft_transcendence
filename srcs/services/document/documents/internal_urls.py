from django.urls import path
from .views import ProjectDocumentsDeleteView, InternalDocumentDownloadView


urlpatterns = [
    path(
        'projects/<int:project_id>/documents/',
        ProjectDocumentsDeleteView.as_view(),
        name='internal-project-documents-delete'
    ),
    path(
        'documents/<int:pk>/download/',
        InternalDocumentDownloadView.as_view(),
        name='internal-document-download'
    ),
]