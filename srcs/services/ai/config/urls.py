from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health(request):
    try:
        from assistant.warmup import get_warmup_status
        from assistant.rag import _bm25_project_cache
        status_str = get_warmup_status()
        if status_str == "warming_up":
            return JsonResponse({"status": "warming_up", "service": "ai-service"}, status=503)
        return JsonResponse({
            "status": "ok",
            "service": "ai-service",
            "warmup": status_str,
            "bm25_cached_projects": list(_bm25_project_cache.keys()),
        }, status=200)
    except Exception as e:
        return JsonResponse({"status": "ok", "service": "ai-service", "error": str(e)}, status=200)


urlpatterns = [
    path('health', health),
    path('admin/ai/', admin.site.urls),
    path('admin/', admin.site.urls),
    path('api/ai/', include('assistant.urls')),
    path('api/', include('assistant.urls')),
    path('internal/', include('assistant.internal_urls')),
]
