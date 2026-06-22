# from rest_framework import serializers
# from .models import ClassRoom


# class ClassRoomSerializer(serializers.ModelSerializer):
#     total_students = serializers.IntegerField(read_only=True)
#     school_name    = serializers.CharField(source='school.name', read_only=True)

#     class Meta:
#         model  = ClassRoom
#         fields = [
#             'id', 'school', 'school_name', 'name', 'section',
#             'academic_year', 'capacity', 'total_students',
#             'is_active', 'created_at',
#         ]
#         read_only_fields = ['id', 'created_at']

# apps/classes/serializers.py

from rest_framework import serializers
from .models import ClassRoom


class ClassRoomSerializer(serializers.ModelSerializer):
    total_students = serializers.IntegerField(read_only=True)
    school_name    = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = ClassRoom
        fields = [
            'id', 'school', 'school_name', 'name', 'section',
            'academic_year', 'capacity', 'total_students',
            'is_active', 'created_at',
        ]
        # ✅ school is set automatically in perform_create
        read_only_fields = ['id', 'created_at', 'school']