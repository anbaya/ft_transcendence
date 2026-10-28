import time

from django.contrib import admin
from django.http import HttpResponse, JsonResponse
from django.urls import path, include

from .middleware import get_request_count
from projects.views import InternalUserDeleteView

START_TIME = time.monotonic()
SERVICE_NAME = "project-service"


def health(request):
    return JsonResponse({
        "status": "ok",
        "service": SERVICE_NAME
    })


def metrics(request):
    uptime = time.monotonic() - START_TIME
    request_count = get_request_count()

    payload = "\n".join([
        "# HELP service_up Whether the service is available.",
        "# TYPE service_up gauge",
        f'service_up{{service="{SERVICE_NAME}"}} 1',

        "# HELP service_requests_total Total HTTP requests.",
        "# TYPE service_requests_total counter",
        f'service_requests_total{{service="{SERVICE_NAME}"}} {request_count}',

        "# HELP service_uptime_seconds Service uptime in seconds.",
        "# TYPE service_uptime_seconds gauge",
        f'service_uptime_seconds{{service="{SERVICE_NAME}"}} {uptime:.2f}',
        "",
    ])

    return HttpResponse(
        payload,
        content_type="text/plain; version=0.0.4; charset=utf-8"
    )


urlpatterns = [
    path("health", health),
    path("metrics", metrics),

    path("admin/", admin.site.urls),
    path("api/projects/", include("projects.urls")),
    path("api/", include("analytics.urls")),
    path("internal/users/<int:user_id>/", InternalUserDeleteView.as_view(), name="internal-user-delete"),
]
