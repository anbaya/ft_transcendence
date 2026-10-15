from django.urls import path
from .views import (
    ProjectDocumentListCreateView,
    DocumentDetailView,
    DocumentDownloadView,
    UserDocumentsListView,
)


urlpatterns = [
    path(
        'my/',
        UserDocumentsListView.as_view(),
        name='user-documents'
    ),
    path(
        'projects/<int:project_id>/documents/',
        ProjectDocumentListCreateView.as_view(),
        name='project-documents'
    ),

    path(
        'documents/<int:pk>/',
        DocumentDetailView.as_view(),
        name='document-detail'
    ),

    path(
        'documents/<int:pk>/download/',
        DocumentDownloadView.as_view(),
        name='document-download'
    ),
]