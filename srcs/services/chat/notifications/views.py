from rest_framework import generics, status
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.permissions import IsAuthenticated
from .authentication import ServiceJWTAuthentication
from rest_framework.views import APIView
from .permissions import IsInternalService
from .services import create_notification

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    authentication_classes = [ServiceJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user_id=self.request.user.id
        ).order_by('-created_at')

class NotificationReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer

    authentication_classes = [ServiceJWTAuthentication]
    permission_classes = [IsAuthenticated]

    http_method_names = ['patch', 'options']

    def get_queryset(self):
        return Notification.objects.filter(
            user_id=self.request.user.id
        )

    def patch(self, request, *args, **kwargs):
        notification = self.get_object()

        notification.is_read = True
        notification.save(update_fields=['is_read'])

        return Response(
            NotificationSerializer(notification).data,
            status=status.HTTP_200_OK
        )

class NotificationReadAllView(APIView):
    authentication_classes = [ServiceJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        Notification.objects.filter(
            user_id=request.user.id,
            is_read=False
        ).update(is_read=True)

        return Response(
            {"message": "All notifications marked as read."},
            status=status.HTTP_200_OK
        )

class InternalNotificationCreateView(APIView):
    authentication_classes = []
    permission_classes = [IsInternalService]

    def post(self, request):
        serializer = NotificationSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        title = serializer.validated_data["title"].strip()
        message = serializer.validated_data["message"].strip()
        if not title or not message:
            return Response(
                {"error": "Title and message cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        notification = create_notification(
            user_id=serializer.validated_data["user_id"],
            title=title,
            message=message
        )

        return Response(
            NotificationSerializer(notification).data,
            status=status.HTTP_201_CREATED
        )

class InternalUserNotificationsDeleteView(APIView):
    authentication_classes = []
    permission_classes = [IsInternalService]

    def delete(self, request, user_id):
        Notification.objects.filter(user_id=user_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
