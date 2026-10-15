import time
from django.contrib import admin
from django.http import HttpResponse, JsonResponse
from django.urls import path, include

START_TIME = time.time()
REQUEST_COUNT = 0

def health(request):
    return JsonResponse({"status": "ok", "service": "ai-service"})

def metrics(request):
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    uptime = max(0.0, time.time() - START_TIME)
    payload = "\n".join([
        'service_up{service="ai-service"} 1',
        f'service_requests_total{{service="ai-service"}} {REQUEST_COUNT}',
        f'service_uptime_seconds{{service="ai-service"}} {uptime:.2f}',
        "",
    ])
    return HttpResponse(payload, content_type="text/plain; version=0.0.4")

urlpatterns = [
    path('health', health),
    path('metrics', metrics),
    path('admin/', admin.site.urls),
    path('api/ai/', include('assistant.urls')),
    path('api/', include('assistant.urls')),
]
