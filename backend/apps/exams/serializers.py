# apps/exams/serializers.py

from rest_framework import serializers
from .models import Exam, ExamResult


class ExamSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    school_name    = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = Exam
        fields = [
            'id', 'school', 'school_name', 'classroom', 'classroom_name',
            'name', 'exam_type', 'subject', 'date',
            'total_marks', 'passing_marks', 'academic_year',
            'is_published', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ExamResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    exam_name    = serializers.CharField(source='exam.name',         read_only=True)
    subject      = serializers.CharField(source='exam.subject',      read_only=True)
    total_marks  = serializers.IntegerField(source='exam.total_marks', read_only=True)
    percentage   = serializers.SerializerMethodField()

    class Meta:
        model  = ExamResult
        fields = [
            'id', 'exam', 'exam_name', 'subject', 'total_marks',
            'student', 'student_name',
            'marks_obtained', 'grade', 'percentage',
            'remarks', 'is_absent', 'entered_at',
        ]
        read_only_fields = ['id', 'grade', 'entered_at', 'entered_by']

    def get_percentage(self, obj):
        if obj.is_absent or obj.exam.total_marks == 0:
            return 0.0
        return round((float(obj.marks_obtained) / float(obj.exam.total_marks)) * 100, 1)


class BulkResultSerializer(serializers.Serializer):
    """Upload marks for all students at once."""
    exam    = serializers.UUIDField()
    results = serializers.ListField(child=serializers.DictField())

    def validate_results(self, value):
        for item in value:
            if 'student' not in item:
                raise serializers.ValidationError("Each result needs 'student'.")
            if 'marks_obtained' not in item and not item.get('is_absent'):
                raise serializers.ValidationError("Each result needs 'marks_obtained' or 'is_absent'.")
        return value