from django.contrib import admin
from .models import Project, ProjectMember


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'status', 'priority', 'created_by', 'deadline', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('status', 'priority', 'created_at')


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'user_id', 'joined_at')
    search_fields = ('user_id', 'project__name')
    list_filter = ('joined_at', 'project')
