from django.urls import path
from .views import (
    InternalDocumentIndexWebhookView,
    InternalDocumentDeleteWebhookView,
)

urlpatterns = [
    path(
        'documents/index/',
        InternalDocumentIndexWebhookView.as_view(),
        name='internal-document-index-webhook',
    ),
    path(
        'documents/<int:document_id>/',
        InternalDocumentDeleteWebhookView.as_view(),
        name='internal-document-delete-webhook',
    ),
]
