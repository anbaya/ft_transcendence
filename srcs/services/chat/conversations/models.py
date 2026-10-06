from django.db import models


class Conversation(models.Model):
    id = models.BigAutoField(primary_key=True)
    project_id = models.BigIntegerField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Project conversation {self.project_id}"


class Message(models.Model):
    id = models.BigAutoField(primary_key=True)

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    sender_id = models.BigIntegerField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'id']

    def __str__(self):
        return f"Message {self.id}"