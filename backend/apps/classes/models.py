# apps/classes/models.py

import uuid
from django.db import models


class ClassRoom(models.Model):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school        = models.ForeignKey(
                        'schools.School',
                        on_delete=models.CASCADE,
                        related_name='classes'
                    )
    name          = models.CharField(max_length=50)       # e.g. "Grade 5" or "Class 10"
    section       = models.CharField(max_length=10)       # e.g. "A", "B"
    academic_year = models.CharField(max_length=10)       # e.g. "2024-25"
    capacity      = models.PositiveIntegerField(default=40)
    is_active     = models.BooleanField(default=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'classrooms'
        unique_together = [('school', 'name', 'section', 'academic_year')]
        ordering        = ['name', 'section']

    def __str__(self):
        return f"{self.name}-{self.section} ({self.school.name})"

    @property
    def total_students(self):
        return self.students.filter(is_active=True).count()