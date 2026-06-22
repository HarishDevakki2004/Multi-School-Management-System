# apps/attendance/models.py

import uuid
from django.db import models


class Attendance(models.Model):
    STATUS_PRESENT = "present"
    STATUS_ABSENT  = "absent"
    STATUS_LATE    = "late"
    STATUS_EXCUSED = "excused"

    STATUS_CHOICES = [
        (STATUS_PRESENT, "Present"),
        (STATUS_ABSENT,  "Absent"),
        (STATUS_LATE,    "Late"),
        (STATUS_EXCUSED, "Excused"),
    ]

    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student   = models.ForeignKey(
                    'students.Student',
                    on_delete=models.CASCADE,
                    related_name='attendance_records'
                )
    classroom = models.ForeignKey(
                    'classes.ClassRoom',
                    on_delete=models.CASCADE,
                    related_name='attendance_records'
                )
    marked_by = models.ForeignKey(
                    'users.User',
                    on_delete=models.SET_NULL,
                    null=True,
                    related_name='marked_attendance'
                )
    date      = models.DateField()
    status    = models.CharField(max_length=10, choices=STATUS_CHOICES)
    remarks   = models.CharField(max_length=255, blank=True)
    marked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'attendance'
        unique_together = [('student', 'date')]   # One record per student per day
        ordering        = ['-date']

    def __str__(self):
        return f"{self.student.full_name} - {self.date} - {self.status}"