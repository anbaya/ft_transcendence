from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health(request):
    return JsonResponse({"status": "ok", "service": "auth-service"})


urlpatterns = [
    path("health", health),
    path("admin/", admin.site.urls),
    path("admin/auth/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("internal/", include("users.internal_urls")),
]
