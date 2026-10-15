from django.urls import path
from .views import AskAssistantView, AIInteractionHistoryView

urlpatterns = [
    path(
        'ask/',
        AskAssistantView.as_view(),
        name='ai-ask-general'
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
        'projects/<int:project_id>/history/',
        AIInteractionHistoryView.as_view(),
        name='ai-history-project'
    ),
]