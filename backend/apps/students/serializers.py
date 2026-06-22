# from rest_framework import serializers
# from .models import Student, ParentProfile


# class StudentSerializer(serializers.ModelSerializer):
#     full_name      = serializers.CharField(read_only=True)
#     classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
#     school_name    = serializers.CharField(source='school.name',       read_only=True)

#     class Meta:
#         model  = Student
#         fields = [
#             'id', 'school', 'school_name', 'classroom', 'classroom_name',
#             'admission_no', 'first_name', 'last_name', 'full_name',
#             'date_of_birth', 'gender', 'blood_group', 'photo',
#             'address', 'roll_number', 'emergency_contact',
#             'admission_date', 'is_active', 'created_at',
#         ]
#         read_only_fields = ['id', 'created_at']


# class ParentProfileSerializer(serializers.ModelSerializer):
#     full_name = serializers.CharField(source='user.full_name', read_only=True)
#     email     = serializers.CharField(source='user.email',     read_only=True)

#     class Meta:
#         model  = ParentProfile
#         fields = ['id', 'user', 'full_name', 'email', 'relation', 'occupation']
#         read_only_fields = ['id']

# apps/students/serializers.py

from rest_framework import serializers
from .models import Student, ParentProfile


class StudentSerializer(serializers.ModelSerializer):
    full_name      = serializers.CharField(read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    school_name    = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = Student
        fields = [
            'id', 'school', 'school_name', 'classroom', 'classroom_name',
            'admission_no', 'first_name', 'last_name', 'full_name',
            'date_of_birth', 'gender', 'blood_group', 'photo',
            'address', 'roll_number', 'emergency_contact',
            'admission_date', 'is_active', 'created_at',
        ]
        # ✅ school is set automatically in perform_create
        read_only_fields = ['id', 'created_at', 'school']


class ParentProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    email     = serializers.CharField(source='user.email',     read_only=True)

    class Meta:
        model  = ParentProfile
        fields = ['id', 'user', 'full_name', 'email', 'relation', 'occupation']
        read_only_fields = ['id']