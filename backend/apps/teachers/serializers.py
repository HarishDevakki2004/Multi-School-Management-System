from rest_framework import serializers
from .models import Teacher, TeacherClassAssignment


class TeacherClassAssignmentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)

    class Meta:
        model  = TeacherClassAssignment
        fields = [
            'id', 'classroom', 'classroom_name',
            'subject', 'is_class_teacher', 'assigned_at'
        ]
        read_only_fields = ['id', 'assigned_at']


class TeacherSerializer(serializers.ModelSerializer):
    full_name   = serializers.CharField(source='user.full_name', read_only=True)
    email       = serializers.CharField(source='user.email',     read_only=True)
    phone       = serializers.CharField(source='user.phone',     read_only=True)
    school_name = serializers.CharField(source='school.name',    read_only=True)
    assignments = TeacherClassAssignmentSerializer(many=True,    read_only=True)

    class Meta:
        model  = Teacher
        fields = [
            'id', 'user', 'full_name', 'email', 'phone',
            'school', 'school_name', 'employee_id',
            'qualification', 'specialization', 'joining_date',
            'is_active', 'assignments', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class CreateTeacherSerializer(serializers.Serializer):
    """
    Creates a User account + Teacher profile in one request.
    """
    # User fields
    email      = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name  = serializers.CharField(max_length=100)
    phone      = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password   = serializers.CharField(write_only=True, min_length=8)

    # Teacher fields
    employee_id    = serializers.CharField(max_length=30)
    qualification  = serializers.CharField(max_length=200)
    specialization = serializers.CharField(max_length=200, required=False, allow_blank=True)
    joining_date   = serializers.DateField()

    def validate_email(self, value):
        from apps.users.models import User
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_employee_id(self, value):
        if Teacher.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError("This employee ID is already taken.")
        return value

    def create(self, validated_data):
        from apps.users.models import User
        # Extract user fields
        user_data = {
            'email':      validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name':  validated_data.pop('last_name'),
            'phone':      validated_data.pop('phone', ''),
            'role':       User.TEACHER,
            'school':     self.context['school'],
        }
        password = validated_data.pop('password')

        # Create User
        user = User.objects.create_user(password=password, **user_data)

        # Create Teacher profile
        teacher = Teacher.objects.create(
            user=user,
            school=self.context['school'],
            **validated_data
        )
        return teacher