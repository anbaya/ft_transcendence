from django.urls import path
from .views import (
    AskAssistantView,
    AIInteractionHistoryView,
    ProjectDocumentsSyncView,
)

urlpatterns = [
    path(
        'ask/',
        AskAssistantView.as_view(),
        name='ai-ask-general'
    ),
    path(
        'ask/stream/',
        AskAssistantView.as_view(),
        {'stream': True},
        name='ai-ask-general-stream'
    ),
    path(
        'history/',
        AIInteractionHistoryView.as_view(),
        name='ai-history-general'
    ),
    path(
        'projects/<int:project_id>/ask/',
        AskAssistantView.as_view(),
        name='ai-ask-project'
    ),
    path(
        'projects/<int:project_id>/ask/stream/',
        AskAssistantView.as_view(),
        {'stream': True},
        name='ai-ask-project-stream'
    ),
    path(
        'projects/<int:project_id>/history/',
        AIInteractionHistoryView.as_view(),
        name='ai-history-project'
    ),
    path(
        'projects/<int:project_id>/sync/',
        ProjectDocumentsSyncView.as_view(),
        name='ai-sync-project'
    ),
]
