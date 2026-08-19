"""
URL configuration for video_extractor project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from video_extractor.api.stream_views import stream_video

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('video_extractor.auth.urls')),
    path('api/', include('video_extractor.api.urls')),
    path('stream/<int:video_id>/', stream_video, name='stream-video'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
