from django.db import models


class Document(models.Model):
    project_id = models.IntegerField()
    uploaded_by_id = models.IntegerField()

    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name