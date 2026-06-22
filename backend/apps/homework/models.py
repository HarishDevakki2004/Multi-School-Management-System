# apps/homework/models.py

import uuid
from django.db import models


class Homework(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    classroom   = models.ForeignKey(
                      'classes.ClassRoom',
                      on_delete=models.CASCADE,
                      related_name='homework'
                  )
    created_by  = models.ForeignKey(
                      'users.User',
                      on_delete=models.CASCADE,
                      related_name='homework_created'
                  )
    subject     = models.CharField(max_length=100)
    title       = models.CharField(max_length=255)
    description = models.TextField()
    due_date    = models.DateField()
    is_published = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'homework'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.classroom}"


class HomeworkAttachment(models.Model):
    FILE_TYPE_CHOICES = [
        ('pdf',   'PDF'),
        ('image', 'Image'),
        ('doc',   'Document'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    homework      = models.ForeignKey(
                        Homework,
                        on_delete=models.CASCADE,
                        related_name='attachments'
                    )
    file          = models.FileField(upload_to='homework_files/%Y/%m/')
    file_type     = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    original_name = models.CharField(max_length=255)
    uploaded_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'homework_attachments'