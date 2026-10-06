from rest_framework import serializers
from .models import Conversation, Message


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ['id', 'project_id', 'created_at']
        read_only_fields = ['id', 'created_at', 'project_id']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            'id',
            'conversation',
            'sender_id',
            'content',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'conversation',
            'sender_id',
            'created_at',
        ]
    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "The message cannot be empty."
            )
        return value