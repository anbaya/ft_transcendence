from rest_framework import serializers
from .models import Organization, OrganizationMember
import requests
from projects.auth_service import get_user

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            'id',
            'name',
            'description',
            'owner_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'owner_id',
            'created_at',
            'updated_at',
        ]


class OrganizationMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationMember
        fields = [
            'id',
            'organization',
            'user_id',
            'joined_at',
        ]
        read_only_fields = [
            'id',
            'organization',
            'joined_at',
        ]

    def validate_user_id(self, value):
        organization_id = self.context['view'].kwargs['organization_id']

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
        if OrganizationMember.objects.filter(
            organization_id=organization_id,
            user_id=value
        ).exists():
            raise serializers.ValidationError(
                "This user is already a member of this organization."
            )

        return value