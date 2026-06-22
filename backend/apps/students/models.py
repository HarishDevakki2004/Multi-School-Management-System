# apps/students/models.py

import uuid
from django.db import models


class Student(models.Model):
    GENDER_MALE   = 'M'
    GENDER_FEMALE = 'F'
    GENDER_OTHER  = 'O'
    GENDER_CHOICES = [
        (GENDER_MALE,   'Male'),
        (GENDER_FEMALE, 'Female'),
        (GENDER_OTHER,  'Other'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school        = models.ForeignKey(
                        'schools.School',
                        on_delete=models.CASCADE,
                        related_name='students'
                    )
    classroom     = models.ForeignKey(
                        'classes.ClassRoom',
                        on_delete=models.SET_NULL,
                        null=True,
                        blank=True,
                        related_name='students'
                    )
    admission_no  = models.CharField(max_length=30, unique=True)
    first_name    = models.CharField(max_length=100)
    last_name     = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender        = models.CharField(max_length=1, choices=GENDER_CHOICES)
    blood_group   = models.CharField(max_length=5, blank=True)
    photo         = models.ImageField(upload_to='student_photos/', null=True, blank=True)
    address       = models.TextField(blank=True)
    roll_number   = models.PositiveIntegerField(null=True, blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True)
    admission_date    = models.DateField()
    is_active     = models.BooleanField(default=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        ordering = ['classroom', 'roll_number']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.admission_no})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class ParentProfile(models.Model):
    RELATION_CHOICES = [
        ('father',   'Father'),
        ('mother',   'Mother'),
        ('guardian', 'Guardian'),
    ]

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.OneToOneField(
                     'users.User',
                     on_delete=models.CASCADE,
                     related_name='parent_profile'
                 )
    students   = models.ManyToManyField(
                     Student,
                     related_name='parents',
                     blank=True
                 )
    relation   = models.CharField(max_length=20, choices=RELATION_CHOICES)
    occupation = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'parent_profiles'

    def __str__(self):
        return f"{self.user.full_name} ({self.relation})"