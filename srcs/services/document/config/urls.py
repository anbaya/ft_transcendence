from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health(request):
    return JsonResponse({"status": "ok", "service": "document-service"})


urlpatterns = [
    path('health', health),
    path('admin/', admin.site.urls),
    path('api/documents/', include('documents.urls')),
    path('api/', include('documents.urls')),
    path('internal/', include('documents.internal_urls')),
]
