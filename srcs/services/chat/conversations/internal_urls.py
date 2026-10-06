from django.urls import path
from .views import (
    InternalConversationCreateView,
    InternalConversationDeleteView,
)

urlpatterns = [
    path(
        'projects/<int:project_id>/conversation/',
        InternalConversationCreateView.as_view(),
        name='internal-conversation-create'
    ),
    path(
        'projects/<int:project_id>/conversation/delete/',
        InternalConversationDeleteView.as_view(),
        name='internal-conversation-delete'
    ),
]