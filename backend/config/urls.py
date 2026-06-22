from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/',  include('apps.users.urls')),
    path('api/v1/',       include('apps.schools.urls')),
    path('api/v1/',       include('apps.classes.urls')),    # ← new
    path('api/v1/',       include('apps.teachers.urls')),   # ← new
    path('api/v1/',       include('apps.students.urls')),   # ← new
    path('api/v1/',       include('apps.attendance.urls')),  # ← new
    path('api/v1/',       include('apps.homework.urls')),
    path('api/v1/',       include('apps.exams.urls')),       # ← new
    path('api/v1/',       include('apps.fees.urls')),        # ← new
    path('api/v1/',       include('apps.notifications.urls')), # ← new
 
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)