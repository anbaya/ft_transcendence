import os
from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['project_id', 'uploaded_by_id']

    def validate_file(self, file):
        allowed_extensions = [
            '.pdf',
            '.docx',
            '.txt',
            '.csv',
            '.xlsx',
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