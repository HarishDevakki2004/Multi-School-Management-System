# apps/exams/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, ExamResultViewSet

router = DefaultRouter()
router.register(r'exams',        ExamViewSet,       basename='exams')
router.register(r'exam-results', ExamResultViewSet, basename='exam-results')

urlpatterns = [path('', include(router.urls))]