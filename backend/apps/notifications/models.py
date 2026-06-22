# apps/notifications/models.py

import uuid
from django.db import models


class Notification(models.Model):
    TYPE_ABSENT   = 'absent_alert'
    TYPE_HOMEWORK = 'homework_update'
    TYPE_NOTICE   = 'school_notice'
    TYPE_FEE      = 'fee_reminder'
    TYPE_RESULT   = 'result_published'

    TYPE_CHOICES = [
        (TYPE_ABSENT,   'Absent Alert'),
        (TYPE_HOMEWORK, 'Homework Update'),
        (TYPE_NOTICE,   'School Notice'),
        (TYPE_FEE,      'Fee Reminder'),
        (TYPE_RESULT,   'Result Published'),
    ]

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient  = models.ForeignKey(
                     'users.User',
                     on_delete=models.CASCADE,
                     related_name='notifications'
                 )
    title      = models.CharField(max_length=255)
    message    = models.TextField()
    notif_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    is_read    = models.BooleanField(default=False)
    data       = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} → {self.recipient.email}"