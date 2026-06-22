# apps/teachers/models.py

import uuid
from django.db import models


class Teacher(models.Model):
    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user             = models.OneToOneField(
                           'users.User',
                           on_delete=models.CASCADE,
                           related_name='teacher_profile'
                       )
    school           = models.ForeignKey(
                           'schools.School',
                           on_delete=models.CASCADE,
                           related_name='teachers'
                       )
    employee_id      = models.CharField(max_length=30, unique=True)
    qualification    = models.CharField(max_length=200)
    specialization   = models.CharField(max_length=200, blank=True)
    joining_date     = models.DateField()
    is_active        = models.BooleanField(default=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'teachers'

    def __str__(self):
        return f"{self.user.full_name} ({self.employee_id})"


class TeacherClassAssignment(models.Model):
    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher   = models.ForeignKey(
                    Teacher,
                    on_delete=models.CASCADE,
                    related_name='assignments'
                )
    classroom = models.ForeignKey(
                    'classes.ClassRoom',
                    on_delete=models.CASCADE,
                    related_name='teacher_assignments'
                )
    subject          = models.CharField(max_length=100)
    is_class_teacher = models.BooleanField(default=False)
    assigned_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'teacher_class_assignments'
        unique_together = [('teacher', 'classroom', 'subject')]

    def __str__(self):
        return f"{self.teacher.user.full_name} → {self.classroom} ({self.subject})"