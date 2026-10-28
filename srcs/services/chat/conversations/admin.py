from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'project_id', 'created_at')
    search_fields = ('project_id',)
    list_filter = ('created_at',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender_id', 'short_content', 'created_at')
    search_fields = ('content', 'sender_id')
    list_filter = ('created_at', 'conversation')

    def short_content(self, obj):
        return obj.content[:50] + ("..." if len(obj.content) > 50 else "")
    short_content.short_description = "Content"
