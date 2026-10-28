from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'title', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user_id')
    list_filter = ('is_read', 'created_at')
