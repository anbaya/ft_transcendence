from django.utils import timezone
from rest_framework import serializers
from .models import Project, ProjectMember
import requests
from .auth_service import get_user, get_user_by_email


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

        today = timezone.now().date()

        if deadline:
            # For new projects or when deadline is updated, it cannot be in the past
            if not self.instance or ('deadline' in attrs and self.instance.deadline != deadline):
                if deadline < today:
                    raise serializers.ValidationError({
                        'deadline': 'The deadline cannot be in the past.'
                    })

        if start_date and deadline and deadline < start_date:
            raise serializers.ValidationError({
                'deadline': 'The end date must be after the start date.'
            })

        return attrs


class ProjectMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False)
    user_id = serializers.IntegerField(required=False)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)

    class Meta:
        model = ProjectMember
        fields = [
            'id',
            'project',
            'user_id',
            'email',
            'first_name',
            'last_name',
            'role',
            'joined_at',
        ]
        read_only_fields = ['id', 'project', 'joined_at', 'first_name', 'last_name', 'role']

    def validate(self, attrs):
        view = self.context.get('view')
        project_id = view.kwargs.get('project_id') if view else None
        email = attrs.get('email')
        user_id = attrs.get('user_id')

        if not email and not user_id:
            raise serializers.ValidationError({
                'email': 'Either email or user_id must be provided.'
            })

        user_data = None
        if email:
            try:
                user_data = get_user_by_email(email)
                user_id = user_data.get('id')
            except requests.HTTPError as exc:
                if exc.response is not None and exc.response.status_code == 404:
                    raise serializers.ValidationError({
                        'email': 'No user found with this email address.'
                    })
                raise serializers.ValidationError({
                    'email': 'Unable to verify user email with authentication service.'
                })
            except requests.RequestException:
                raise serializers.ValidationError({
                    'email': 'The user service is temporarily unavailable.'
                })
            except RuntimeError:
                raise serializers.ValidationError({
                    'email': 'The user service is misconfigured.'
                })
        elif user_id:
            try:
                user_data = get_user(user_id)
            except requests.HTTPError as exc:
                if exc.response is not None and exc.response.status_code == 404:
                    raise serializers.ValidationError({
                        'user_id': 'This user does not exist.'
                    })
                raise serializers.ValidationError({
                    'user_id': 'Unable to verify user ID with authentication service.'
                })
            except requests.RequestException:
                raise serializers.ValidationError({
                    'user_id': 'The user service is temporarily unavailable.'
                })
            except RuntimeError:
                raise serializers.ValidationError({
                    'user_id': 'The user service is misconfigured.'
                })

        if project_id and ProjectMember.objects.filter(
            project_id=project_id,
            user_id=user_id
        ).exists():
            raise serializers.ValidationError(
                'This user is already a member of this project.'
            )

        attrs['user_id'] = user_id
        if user_data:
            attrs['email'] = user_data.get('email', email)
        return attrs

    def create(self, validated_data):
        email = validated_data.pop('email', None)
        member = ProjectMember.objects.create(**validated_data)
        member.email = email
        return member

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(instance, 'first_name'):
            data['first_name'] = instance.first_name
        if hasattr(instance, 'last_name'):
            data['last_name'] = instance.last_name
        if hasattr(instance, 'email_value'):
            data['email'] = instance.email_value
        elif hasattr(instance, 'email') and instance.email:
            data['email'] = instance.email

        if instance.project_id and instance.project and instance.user_id == instance.project.created_by:
            data['role'] = 'PROJECT_MANAGER'
        else:
            data['role'] = 'MEMBER'
        return data
