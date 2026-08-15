"""
Admin-only API views for FrameExtractor Studio.
Accessible only to users with is_staff=True or is_superuser=True.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Count, Sum, Q
from django.conf import settings
import os

from video_extractor.core.models import User, VideoUpload, CapturedImage, HelpContent


# ── Custom permission: staff/superuser only ────────────────────────────────────
class IsAdminUser(BasePermission):
    """Only allow staff or superuser accounts."""
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated and
                    (request.user.is_staff or request.user.is_superuser))


# ── Helper: human-readable file size ─────────────────────────────────────────
def _fmt_bytes(n):
    if n is None:
        return '0 B'
    n = int(n)
    for unit in ('B', 'KB', 'MB', 'GB', 'TB'):
        if n < 1024:
            return f'{n:.1f} {unit}'
        n /= 1024
    return f'{n:.1f} PB'


def _dir_size(path):
    """Return total size of a directory tree in bytes."""
    total = 0
    try:
        for dirpath, dirnames, filenames in os.walk(path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                try:
                    total += os.path.getsize(fp)
                except OSError:
                    pass
    except OSError:
        pass
    return total


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/admin/stats/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_stats(request):
    """High-level platform overview statistics."""
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    staff_users = User.objects.filter(is_staff=True).count()
    total_videos = VideoUpload.objects.count()
    total_frames = CapturedImage.objects.count()

    # Storage used
    media_root = settings.MEDIA_ROOT
    storage_bytes = _dir_size(media_root)

    # New users today
    today = timezone.now().date()
    new_today = User.objects.filter(created_at__date=today).count()

    # New videos today
    videos_today = VideoUpload.objects.filter(created_at__date=today).count()

    # Active users in last 7 days
    week_ago = timezone.now() - timezone.timedelta(days=7)
    active_week = User.objects.filter(last_seen__gte=week_ago).count()

    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'staff_users': staff_users,
        'new_today': new_today,
        'active_this_week': active_week,
        'total_videos': total_videos,
        'videos_today': videos_today,
        'total_frames': total_frames,
        'storage_bytes': storage_bytes,
        'storage_display': _fmt_bytes(storage_bytes),
    })


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/admin/users/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_users(request):
    """Return all users with their video and frame counts."""
    search = request.query_params.get('search', '').strip()
    users_qs = User.objects.annotate(
        video_count=Count('videos', distinct=True),
        frame_count=Count('captured_images', distinct=True),
    ).order_by('-created_at')

    if search:
        users_qs = users_qs.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search)
        )

    data = []
    for u in users_qs:
        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'is_active': u.is_active,
            'is_staff': u.is_staff,
            'is_superuser': u.is_superuser,
            'is_email_verified': u.is_email_verified,
            'video_count': u.video_count,
            'frame_count': u.frame_count,
            'created_at': u.created_at.isoformat() if u.created_at else None,
            'last_login': u.last_login.isoformat() if u.last_login else None,
            'last_seen': u.last_seen.isoformat() if u.last_seen else None,
        })

    return Response({'users': data, 'total': len(data)})


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /api/admin/users/<user_id>/toggle/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_toggle_user(request, user_id):
    """Toggle a user's is_active status (ban / unban)."""
    if request.user.id == user_id:
        return Response({'error': "You cannot deactivate your own account."}, status=400)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    user.is_active = not user.is_active
    user.save(update_fields=['is_active'])
    return Response({
        'id': user.id,
        'username': user.username,
        'is_active': user.is_active,
        'message': f"User {'activated' if user.is_active else 'deactivated'} successfully."
    })


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /api/admin/users/<user_id>/delete/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_delete_user(request, user_id):
    """Permanently delete a user and all their data."""
    if request.user.id == user_id:
        return Response({'error': "You cannot delete your own account."}, status=400)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    username = user.username
    user.delete()
    return Response({'message': f"User '{username}' deleted successfully."})


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/admin/videos/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_videos(request):
    """Return ALL videos across all users."""
    search = request.query_params.get('search', '').strip()
    videos_qs = VideoUpload.objects.select_related('user').order_by('-created_at')

    if search:
        videos_qs = videos_qs.filter(
            Q(video_name__icontains=search) |
            Q(user__username__icontains=search)
        )

    data = []
    for v in videos_qs:
        data.append({
            'id': v.id,
            'filename': v.video_name,
            'status': v.status,
            'file_size': v.video_size,
            'file_size_display': _fmt_bytes(v.video_size),
            'duration': v.duration,
            'frame_count': v.frames_extracted,
            'created_at': v.created_at.isoformat() if v.created_at else None,
            'user': {
                'id': v.user.id,
                'username': v.user.username,
            }
        })

    return Response({'videos': data, 'total': len(data)})


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /api/admin/videos/<video_id>/delete/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_delete_video(request, video_id):
    """Delete any video by ID."""
    try:
        video = VideoUpload.objects.get(id=video_id)
    except VideoUpload.DoesNotExist:
        return Response({'error': 'Video not found'}, status=404)

    name = video.video_name
    # Delete file from disk is handled by the post_delete signal on the model
    video.delete()
    return Response({'message': f"Video '{name}' deleted."})


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/admin/frames/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_frames(request):
    """Return all captured frames across all users."""
    search = request.query_params.get('search', '').strip()
    frames_qs = CapturedImage.objects.select_related('user').order_by('-created_at')

    if search:
        frames_qs = frames_qs.filter(
            Q(user__username__icontains=search) |
            Q(source_video__icontains=search)
        )

    # Limit to latest 500 for performance
    frames_qs = frames_qs[:500]

    data = []
    for f in frames_qs:
        image_url = f.image_url
        if image_url and not image_url.startswith('http'):
            image_url = request.build_absolute_uri(image_url)
            
        data.append({
            'id': f.id,
            'timestamp': f.timestamp,
            'width': f.width,
            'height': f.height,
            'file_size': f.file_size,
            'file_size_display': _fmt_bytes(f.file_size),
            'created_at': f.created_at.isoformat() if f.created_at else None,
            'image_url': image_url,
            'user': {
                'id': f.user.id,
                'username': f.user.username,
            },
            'video': {
                'id': None,
                'filename': f.source_video or 'Unknown',
            }
        })

    return Response({'frames': data, 'total': len(data)})


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /api/admin/frames/<frame_id>/delete/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_delete_frame(request, frame_id):
    """Delete any frame by ID."""
    try:
        frame = CapturedImage.objects.get(id=frame_id)
    except CapturedImage.DoesNotExist:
        return Response({'error': 'Frame not found'}, status=404)

    # Deletion of file is handled by post_delete signal
    frame.delete()
    return Response({'message': 'Frame deleted.'})


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/admin/activity/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_activity(request):
    """Return recent activity: latest logins + uploads."""
    # Recent logins (users with last_seen)
    recent_logins = User.objects.filter(
        last_seen__isnull=False
    ).order_by('-last_seen')[:20]

    # Recent uploads
    recent_uploads = VideoUpload.objects.select_related('user').order_by('-created_at')[:20]

    # Recent frames
    recent_frames = CapturedImage.objects.select_related('user').order_by('-created_at')[:20]

    # Merge into chronological activity feed
    activity = []

    for u in recent_logins:
        activity.append({
            'type': 'login',
            'timestamp': u.last_seen.isoformat(),
            'user': u.username,
            'user_id': u.id,
            'detail': f"{u.username} signed in",
            'icon': 'login',
        })

    for v in recent_uploads:
        activity.append({
            'type': 'upload',
            'timestamp': v.created_at.isoformat() if v.created_at else None,
            'user': v.user.username,
            'user_id': v.user.id,
            'detail': f"{v.user.username} uploaded '{v.video_name}'",
            'icon': 'video',
        })

    for f in recent_frames:
        activity.append({
            'type': 'frame',
            'timestamp': f.created_at.isoformat() if f.created_at else None,
            'user': f.user.username,
            'user_id': f.user.id,
            'detail': f"{f.user.username} extracted a frame from '{f.source_video or 'video'}'",
            'icon': 'frame',
        })

    # Sort by timestamp descending
    activity.sort(key=lambda x: x['timestamp'] or '', reverse=True)

    return Response({'activity': activity[:40]})


