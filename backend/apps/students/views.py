# from rest_framework import viewsets
# from rest_framework.permissions import IsAuthenticated
# from .models import Student, ParentProfile
# from .serializers import StudentSerializer, ParentProfileSerializer


# class StudentViewSet(viewsets.ModelViewSet):
#     serializer_class = StudentSerializer
#     filterset_fields = ['classroom', 'gender', 'is_active']
#     search_fields    = ['first_name', 'last_name', 'admission_no', 'roll_number']
#     ordering_fields  = ['first_name', 'roll_number', 'admission_date']

#     def get_queryset(self):
#         user = self.request.user
#         qs   = Student.objects.select_related('school', 'classroom')
#         if user.role == 'super_admin':
#             return qs.all()
#         if user.role in ('school_admin', 'teacher') and user.school:
#             return qs.filter(school=user.school)
#         if user.role == 'parent':
#             return qs.filter(parents__user=user)
#         return qs.none()

#     def get_permissions(self):
#         return [IsAuthenticated()]

#     def perform_create(self, serializer):
#         user = self.request.user
#         if user.role == 'school_admin' and user.school:
#             serializer.save(school=user.school)
#         else:
#             serializer.save()


# class ParentProfileViewSet(viewsets.ModelViewSet):
#     serializer_class = ParentProfileSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == 'super_admin':
#             return ParentProfile.objects.select_related('user').all()
#         if user.school:
#             return ParentProfile.objects.filter(user__school=user.school)
#         return ParentProfile.objects.none()


# apps/students/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Student, ParentProfile
from .serializers import StudentSerializer, ParentProfileSerializer


class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    filterset_fields = ['classroom', 'gender', 'is_active']
    search_fields    = ['first_name', 'last_name', 'admission_no', 'roll_number']
    ordering_fields  = ['first_name', 'roll_number', 'admission_date']

    def get_queryset(self):
        user = self.request.user
        qs   = Student.objects.select_related('school', 'classroom')
        if user.role == 'super_admin':
            return qs.all()
        if user.role in ('school_admin', 'teacher') and user.school:
            return qs.filter(school=user.school)
        if user.role == 'parent':
            return qs.filter(parents__user=user)
        return qs.none()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        user = self.request.user
        # ✅ Always inject school from the logged-in user
        if user.school:
            serializer.save(school=user.school)
        else:
            serializer.save()


class ParentProfileViewSet(viewsets.ModelViewSet):
    serializer_class   = ParentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return ParentProfile.objects.select_related('user').all()
        if user.school:
            return ParentProfile.objects.filter(user__school=user.school)
        return ParentProfile.objects.none()