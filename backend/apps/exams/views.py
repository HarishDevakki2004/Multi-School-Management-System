# apps/exams/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Exam, ExamResult
from .serializers import ExamSerializer, ExamResultSerializer, BulkResultSerializer


class ExamViewSet(viewsets.ModelViewSet):
    serializer_class   = ExamSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields   = ['exam_type', 'subject', 'academic_year', 'is_published']
    search_fields      = ['name', 'subject']

    def get_queryset(self):
        user = self.request.user
        qs   = Exam.objects.select_related('school', 'classroom')
        if user.role == 'super_admin':
            return qs.all()
        if user.school:
            return qs.filter(school=user.school)
        return qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'school_admin' and user.school:
            serializer.save(school=user.school)
        else:
            serializer.save()


class ExamResultViewSet(viewsets.ModelViewSet):
    serializer_class   = ExamResultSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields   = ['exam', 'student']

    def get_queryset(self):
        user = self.request.user
        qs   = ExamResult.objects.select_related('exam', 'student')
        if user.role == 'super_admin':
            return qs.all()
        if user.role in ('school_admin', 'teacher') and user.school:
            return qs.filter(exam__school=user.school)
        if user.role == 'parent':
            return qs.filter(student__parents__user=user)
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(entered_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request):
        """
        Upload marks for multiple students at once.
        Body:
        {
            "exam": "exam-uuid",
            "results": [
                {"student": "uuid1", "marks_obtained": 85, "remarks": "Good"},
                {"student": "uuid2", "is_absent": true}
            ]
        }
        """
        serializer = BulkResultSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        exam    = get_object_or_404(Exam, id=serializer.validated_data['exam'])
        results = serializer.validated_data['results']
        saved   = []

        for item in results:
            obj, _ = ExamResult.objects.update_or_create(
                exam=exam,
                student_id=item['student'],
                defaults={
                    'marks_obtained': item.get('marks_obtained', 0),
                    'is_absent':      item.get('is_absent', False),
                    'remarks':        item.get('remarks', ''),
                    'entered_by':     request.user,
                }
            )
            saved.append(obj)

        return Response(
            {
                "message": f"Results saved for {len(saved)} students.",
                "exam":    exam.name,
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='student-report')
    def student_report(self, request):
        """
        Get all exam results for a student.
        Query: ?student=<uuid>&academic_year=2024-25
        """
        student_id    = request.query_params.get('student')
        academic_year = request.query_params.get('academic_year')

        if not student_id:
            return Response({"error": "student param required."}, status=400)

        qs = ExamResult.objects.filter(
            student_id=student_id
        ).select_related('exam', 'student')

        if academic_year:
            qs = qs.filter(exam__academic_year=academic_year)

        serializer = ExamResultSerializer(qs, many=True)
        return Response(serializer.data)