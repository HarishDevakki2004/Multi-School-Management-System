# apps/schools/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import School
from .serializers import SchoolSerializer, SchoolStatusSerializer


class SchoolViewSet(viewsets.ModelViewSet):
    queryset         = School.objects.all()
    serializer_class = SchoolSerializer
    search_fields    = ['name', 'code', 'city', 'board']
    filterset_fields = ['status', 'is_active']

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        # Super admin sees all schools
        if user.role == 'super_admin':
            return School.objects.all()

        # School admin / teacher / parent see only their school
        if user.school:
            return School.objects.filter(id=user.school.id)

        return School.objects.none()

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        school = self.get_object()
        if request.user.role != 'super_admin':
            return Response(
                {"error": "Only Super Admin can approve schools."},
                status=status.HTTP_403_FORBIDDEN
            )
        school.status = School.STATUS_APPROVED
        school.is_active = True
        school.save()
        return Response(
            {"message": f"{school.name} has been approved.", "status": school.status},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        school = self.get_object()
        if request.user.role != 'super_admin':
            return Response(
                {"error": "Only Super Admin can reject schools."},
                status=status.HTTP_403_FORBIDDEN
            )
        school.status = School.STATUS_REJECTED
        school.is_active = False
        school.save()
        return Response(
            {"message": f"{school.name} has been rejected.", "status": school.status},
            status=status.HTTP_200_OK
        )