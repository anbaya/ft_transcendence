from django.urls import path
from .views import MessageListView, MessageDetailView, ProjectConversationView

urlpatterns = [
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