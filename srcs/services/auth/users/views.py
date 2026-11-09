import mimetypes
from django.http import HttpResponse, FileResponse
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings
import os

from .models import User
from .permissions import HasInternalToken
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    InternalUserSerializer,
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

class MeView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def perform_destroy(self, instance):
        user_id = instance.id

        tokens = OutstandingToken.objects.filter(user=instance)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)

        project_service_url = getattr(settings, 'PROJECT_SERVICE_URL', 'http://project-service:8000').rstrip('/')
        internal_token = getattr(settings, 'INTERNAL_SERVICE_TOKEN', '') or os.environ.get('INTERNAL_SERVICE_TOKEN', '')
        try:
            import requests
            requests.delete(
                f"{project_service_url}/internal/users/{user_id}/",
                headers={
                    'X-Internal-Token': internal_token
                },
                timeout=5,
            )
        except Exception:
            import logging
            logging.getLogger(__name__).exception(
                "Erreur lors de la notification de suppression de l'utilisateur %s à project-service",
                user_id
            )

        instance.delete()

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

DEFAULT_AVATAR_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="64" fill="#E2E8F0"/>
  <circle cx="64" cy="48" r="24" fill="#94A3B8"/>
  <path d="M24 112c0-22.09 17.91-40 40-40s40 17.91 40 40z" fill="#94A3B8"/>
</svg>'''

class UserAvatarView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id=None):
        if user_id is None:
            if not request.user or not request.user.is_authenticated:
                return HttpResponse(DEFAULT_AVATAR_SVG, content_type="image/svg+xml")
            user = request.user
        else:
            user = User.objects.filter(id=user_id).first()

        if user and user.avatar:
            try:
                if os.path.exists(user.avatar.path):
                    content_type = mimetypes.guess_type(user.avatar.name)[0] or 'application/octet-stream'
                    return FileResponse(open(user.avatar.path, 'rb'), content_type=content_type)
            except Exception:
                pass

        return HttpResponse(DEFAULT_AVATAR_SVG, content_type="image/svg+xml")

class UserAvatarUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        return UserAvatarView().get(request, user_id=request.user.id)

    def post(self, request):
        file = request.FILES.get('avatar') or request.FILES.get('file')
        if not file:
            return Response(
                {"detail": "No image file provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if file.size > 5 * 1024 * 1024:
            return Response(
                {"detail": "File size must not exceed 5MB."},
                status=status.HTTP_400_BAD_REQUEST
            )

        ext = os.path.splitext(file.name)[1].lower()
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
        if ext not in allowed_extensions:
            return Response(
                {"detail": "Invalid image format. Allowed formats: JPG, PNG, GIF, WEBP, SVG."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if hasattr(file, 'content_type') and file.content_type:
            if not file.content_type.startswith('image/'):
                return Response(
                    {"detail": "Uploaded file is not a valid image."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        user = request.user
        if user.avatar:
            try:
                if os.path.exists(user.avatar.path):
                    os.remove(user.avatar.path)
            except Exception:
                pass

        user.avatar = file
        user.save(update_fields=['avatar'])

        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        user = request.user
        if user.avatar:
            try:
                if os.path.exists(user.avatar.path):
                    os.remove(user.avatar.path)
            except Exception:
                pass
            user.avatar = None
            user.save(update_fields=['avatar'])

        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
