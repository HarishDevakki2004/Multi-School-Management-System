# apps/homework/serializers.py

from rest_framework import serializers
from .models import Homework, HomeworkAttachment


class HomeworkAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = HomeworkAttachment
        fields = ['id', 'file', 'file_type', 'original_name', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class HomeworkSerializer(serializers.ModelSerializer):
    attachments    = HomeworkAttachmentSerializer(many=True, read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model  = Homework
        fields = [
            'id', 'classroom', 'classroom_name',
            'created_by', 'created_by_name',
            'subject', 'title', 'description',
            'due_date', 'is_published',
            'attachments', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)