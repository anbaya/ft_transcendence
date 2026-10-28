import os
import mimetypes
from rest_framework import serializers
from .models import Document
from .project_service import get_project
from .auth_service import get_user


class DocumentSerializer(serializers.ModelSerializer):
    filename = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    file_type = serializers.SerializerMethodField()
    uploader_id = serializers.IntegerField(source='uploaded_by_id', read_only=True)
    uploaded_by_name = serializers.CharField(read_only=True, required=False)
    created_at = serializers.DateTimeField(source='uploaded_at', read_only=True)
    project_name = serializers.CharField(read_only=True, required=False)

    class Meta:
        model = Document
        fields = [
            'id',
            'project_id',
            'project_name',
            'uploaded_by_id',
            'uploader_id',
            'uploaded_by_name',
            'name',
            'filename',
            'file',
            'file_size',
            'file_type',
            'uploaded_at',
            'created_at',
        ]
        read_only_fields = [
            'project_id',
            'project_name',
            'uploaded_by_id',
            'uploader_id',
            'uploaded_by_name',
            'filename',
            'file_size',
            'file_type',
            'created_at',
        ]
        extra_kwargs = {
            'name': {'required': False},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # 1. Enrichissement du nom du projet
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

        # 2. Enrichissement / Anonymisation de l'auteur (uploaded_by_name)
        if instance.uploaded_by_id:
            try:
                user_info = get_user(instance.uploaded_by_id)
                if user_info:
                    name = f"{user_info.get('first_name', '')} {user_info.get('last_name', '')}".strip()
                    data['uploaded_by_name'] = name or user_info.get('email', '')
                else:
                    # Compte supprimé ou inactif dans auth-service
                    data['uploaded_by_name'] = "Ancien membre"
            except Exception:
                data['uploaded_by_name'] = "Ancien membre"
        else:
            data['uploaded_by_name'] = "Ancien membre"

        return data

    def get_filename(self, obj):
        return obj.name or (os.path.basename(obj.file.name) if obj.file else '')

    def get_file_size(self, obj):
        try:
            return obj.file.size if obj.file else 0
        except Exception:
            return 0

    def get_file_type(self, obj):
        fname = self.get_filename(obj)
        guessed, _ = mimetypes.guess_type(fname)
        return guessed or 'application/octet-stream'

    def validate(self, attrs):
        if not attrs.get('name') and attrs.get('file'):
            attrs['name'] = os.path.basename(attrs['file'].name)
        return attrs

    def validate_file(self, file):
        allowed_extensions = [
            '.pdf',
            '.docx',
            '.txt',
            '.csv',
            '.xlsx',
            '.png',
            '.jpg',
            '.jpeg',
        ]

        extension = os.path.splitext(file.name)[1].lower()

        if extension not in allowed_extensions:
            raise serializers.ValidationError(
                "Unsupported file format."
            )

        max_size = 10 * 1024 * 1024  # 10 MB

        if file.size > max_size:
            raise serializers.ValidationError(
                "File size must not exceed 10 MB."
            )

        return file
