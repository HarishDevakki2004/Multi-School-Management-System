# apps/attendance/serializers.py

from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    student_name  = serializers.CharField(source='student.full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.full_name', read_only=True)

    class Meta:
        model  = Attendance
        fields = [
            'id', 'student', 'student_name',
            'classroom', 'classroom_name',
            'marked_by', 'marked_by_name',
            'date', 'status', 'remarks', 'marked_at',
        ]
        read_only_fields = ['id', 'marked_at', 'marked_by']


class BulkAttendanceSerializer(serializers.Serializer):
    """
    Mark attendance for entire class in one request.
    """
    classroom     = serializers.UUIDField()
    date          = serializers.DateField()
    attendance    = serializers.ListField(
        child=serializers.DictField()
    )

    def validate_attendance(self, value):
        for item in value:
            if 'student' not in item:
                raise serializers.ValidationError("Each item must have 'student' field.")
            if 'status' not in item:
                raise serializers.ValidationError("Each item must have 'status' field.")
            valid_statuses = ['present', 'absent', 'late', 'excused']
            if item['status'] not in valid_statuses:
                raise serializers.ValidationError(
                    f"Status must be one of {valid_statuses}."
                )
        return value


class AttendanceSummarySerializer(serializers.Serializer):
    """Read-only summary for a student."""
    total               = serializers.IntegerField()
    present             = serializers.IntegerField()
    absent              = serializers.IntegerField()
    late                = serializers.IntegerField()
    excused             = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()