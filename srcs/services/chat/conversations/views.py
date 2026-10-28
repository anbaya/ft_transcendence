from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework import generics, status
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from django.utils.crypto import constant_time_compare
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsProjectChatMember, IsMessageOwnerOrAdmin
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
import logging
from .project_service import get_project, get_project_members, get_user_projects
from .auth_service import get_user
from notifications.services import create_notification


logger = logging.getLogger(__name__)

def notify_project_members(project_id, sender_id, message_content, token):
    project = get_project(
        project_id,
        f"Bearer {token}"
    )

    members = get_project_members(
        project_id,
        f"Bearer {token}"
    )

    sender = get_user(sender_id)

    sender_name = (
        f"{sender.get('first_name', '')} "
        f"{sender.get('last_name', '')}"
    ).strip() or f"User {sender_id}"

    project_name = project.get(
        "name",
        f"Project {project_id}"
    )

    preview = message_content.strip()
    if len(preview) > 120:
        preview = preview[:117] + "..."

    for member in members:
        user_id = member.get("user_id")

        if user_id is None:
            continue

        if str(user_id) == str(sender_id):
            continue

        create_notification(
            user_id=user_id,
            title="New message",
            message=(
                f"{sender_name} sent a message "
                f"in project {project_name}:\n"
                f"{preview}"
            )
        )
    
class MessageListView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsProjectChatMember]

    def get_project_id(self):
        conversation = get_object_or_404(
            Conversation,
            pk=self.kwargs['conversation_id']
        )
        return conversation.project_id

    def get_queryset(self):
        conversation = get_object_or_404(
            Conversation,
            pk=self.kwargs['conversation_id']
        )

        return Message.objects.filter(
            conversation=conversation
        )

    def perform_create(self, serializer):
        conversation = get_object_or_404(
            Conversation,
            pk=self.kwargs['conversation_id']
        )

        message = serializer.save(
            conversation=conversation,
            sender_id=self.request.user.id
        )

        try:
            sender = get_user(message.sender_id)
            sender_name = f"{sender.get('first_name', '')} {sender.get('last_name', '')}".strip()
            if not sender_name:
                sender_name = f"User {message.sender_id}"
        except Exception:
            sender_name = f"User {message.sender_id}"

        message.sender_name = sender_name

        channel_layer = get_channel_layer()

        def broadcast_message():
            if channel_layer is None:
                logger.error("Channel layer unavailable")
                return

            try:
                async_to_sync(channel_layer.group_send)(
                    f"project_chat_{conversation.project_id}",
                    {
                        "type": "chat_message",
                        "id": message.id,
                        "sender_id": message.sender_id,
                        "sender_name": sender_name,
                        "message": message.content,
                        "created_at": message.created_at.isoformat(),
                    }
                )

            except Exception:
                logger.exception(
                    "Failed to broadcast message %s",
                    message.id
                )
        def send_notifications():
            try:
                authorization = self.request.headers.get(
                    "Authorization", ""
                )

                if not authorization.startswith("Bearer "):
                    logger.warning(
                        "Missing bearer token for message notifications"
                    )
                    return

                token = authorization.split(" ", 1)[1]

                notify_project_members(
                    project_id=conversation.project_id,
                    sender_id=message.sender_id,
                    message_content=message.content,
                    token=token
                )

            except Exception:
                logger.exception(
                    "Failed to create notifications for message %s",
                    message.id
                )

        transaction.on_commit(broadcast_message)
        transaction.on_commit(send_notifications)

class ProjectConversationView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsProjectChatMember]

    def get_project_id(self):
        return self.kwargs['project_id']

    def get_object(self):
        project_id = self.kwargs['project_id']
        conversation, _ = Conversation.objects.get_or_create(project_id=project_id)
        return conversation


class UserConversationsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header:
            raise PermissionDenied("Authorization header is required.")

        try:
            projects = get_user_projects(auth_header)
        except Exception:
            projects = []

        conversations = []
        for project in projects:
            project_id = project.get("id")
            if not project_id:
                continue
            conv, _ = Conversation.objects.get_or_create(project_id=project_id)
            conv.project_name = project.get("name", f"Project {project_id}")
            conversations.append(conv)

        serializer = ConversationSerializer(conversations, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class InternalConversationCreateView(APIView):

    permission_classes = [AllowAny]

    def post(self, request, project_id):
        expected_token = settings.INTERNAL_SERVICE_TOKEN
        received_token = request.headers.get("X-Internal-Token", "")

        if not expected_token or not constant_time_compare(
            expected_token, received_token
        ):
            raise PermissionDenied("Internal token is missing or invalid.")

        conversation, created = Conversation.objects.get_or_create(
            project_id=project_id
        )

        serializer = ConversationSerializer(conversation)

        return Response(
            serializer.data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            )
        )


class InternalConversationDeleteView(APIView):

    permission_classes = [AllowAny]

    def delete(self, request, project_id):
        expected_token = settings.INTERNAL_SERVICE_TOKEN
        received_token = request.headers.get("X-Internal-Token", "")

        if not expected_token or not constant_time_compare(
            expected_token, received_token
        ):
            raise PermissionDenied("Internal access refused")

        Conversation.objects.filter(project_id=project_id).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsMessageOwnerOrAdmin]
    http_method_names = ['patch', 'delete', 'options']

    def perform_update(self, serializer):
        message = serializer.save()
        channel_layer = get_channel_layer()
        if channel_layer:
            project_id = message.conversation.project_id
            def broadcast_update():
                try:
                    async_to_sync(channel_layer.group_send)(
                        f"project_chat_{project_id}",
                        {
                            "type": "chat_message_updated",
                            "id": message.id,
                            "content": message.content,
                        }
                    )
                except Exception:
                    logger.exception("Failed to broadcast message update %s", message.id)
            transaction.on_commit(broadcast_update)

    def perform_destroy(self, instance):
        message_id = instance.id
        project_id = instance.conversation.project_id
        super().perform_destroy(instance)
        channel_layer = get_channel_layer()
        if channel_layer:
            def broadcast_delete():
                try:
                    async_to_sync(channel_layer.group_send)(
                        f"project_chat_{project_id}",
                        {
                            "type": "chat_message_deleted",
                            "id": message_id,
                        }
                    )
                except Exception:
                    logger.exception("Failed to broadcast message delete %s", message_id)
            transaction.on_commit(broadcast_delete)
