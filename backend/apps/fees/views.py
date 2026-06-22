# apps/fees/views.py

# apps/fees/views.py

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import FeeCategory, FeeStructure, FeePayment
from .serializers import (
    FeeCategorySerializer,
    FeeStructureSerializer,
    FeePaymentSerializer,
)


class FeeCategoryViewSet(viewsets.ModelViewSet):
    serializer_class   = FeeCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return FeeCategory.objects.all().order_by('name')
        if user.school:
            return FeeCategory.objects.filter(
                school=user.school
            ).order_by('name')
        return FeeCategory.objects.none()

    def perform_create(self, serializer):
        serializer.save(school=self.request.user.school)


class FeeStructureViewSet(viewsets.ModelViewSet):
    serializer_class   = FeeStructureSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields   = ['academic_year', 'frequency']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return FeeStructure.objects.select_related(
                'category', 'classroom'
            ).all().order_by('category__name')
        if user.school:
            return FeeStructure.objects.filter(
                school=user.school
            ).order_by('category__name')
        return FeeStructure.objects.none()

    def perform_create(self, serializer):
        serializer.save(school=self.request.user.school)


class FeePaymentViewSet(viewsets.ModelViewSet):
    serializer_class   = FeePaymentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields   = ['status', 'student', 'payment_method']
    search_fields      = ['student__first_name', 'student__last_name']

    def get_queryset(self):
        user = self.request.user
        qs   = FeePayment.objects.select_related(
            'student', 'fee_structure', 'collected_by'
        )
        if user.role == 'super_admin':
            return qs.all().order_by('-created_at')
        if user.role in ('school_admin', 'teacher') and user.school:
            return qs.filter(
                student__school=user.school
            ).order_by('-created_at')
        if user.role == 'parent':
            return qs.filter(
                student__parents__user=user
            ).order_by('-created_at')
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(collected_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='student-summary')
    def student_summary(self, request):
        student_id = request.query_params.get('student')
        if not student_id:
            return Response({"error": "student param required."}, status=400)
        payments   = FeePayment.objects.filter(student_id=student_id)
        total_due  = sum(p.amount_due  for p in payments)
        total_paid = sum(p.amount_paid for p in payments)
        balance    = total_due - total_paid
        return Response({
            "total_due":  float(total_due),
            "total_paid": float(total_paid),
            "balance":    float(balance),
            "payments":   FeePaymentSerializer(payments, many=True).data,
        })
# from rest_framework import viewsets
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from .models import FeeCategory, FeeStructure, FeePayment
# from .serializers import (
#     FeeCategorySerializer,
#     FeeStructureSerializer,
#     FeePaymentSerializer,
# )


# class FeeCategoryViewSet(viewsets.ModelViewSet):
#     serializer_class   = FeeCategorySerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == 'super_admin':
#             return FeeCategory.objects.all()
#         if user.school:
#             return FeeCategory.objects.filter(school=user.school)
#         return FeeCategory.objects.none()

#     def perform_create(self, serializer):
#         # ✅ School injected from logged-in user — never from frontend
#         serializer.save(school=self.request.user.school)


# class FeeStructureViewSet(viewsets.ModelViewSet):
#     serializer_class   = FeeStructureSerializer
#     permission_classes = [IsAuthenticated]
#     filterset_fields   = ['academic_year', 'frequency']

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == 'super_admin':
#             return FeeStructure.objects.select_related('category', 'classroom').all()
#         if user.school:
#             return FeeStructure.objects.filter(school=user.school)
#         return FeeStructure.objects.none()

#     def perform_create(self, serializer):
#         serializer.save(school=self.request.user.school)


# class FeePaymentViewSet(viewsets.ModelViewSet):
#     serializer_class   = FeePaymentSerializer
#     permission_classes = [IsAuthenticated]
#     filterset_fields   = ['status', 'student', 'payment_method']
#     search_fields      = ['student__first_name', 'student__last_name']

