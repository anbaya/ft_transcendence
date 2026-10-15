from rest_framework import serializers
from .models import Task
from .project_service import get_project
from .auth_service import get_user


class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(read_only=True, required=False)
    assignee_name = serializers.CharField(read_only=True, required=False)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['creator_id', 'project_id', 'project_name', 'assignee_name']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(instance, 'project_name') and instance.project_name:
            data['project_name'] = instance.project_name
        else:
            request = self.context.get('request')
            access_token = None
            if request:
                auth_header = request.headers.get('Authorization', '')
                if auth_header.startswith('Bearer '):
                    access_token = auth_header.split(' ', 1)[1]
            if access_token and instance.project_id:
                try:
                    project = get_project(instance.project_id, access_token)
                    data['project_name'] = project.get('name', f"Project {instance.project_id}") if project else f"Project {instance.project_id}"
                except Exception:
                    data['project_name'] = f"Project {instance.project_id}"
            else:
                data['project_name'] = f"Project {instance.project_id}"

        if instance.assignee_id:
            try:
                user_info = get_user(instance.assignee_id)
                if user_info:
                    name = f"{user_info.get('first_name', '')} {user_info.get('last_name', '')}".strip()
                    data['assignee_name'] = name or user_info.get('email', '')
                else:
                    data['assignee_name'] = None
            except Exception:
                data['assignee_name'] = None
        else:
            data['assignee_name'] = None

        return data