# apps/schools/models.py

import uuid
from django.db import models


class School(models.Model):
    STATUS_PENDING  = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"

    STATUS_CHOICES = [
        (STATUS_PENDING,  "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name        = models.CharField(max_length=255)
    code        = models.CharField(max_length=20, unique=True)
    email       = models.EmailField()
    phone       = models.CharField(max_length=20)
    address     = models.TextField()
    city        = models.CharField(max_length=100)
    state       = models.CharField(max_length=100)
    country     = models.CharField(max_length=100, default="India")
    pincode     = models.CharField(max_length=10)
    logo        = models.ImageField(upload_to="school_logos/", null=True, blank=True)
    website     = models.URLField(blank=True)
    board       = models.CharField(max_length=100, blank=True)  # CBSE, ICSE, State
    established = models.DateField(null=True, blank=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "schools"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"