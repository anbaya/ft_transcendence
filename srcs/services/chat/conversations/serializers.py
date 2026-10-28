from rest_framework import serializers
from .models import Conversation, Message
from .auth_service import get_user
from .project_service import get_project

_USER_CACHE = {}
_PROJECT_CACHE = {}

class ConversationSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(read_only=True, required=False)

    class Meta:
        model = Conversation
        fields = ['id', 'project_id', 'project_name', 'created_at']
        read_only_fields = ['id', 'created_at', 'project_id', 'project_name']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(instance, 'project_name') and instance.project_name:
            data['project_name'] = instance.project_name
        else:
            project_id = instance.project_id
            if project_id in _PROJECT_CACHE:
                data['project_name'] = _PROJECT_CACHE[project_id]
            else:
                request = self.context.get('request')
                auth_header = request.headers.get('Authorization', '') if request else ''
                if auth_header:
                    try:
                        project = get_project(project_id, auth_header)
                        name = project.get('name', f"Project {project_id}")
                    except Exception:
                        name = f"Project {project_id}"
                else:
                    name = f"Project {project_id}"
                _PROJECT_CACHE[project_id] = name
                data['project_name'] = name
        return data


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.IntegerField(
        source='sender_id',
        read_only=True
    )
    sent_at = serializers.DateTimeField(
        source="created_at",
        read_only=True
    )
    sender_name = serializers.CharField(
        read_only=True,
        required=False
    )

    class Meta:
        model = Message
        fields = [
            'id',
            'conversation',
            'sender_id',
            'sender',
            'sender_name',
            'content',
            'sent_at',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'conversation',
            'sender_id',
            'sender_name',
            'created_at',
        ]

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError(
                "The message cannot be empty."
            )
        return value.strip()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(instance, 'sender_name') and instance.sender_name:
            data['sender_name'] = instance.sender_name
        else:
            sender_id = instance.sender_id
            if sender_id in _USER_CACHE:
                data['sender_name'] = _USER_CACHE[sender_id]
            else:
                try:
                    user = get_user(sender_id)
                    first_name = user.get('first_name', '')
                    last_name = user.get('last_name', '')
                    full_name = f"{first_name} {last_name}".strip()
                    sender_name = full_name if full_name else f"User {sender_id}"
                except Exception:
                    sender_name = f"User {sender_id}"
                _USER_CACHE[sender_id] = sender_name
                data['sender_name'] = sender_name
        return data
