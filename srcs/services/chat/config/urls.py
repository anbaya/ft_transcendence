from django.contrib import admin
from django.urls import path, include

from notifications.views import InternalNotificationCreateView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('notifications.urls')),

    path(
        'internal/notifications/',
        InternalNotificationCreateView.as_view(),
        name='internal-notification-create'
    ),
]