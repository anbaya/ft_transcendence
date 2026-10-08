import os

from django.http import JsonResponse
from django.urls import path

SERVICE_NAME = os.environ.get("SERVICE_NAME", "backend-service")


def health(request):
    return JsonResponse({"status": "ok", "service": SERVICE_NAME})


def metrics(request):
    payload = "\n".join([
        "# HELP service_up Whether the service is available.",
        "# TYPE service_up gauge",
        f'service_up{{service="{SERVICE_NAME}"}} 1',
        "",
    ])
    return JsonResponse({"metrics": payload}) if request.headers.get("Accept") == "application/json" else _metrics_response(payload)


def _metrics_response(payload):
    from django.http import HttpResponse

    return HttpResponse(payload, content_type="text/plain; version=0.0.4")


urlpatterns = [
    path("health", health),
    path("metrics", metrics),
]
