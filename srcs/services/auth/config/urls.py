import time
from django.contrib import admin
from django.http import HttpResponse, JsonResponse
from django.urls import path, include

START_TIME = time.time()
REQUEST_COUNT = 0


def health(request):
    return JsonResponse({"status": "ok", "service": "auth-service"})


def metrics(request):
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    uptime = max(0.0, time.time() - START_TIME)
    payload = "\n".join([
        "# HELP service_up Whether the service is available.",
        "# TYPE service_up gauge",
        'service_up{service="auth-service"} 1',
        "# HELP service_requests_total Total scrape/request count.",
        "# TYPE service_requests_total counter",
        f'service_requests_total{{service="auth-service"}} {REQUEST_COUNT}',
        "# HELP service_uptime_seconds Service uptime in seconds.",
        "# TYPE service_uptime_seconds gauge",
        f'service_uptime_seconds{{service="auth-service"}} {uptime:.2f}',
        "",
    ])
    return HttpResponse(payload, content_type="text/plain; version=0.0.4")


urlpatterns = [
    path("health", health),
    path("metrics", metrics),
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("internal/", include("users.internal_urls")),
]