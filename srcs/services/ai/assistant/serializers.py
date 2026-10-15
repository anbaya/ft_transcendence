from rest_framework import serializers

from .models import AIInteraction


class AIInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInteraction
        fields = [
            'id',
            'user_id',
            'project_id',
            'question',
            'answer',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'user_id',
            'project_id',
            'answer',
            'created_at',
        ]