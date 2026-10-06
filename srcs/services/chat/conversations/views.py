from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework import generics, status
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from django.utils.crypto import constant_time_compare
from rest_framework.permissions import AllowAny
from .permissions import IsProjectChatMember, IsMessageOwnerOrAdmin

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

        serializer.save(
            conversation=conversation,
            sender_id=self.request.user.id
        )

class ProjectConversationView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsProjectChatMember]

    def get_project_id(self):
        return self.kwargs['project_id']

    def get_object(self):
        project_id = self.kwargs['project_id']

        try:
            return Conversation.objects.get(project_id=project_id)
        except Conversation.DoesNotExist:
            raise NotFound("Conversation not found.")


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