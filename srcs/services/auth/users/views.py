from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import User
from .serializers import RegisterSerializer

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import LoginSerializer

from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import UserSerializer, ChangePasswordSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .permissions import HasInternalToken
from .serializers import InternalUserSerializer

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings

from django.template.loader import render_to_string
import os

from .serializers import (
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

class MeView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active'])

        tokens = OutstandingToken.objects.filter(user=instance)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)


        project_service_url = getattr(settings, 'PROJECT_SERVICE_URL', 'http://project-service:8000').rstrip('/')
        internal_token = getattr(settings, 'INTERNAL_SERVICE_TOKEN', '') or os.environ.get('INTERNAL_SERVICE_TOKEN', '')
        try:
            import requests
            requests.delete(
                f"{project_service_url}/internal/users/{instance.id}/",
                headers={
                    'X-Internal-Token': internal_token
                },
                timeout=5,
            )
        except Exception:
            import logging
            logging.getLogger(__name__).exception(
                "Erreur lors de la notification de suppression de l'utilisateur %s à project-service",
                instance.id
            )

class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)

            if str(token["user_id"]) != str(request.user.id):
                return Response(
                    {"error": "Invalid refresh token"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token.blacklist()

            return Response(
                {"message": "Logout successful"},
                status=status.HTTP_200_OK
            )

        except TokenError:
            return Response(
                {"error": "Invalid or expired refresh token"},
                status=status.HTTP_400_BAD_REQUEST
            )

class InternalUserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = InternalUserSerializer
    authentication_classes = []
    permission_classes = [HasInternalToken]

class InternalUserByEmailView(APIView):
    authentication_classes = []
    permission_classes = [HasInternalToken]

    def get(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response(
                {"detail": "Email query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = User.objects.filter(email__iexact=email.strip(), is_active=True).first()
        if not user:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = InternalUserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class InternalUserBulkView(APIView):
    authentication_classes = []
    permission_classes = [HasInternalToken]

    def post(self, request):
        ids = request.data.get("ids", [])
        if not isinstance(ids, list):
            return Response(
                {"detail": "ids must be a list."},
                status=status.HTTP_400_BAD_REQUEST
            )
        users = User.objects.filter(id__in=ids, is_active=True)
        serializer = InternalUserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        user.set_password(
            serializer.validated_data["new_password"]
        )
        user.save(update_fields=["password"])

        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK
        )

class ForgotPasswordView(generics.GenericAPIView):
    serializer_class = ForgotPasswordSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(
                email__iexact=email,
                is_active=True
            )
        except User.DoesNotExist:
            user = None

        if user:
            uid = urlsafe_base64_encode(
                force_bytes(user.pk)
            )

            token = default_token_generator.make_token(user)

            frontend_base = os.environ.get('FRONTEND_RESET_PASSWORD_URL', 'https://localhost:8443/auth/reset-password')
            reset_url = f"{frontend_base}?uid={uid}&token={token}" 

            html_message = render_to_string("emails/password_reset.html",
            {"reset_url": reset_url,
            })

            send_mail(
                subject="Reset your password",
                message=(
                    "We received a request to reset your password.\n\n"
                    f"Reset your password here: {reset_url}"
                ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
            )
        return Response(
            {
                "message":
                "If an account exists with this email, "
                "a password reset link has been sent."
            },
            status=status.HTTP_200_OK
        )

class ResetPasswordView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            {
                "message":
                "Password has been reset successfully."
            },
            status=status.HTTP_200_OK
        )
