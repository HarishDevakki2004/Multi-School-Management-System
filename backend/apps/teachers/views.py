from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Teacher, TeacherClassAssignment
from .serializers import (
    TeacherSerializer,
    CreateTeacherSerializer,
    TeacherClassAssignmentSerializer,
)


class TeacherViewSet(viewsets.ModelViewSet):
    filterset_fields = ['is_active', 'school']
    search_fields    = ['user__first_name', 'user__last_name', 'employee_id']

    def get_queryset(self):
        user = self.request.user
        qs   = Teacher.objects.select_related('user', 'school')
        if user.role == 'super_admin':
            return qs.all()
        if user.school:
            return qs.filter(school=user.school)
        return qs.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateTeacherSerializer
        return TeacherSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        school = request.user.school
        if not school and request.user.role != 'super_admin':
            return Response(
                {"error": "You are not assigned to any school."},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Super admin must pass school in body — school_admin uses their own
        if request.user.role == 'super_admin':
            from apps.schools.models import School
            school_id = request.data.get('school')
            try:
                school = School.objects.get(id=school_id)
            except School.DoesNotExist:
                return Response({"error": "Invalid school."}, status=400)

        serializer = CreateTeacherSerializer(
            data=request.data,
            context={'school': school, 'request': request}
        )
        serializer.is_valid(raise_exception=True)
        teacher = serializer.save()
        return Response(
            TeacherSerializer(teacher).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='assign-class')
    def assign_class(self, request, pk=None):
        teacher = self.get_object()
        serializer = TeacherClassAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(teacher=teacher)
        return Response(serializer.data, status=status.HTTP_201_CREATED)