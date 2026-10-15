from django.db import models

class AIInteraction(models.Model):
    id = models.BigAutoField(primary_key=True)

    user_id = models.BigIntegerField()
    project_id = models.BigIntegerField(null=True, blank=True)

    question = models.TextField()
    answer = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'id']

    def __str__(self):
        return f"User {self.user_id} - Project {self.project_id}"

class DocumentChunk(models.Model):
    id = models.BigAutoField(primary_key=True)

    project_id = models.BigIntegerField()
    document_id = models.BigIntegerField()

    content = models.TextField()
    embedding = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document {self.document_id} - Chunk {self.id}"