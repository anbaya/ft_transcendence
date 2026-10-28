from django.contrib import admin
from .models import AIInteraction, DocumentChunk


@admin.register(AIInteraction)
class AIInteractionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'project_id', 'short_question', 'created_at')
    search_fields = ('question', 'answer', 'user_id', 'project_id')
    list_filter = ('created_at',)

    def short_question(self, obj):
        return obj.question[:60] + ("..." if len(obj.question) > 60 else "")
    short_question.short_description = "Question"


@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ('id', 'project_id', 'document_id', 'chunk_index', 'content_hash', 'created_at')
    search_fields = ('content', 'content_hash', 'doc_hash')
    list_filter = ('project_id', 'document_id', 'created_at')
