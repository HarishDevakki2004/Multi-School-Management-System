# from rest_framework import viewsets
# from rest_framework.permissions import IsAuthenticated
# from .models import ClassRoom
# from .serializers import ClassRoomSerializer


# class ClassRoomViewSet(viewsets.ModelViewSet):
#     serializer_class = ClassRoomSerializer
#     filterset_fields = ['is_active', 'academic_year']
#     search_fields    = ['name', 'section']

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == 'super_admin':
#             return ClassRoom.objects.select_related('school').all()
#         if user.school:
#             return ClassRoom.objects.select_related('school').filter(school=user.school)
#         return ClassRoom.objects.none()

#     def get_permissions(self):
#         return [IsAuthenticated()]

#     def perform_create(self, serializer):
#         # School admin can only create classes for their school
#         user = self.request.user
#         if user.role == 'school_admin' and user.school:
#             serializer.save(school=user.school)
#         else:
#             serializer.save()

# apps/classes/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ClassRoom
from .serializers import ClassRoomSerializer


class ClassRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ClassRoomSerializer
    filterset_fields = ['is_active', 'academic_year']
    search_fields    = ['name', 'section']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return ClassRoom.objects.select_related('school').all()
        if user.school:
            return ClassRoom.objects.select_related('school').filter(school=user.school)
        return ClassRoom.objects.none()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        user = self.request.user
        # ✅ Always inject school from the logged-in user
        if user.school:
            serializer.save(school=user.school)
        else:
            serializer.save()