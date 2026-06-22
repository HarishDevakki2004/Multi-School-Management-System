# apps/fees/models.py

import uuid
from django.db import models


class FeeCategory(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school      = models.ForeignKey(
                      'schools.School',
                      on_delete=models.CASCADE,
                      related_name='fee_categories'
                  )
    name        = models.CharField(max_length=100)   # Tuition, Transport, Library
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'fee_categories'

    def __str__(self):
        return f"{self.name} ({self.school.name})"


class FeeStructure(models.Model):
    FREQUENCY_CHOICES = [
        ('monthly',   'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly',    'Yearly'),
        ('one_time',  'One Time'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school        = models.ForeignKey(
                        'schools.School',
                        on_delete=models.CASCADE,
                        related_name='fee_structures'
                    )
    classroom     = models.ForeignKey(
                        'classes.ClassRoom',
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        related_name='fee_structures'
                    )
    category      = models.ForeignKey(
                        FeeCategory,
                        on_delete=models.CASCADE,
                        related_name='structures'
                    )
    amount        = models.DecimalField(max_digits=10, decimal_places=2)
    frequency     = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    academic_year = models.CharField(max_length=10)
    due_day       = models.PositiveIntegerField(default=10)  # Day of month fee is due

    class Meta:
        db_table = 'fee_structures'

    def __str__(self):
        return f"{self.category.name} - ₹{self.amount} ({self.frequency})"


class FeePayment(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_PAID    = 'paid'
    STATUS_PARTIAL = 'partial'
    STATUS_OVERDUE = 'overdue'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_PAID,    'Paid'),
        (STATUS_PARTIAL, 'Partial'),
        (STATUS_OVERDUE, 'Overdue'),
    ]

    METHOD_CHOICES = [
        ('cash',   'Cash'),
        ('online', 'Online'),
        ('cheque', 'Cheque'),
        ('upi',    'UPI'),
    ]

    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student        = models.ForeignKey(
                         'students.Student',
                         on_delete=models.CASCADE,
                         related_name='fee_payments'
                     )
    fee_structure  = models.ForeignKey(
                         FeeStructure,
                         on_delete=models.CASCADE,
                         related_name='payments'
                     )
    due_date       = models.DateField()
    paid_date      = models.DateField(null=True, blank=True)
    amount_due     = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    collected_by   = models.ForeignKey(
                         'users.User',
                         on_delete=models.SET_NULL,
                         null=True, blank=True
                     )
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fee_payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.full_name} - ₹{self.amount_due} ({self.status})"