#     def get_queryset(self):
#         user = self.request.user
#         qs   = FeePayment.objects.select_related(
#             'student', 'fee_structure', 'collected_by'
#         )
#         if user.role == 'super_admin':
#             return qs.all()
#         if user.role in ('school_admin', 'teacher') and user.school:
#             return qs.filter(student__school=user.school)
#         if user.role == 'parent':
#             return qs.filter(student__parents__user=user)
#         return qs.none()

#     def perform_create(self, serializer):
#         serializer.save(collected_by=self.request.user)

#     @action(detail=False, methods=['get'], url_path='student-summary')
#     def student_summary(self, request):
#         student_id = request.query_params.get('student')
#         if not student_id:
#             return Response({"error": "student param required."}, status=400)
#         payments   = FeePayment.objects.filter(student_id=student_id)
#         total_due  = sum(p.amount_due  for p in payments)
#         total_paid = sum(p.amount_paid for p in payments)
#         balance    = total_due - total_paid
#         return Response({
#             "total_due":  float(total_due),
#             "total_paid": float(total_paid),
#             "balance":    float(balance),
#             "payments":   FeePaymentSerializer(payments, many=True).data,
#         }) 
# # apps/fees/views.py

# from rest_framework import viewsets
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from .models import FeeCategory, FeeStructure, FeePayment
# from .serializers import FeeCategorySerializer, FeeStructureSerializer, FeePaymentSerializer


# # class FeeCategoryViewSet(viewsets.ModelViewSet):
# #     serializer_class   = FeeCategorySerializer
# #     permission_classes = [IsAuthenticated]

# #     def get_queryset(self):
# #         user = self.request.user
# #         if user.role == 'super_admin':
# #             return FeeCategory.objects.all()
# #         if user.school:
# #             return FeeCategory.objects.filter(school=user.school)
# #         return FeeCategory.objects.none()
# class FeeCategoryViewSet(viewsets.ModelViewSet):
#     serializer_class   = FeeCategorySerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == 'super_admin':
#             return FeeCategory.objects.all()
#         if user.school:
#             return FeeCategory.objects.filter(school=user.school)
#         return FeeCategory.objects.none()

#     def perform_create(self, serializer):
#         # ✅ Auto-set school from logged-in user
#         serializer.save(school=self.request.user.school)


# class FeeStructureViewSet(viewsets.ModelViewSet):
#     serializer_class   = FeeStructureSerializer
#     permission_classes = [IsAuthenticated]
#     filterset_fields   = ['academic_year', 'frequency']

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == 'super_admin':
#             return FeeStructure.objects.select_related('category', 'classroom').all()
#         if user.school:
#             return FeeStructure.objects.filter(school=user.school)
#         return FeeStructure.objects.none()


# class FeePaymentViewSet(viewsets.ModelViewSet):
#     serializer_class   = FeePaymentSerializer
#     permission_classes = [IsAuthenticated]
#     filterset_fields   = ['status', 'student', 'payment_method']
#     search_fields      = ['student__first_name', 'student__last_name']

#     def get_queryset(self):
#         user = self.request.user
#         qs   = FeePayment.objects.select_related(
#                    'student', 'fee_structure', 'collected_by'
#                )
#         if user.role == 'super_admin':
#             return qs.all()
#         if user.role in ('school_admin', 'teacher') and user.school:
#             return qs.filter(student__school=user.school)
#         if user.role == 'parent':
#             return qs.filter(student__parents__user=user)
#         return qs.none()

#     @action(detail=False, methods=['get'], url_path='student-summary')
#     def student_summary(self, request):
#         """
#         Total fees summary for a student.
#         Query: ?student=<uuid>
#         """
#         student_id = request.query_params.get('student')
#         if not student_id:
#             return Response({"error": "student param required."}, status=400)

#         payments  = FeePayment.objects.filter(student_id=student_id)
#         total_due  = sum(p.amount_due  for p in payments)
#         total_paid = sum(p.amount_paid for p in payments)
#         balance    = total_due - total_paid

#         return Response({
#             "total_due":  float(total_due),
#             "total_paid": float(total_paid),
#             "balance":    float(balance),
#             "payments":   FeePaymentSerializer(payments, many=True).data,
#         })