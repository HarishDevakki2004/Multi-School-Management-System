# apps/attendance/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Attendance
from .serializers import (
    AttendanceSerializer,
    BulkAttendanceSerializer,
    AttendanceSummarySerializer,
)
from apps.classes.models import ClassRoom
from apps.students.models import Student


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    filterset_fields = ['date', 'status', 'classroom']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = Attendance.objects.select_related(
                   'student', 'classroom', 'marked_by'
               )
        if user.role == 'super_admin':
            return qs.all()
        if user.role in ('school_admin', 'teacher') and user.school:
            return qs.filter(classroom__school=user.school)
        if user.role == 'parent':
            return qs.filter(student__parents__user=user)
        return qs.none()

    @action(detail=False, methods=['post'], url_path='mark-bulk')
    def mark_bulk(self, request):
        """
        Mark attendance for a full class at once.
        Body:
        {
            "classroom": "uuid",
            "date": "2024-04-28",
            "attendance": [
                {"student": "uuid1", "status": "present", "remarks": ""},
                {"student": "uuid2", "status": "absent",  "remarks": "Sick"}
            ]
        }
        """
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        classroom = get_object_or_404(ClassRoom, id=serializer.validated_data['classroom'])
        date      = serializer.validated_data['date']
        records   = serializer.validated_data['attendance']

        created = []
        updated = []

        for item in records:
            obj, is_created = Attendance.objects.update_or_create(
                student_id=item['student'],
                date=date,
                defaults={
                    'classroom':  classroom,
                    'marked_by':  request.user,
                    'status':     item['status'],
                    'remarks':    item.get('remarks', ''),
                }
            )
            if is_created:
                created.append(str(obj.id))
            else:
                updated.append(str(obj.id))

        return Response(
            {
                "message":  f"Attendance marked for {len(records)} students.",
                "date":     str(date),
                "created":  len(created),
                "updated":  len(updated),
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """
        Get attendance summary for a student.
        Query params: ?student=<uuid>&month=4&year=2024
        """
        student_id = request.query_params.get('student')
        month      = request.query_params.get('month')
        year       = request.query_params.get('year')

        if not student_id:
            return Response({"error": "student query param required."}, status=400)

        student = get_object_or_404(Student, id=student_id)
        qs      = Attendance.objects.filter(student=student)

        if month and year:
            qs = qs.filter(date__month=month, date__year=year)
        elif year:
            qs = qs.filter(date__year=year)

        total   = qs.count()
        present = qs.filter(status=Attendance.STATUS_PRESENT).count()
        absent  = qs.filter(status=Attendance.STATUS_ABSENT).count()
        late    = qs.filter(status=Attendance.STATUS_LATE).count()
        excused = qs.filter(status=Attendance.STATUS_EXCUSED).count()
        pct     = round((present / total) * 100, 1) if total > 0 else 0.0

        return Response({
            "student":                student.full_name,
            "total":                  total,
            "present":                present,
            "absent":                 absent,
            "late":                   late,
            "excused":                excused,
            "attendance_percentage":  pct,
        })