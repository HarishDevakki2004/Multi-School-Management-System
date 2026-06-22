# apps/homework/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Homework, HomeworkAttachment
from .serializers import HomeworkSerializer, HomeworkAttachmentSerializer


class HomeworkViewSet(viewsets.ModelViewSet):
    serializer_class   = HomeworkSerializer
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    filterset_fields   = ['classroom', 'subject', 'is_published']
    search_fields      = ['title', 'subject']

    def get_queryset(self):
        user = self.request.user
        qs   = Homework.objects.select_related('classroom', 'created_by').prefetch_related('attachments')

        if user.role == 'super_admin':
            return qs.all()
        if user.role in ('school_admin', 'teacher') and user.school:
            return qs.filter(classroom__school=user.school)
        if user.role == 'parent':
            # Parents see homework of their child's class
            from apps.students.models import Student
            student_classrooms = Student.objects.filter(
                parents__user=user
            ).values_list('classroom_id', flat=True)
            return qs.filter(classroom_id__in=student_classrooms)
        return qs.none()

    @action(
        detail=True,
        methods=['post'],
        url_path='upload-attachment',
        parser_classes=[MultiPartParser]
    )
    def upload_attachment(self, request, pk=None):
        """Upload a PDF or image file to a homework entry."""
        homework = self.get_object()
        file     = request.FILES.get('file')

        if not file:
            return Response({"error": "No file provided."}, status=400)

        # Determine file type
        name = file.name.lower()
        if name.endswith('.pdf'):
            file_type = 'pdf'
        elif name.endswith(('.jpg', '.jpeg', '.png', '.gif')):
            file_type = 'image'
        else:
            file_type = 'doc'

        attachment = HomeworkAttachment.objects.create(
            homework=homework,
            file=file,
            file_type=file_type,
            original_name=file.name,
        )
        return Response(
            HomeworkAttachmentSerializer(attachment).data,
            status=status.HTTP_201_CREATED
        )