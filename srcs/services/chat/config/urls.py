from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include

SERVICE_NAME = "chat-service"


def health(request):
    return JsonResponse({
        "status": "ok",
        "service": SERVICE_NAME
    })


urlpatterns = [
    path("health", health),

    path("admin/chat/", admin.site.urls),
    path("admin/", admin.site.urls),

    path(
        "api/conversations/",
        include("conversations.urls")
    ),

    path(
        "internal/",
        include("conversations.internal_urls")
    ),

    path(
        "api/",
        include("notifications.urls")
    ),

    path(
        "internal/",
        include("notifications.internal_urls")
    ),
]
