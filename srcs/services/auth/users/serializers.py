from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password]
    )

    first_name = serializers.CharField(
        required=True,
        allow_blank=False
    )

    last_name = serializers.CharField(
        required=True,
        allow_blank=False
    )

    avatar = serializers.FileField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "password",
            "avatar",
        ]
        extra_kwargs = {
            "email": {"validators": []}
        }

    def validate_email(self, value):
        email = value.lower().strip()
        existing_user = User.objects.filter(email__iexact=email).first()
        if existing_user:
            if not existing_user.is_active:
                existing_user.delete()
            else:
                raise serializers.ValidationError("A user with this email already exists.")
        return email

    def create(self, validated_data):
        validated_data["role"] = "USER"
        return User.objects.create_user(**validated_data)

class LoginSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["role"] = user.role

        return token

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "role",
            "avatar",
        ]
        read_only_fields = ["id", "email", "role", "avatar"]

    def get_avatar(self, obj):
        return f"/api/auth/users/{obj.id}/avatar/"

class InternalUserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "avatar",
        ]
        read_only_fields = fields

    def get_avatar(self, obj):
        return f"/api/auth/users/{obj.id}/avatar/"

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    def validate_old_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError(
                "Current password is incorrect."
            )

        return value

    def validate_new_password(self, value):
        user = self.context["request"].user
        validate_password(value, user=user)
        return value

    def validate(self, attrs):
        if attrs["old_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                "New password must be different."
            )

        return attrs