# ── Help Desk Content endpoints (Admin: RW, Users: R) ─────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def help_content_get(request):
    """Return all active help desk content (accessible to all authenticated users)."""
    sections = HelpContent.objects.filter(is_active=True)
    data = []
    for s in sections:
        data.append({
            'section': s.section,
            'title': s.title,
            'content': s.content,
            'video_url': request.build_absolute_uri(s.video_file.url) if s.video_file else s.video_url or None,
            'updated_at': s.updated_at.isoformat() if s.updated_at else None,
        })
    return Response({'items': data})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def help_content_update(request, section):
    """Admin-only: update or create help desk content for a given section."""
    VALID = ['documentation', 'video_tutorial', 'faq']
    if section not in VALID:
        return Response({'error': 'Invalid section.'}, status=status.HTTP_400_BAD_REQUEST)

    obj, _ = HelpContent.objects.get_or_create(section=section)
    obj.title = request.data.get('title', obj.title)
    obj.content = request.data.get('content', obj.content)
    obj.updated_by = request.user

    if 'video_file' in request.FILES:
        # Delete old file if exists
        if obj.video_file:
            try:
                old_path = obj.video_file.path
                if os.path.exists(old_path):
                    os.remove(old_path)
            except Exception:
                pass
        obj.video_file = request.FILES['video_file']
        obj.video_url = None  # clear external URL when file is uploaded

    if 'video_url' in request.data:
        obj.video_url = request.data['video_url']

    obj.save()
    return Response({
        'section': obj.section,
        'title': obj.title,
        'content': obj.content,
        'video_url': request.build_absolute_uri(obj.video_file.url) if obj.video_file else obj.video_url or None,
        'updated_at': obj.updated_at.isoformat(),
    })


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def help_content_clear_video(request, section):
    """Admin-only: remove the video for a section."""
    try:
        obj = HelpContent.objects.get(section=section)
        if obj.video_file:
            try:
                path = obj.video_file.path
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass
            obj.video_file = None
        obj.video_url = None
        obj.save()
        return Response({'detail': 'Video removed.'})
    except HelpContent.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

