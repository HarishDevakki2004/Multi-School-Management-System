# apps/schools/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SchoolViewSet

router = DefaultRouter()
router.register(r'schools', SchoolViewSet, basename='schools')

urlpatterns = [
    path('', include(router.urls)),
]