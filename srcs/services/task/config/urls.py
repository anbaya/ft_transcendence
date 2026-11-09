from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health(request):
    return JsonResponse({"status": "ok", "service": "task-service"})


urlpatterns = [
    path('health', health),
    path('admin/', admin.site.urls),
    path('api/tasks/', include('tasks.urls')),
    path('api/', include('tasks.urls')),
    path('internal/', include('tasks.internal_urls')),
]
