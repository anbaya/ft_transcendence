from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'project_id', 'status', 'priority', 'assignee_id', 'creator_id', 'deadline', 'created_at')
    list_filter = ('status', 'priority', 'project_id')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)
