# apps/exams/models.py

import uuid
from django.db import models


class Exam(models.Model):
    EXAM_TYPES = [
        ('unit_test', 'Unit Test'),
        ('mid_term',  'Mid Term'),
        ('final',     'Final Exam'),
        ('practical', 'Practical'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school        = models.ForeignKey(
                        'schools.School',
                        on_delete=models.CASCADE,
                        related_name='exams'
                    )
    classroom     = models.ForeignKey(
                        'classes.ClassRoom',
                        on_delete=models.CASCADE,
                        related_name='exams'
                    )
    name          = models.CharField(max_length=255)
    exam_type     = models.CharField(max_length=20, choices=EXAM_TYPES)
    subject       = models.CharField(max_length=100)
    date          = models.DateField()
    total_marks   = models.PositiveIntegerField()
    passing_marks = models.PositiveIntegerField()
    academic_year = models.CharField(max_length=10)
    is_published  = models.BooleanField(default=False)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exams'
        ordering = ['-date']

    def __str__(self):
        return f"{self.name} - {self.subject} ({self.classroom})"


class ExamResult(models.Model):
    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam           = models.ForeignKey(
                         Exam,
                         on_delete=models.CASCADE,
                         related_name='results'
                     )
    student        = models.ForeignKey(
                         'students.Student',
                         on_delete=models.CASCADE,
                         related_name='exam_results'
                     )
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    grade          = models.CharField(max_length=5, blank=True)
    remarks        = models.CharField(max_length=255, blank=True)
    is_absent      = models.BooleanField(default=False)
    entered_by     = models.ForeignKey(
                         'users.User',
                         on_delete=models.SET_NULL,
                         null=True
                     )
    entered_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'exam_results'
        unique_together = [('exam', 'student')]

    def save(self, *args, **kwargs):
        # Auto-calculate grade on save
        if not self.is_absent and self.exam.total_marks > 0:
            pct        = (float(self.marks_obtained) / float(self.exam.total_marks)) * 100
            self.grade = self._get_grade(pct)
        elif self.is_absent:
            self.grade = 'AB'
        super().save(*args, **kwargs)

    @staticmethod
    def _get_grade(pct):
        if pct >= 90: return 'A+'
        if pct >= 80: return 'A'
        if pct >= 70: return 'B+'
        if pct >= 60: return 'B'
        if pct >= 50: return 'C'
        if pct >= 40: return 'D'
        return 'F'

    def __str__(self):
        return f"{self.student.full_name} - {self.exam.name} - {self.grade}"