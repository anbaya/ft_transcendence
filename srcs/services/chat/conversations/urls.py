from django.urls import path
from .views import (
    MessageListView,
    MessageDetailView,
    ProjectConversationView,
    UserConversationsListView,
)

urlpatterns = [
    path(
        'my/',
        UserConversationsListView.as_view(),
        name='user-conversations'
    ),
    path(
        '<int:conversation_id>/messages/',
        MessageListView.as_view(),
        name='message-list'
    ),
    path(
        'messages/<int:pk>/',
        MessageDetailView.as_view(),
        name='message-detail'
    ),
    path(
        'projects/<int:project_id>/',
        ProjectConversationView.as_view(),
        name='project-conversation'
    ),
]