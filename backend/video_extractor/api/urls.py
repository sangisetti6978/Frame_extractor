from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import admin_views
from . import ai_views

router = DefaultRouter()
router.register(r'images', views.ImageViewSet, basename='image')
router.register(r'videos', views.VideoViewSet, basename='video')
router.register(r'config', views.ConfigViewSet, basename='config')

urlpatterns = [
    path('', include(router.urls)),
    path('ai/ask/', ai_views.ask_ai, name='ask-ai'),
    # ── Admin-only endpoints ──────────────────────────────────────────────────
    path('admin/stats/', admin_views.admin_stats, name='admin-stats'),
    path('admin/users/', admin_views.admin_users, name='admin-users'),
    path('admin/users/<int:user_id>/toggle/', admin_views.admin_toggle_user, name='admin-toggle-user'),
    path('admin/users/<int:user_id>/delete/', admin_views.admin_delete_user, name='admin-delete-user'),
    path('admin/videos/', admin_views.admin_videos, name='admin-videos'),
    path('admin/videos/<int:video_id>/delete/', admin_views.admin_delete_video, name='admin-delete-video'),
    path('admin/frames/', admin_views.admin_frames, name='admin-frames'),
    path('admin/frames/<int:frame_id>/delete/', admin_views.admin_delete_frame, name='admin-delete-frame'),
    path('admin/activity/', admin_views.admin_activity, name='admin-activity'),
    # ── Help Desk content endpoints ───────────────────────────────────────────
    path('help/', admin_views.help_content_get, name='help-content-get'),
    path('help/<str:section>/update/', admin_views.help_content_update, name='help-content-update'),
    path('help/<str:section>/clear-video/', admin_views.help_content_clear_video, name='help-content-clear-video'),
]

