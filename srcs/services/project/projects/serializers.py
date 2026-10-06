from rest_framework import serializers
from .models import Project, ProjectMember
import requests
from .auth_service import get_user


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = [
            'created_by',
            'chat_sync_status',
        ]
    def validate(self, attrs):
        start_date = attrs.get(
            'start_date',
            self.instance.start_date if self.instance else None
        )
        deadline = attrs.get(
            'deadline',
            self.instance.deadline if self.instance else None
        )

        if start_date and deadline and deadline < start_date:
            raise serializers.ValidationError({
                'deadline': 'The end date must be after the start date.'
            })

        return attrs


class ProjectMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMember
        fields = ['id', 'project', 'user_id', 'joined_at']
        read_only_fields = ['id', 'project', 'joined_at']
    def validate_user_id(self, value):
        project_id = self.context['view'].kwargs['project_id']

        try:
            get_user(value)
        except requests.HTTPError as exc:
            if exc.response is not None and exc.response.status_code == 404:
                raise serializers.ValidationError(
                    "This user does not exist."
                )
            raise
        except requests.RequestException:
            raise serializers.ValidationError(
                "The user service is temporarily unavailable."
            )
        except RuntimeError:
            raise serializers.ValidationError(
                "The user service is misconfigured."
            )
        if ProjectMember.objects.filter(
            project_id=project_id,
            user_id=value
        ).exists():
            raise serializers.ValidationError(
                "This user is already a member of this organization."
            )

        return value