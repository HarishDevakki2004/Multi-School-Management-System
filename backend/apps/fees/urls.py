# apps/fees/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeeCategoryViewSet, FeeStructureViewSet, FeePaymentViewSet

router = DefaultRouter()
router.register(r'fee-categories', FeeCategoryViewSet, basename='fee-categories')
router.register(r'fee-structures', FeeStructureViewSet, basename='fee-structures')
router.register(r'fee-payments',   FeePaymentViewSet,   basename='fee-payments')

urlpatterns = [path('', include(router.urls))]