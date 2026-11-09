from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include

from projects.views import InternalUserDeleteView

SERVICE_NAME = "project-service"


def health(request):
    return JsonResponse({
        "status": "ok",
        "service": SERVICE_NAME
    })


urlpatterns = [
    path("health", health),

    path("admin/", admin.site.urls),
    path("api/projects/", include("projects.urls")),
    path("internal/users/<int:user_id>/", InternalUserDeleteView.as_view(), name="internal-user-delete"),
]
