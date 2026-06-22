from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, ParentProfileViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet,       basename='students')
router.register(r'parents',  ParentProfileViewSet, basename='parents')

urlpatterns = [path('', include(router.urls))]