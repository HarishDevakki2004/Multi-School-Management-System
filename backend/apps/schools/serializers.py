# apps/schools/serializers.py

from rest_framework import serializers
from .models import School


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model  = School
        fields = [
            'id', 'name', 'code', 'email', 'phone',
            'address', 'city', 'state', 'country', 'pincode',
            'logo', 'website', 'board', 'established',
            'status', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'status']


class SchoolStatusSerializer(serializers.ModelSerializer):
    """Used only for approve/reject actions."""
    class Meta:
        model  = School
        fields = ['id', 'name', 'status']
        read_only_fields = ['id', 'name']