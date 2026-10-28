from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'project_id', 'uploaded_by_id', 'file', 'uploaded_at')
    list_filter = ('project_id',)
    search_fields = ('name',)
    ordering = ('-uploaded_at',)
