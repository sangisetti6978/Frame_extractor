"""
Video streaming view.

Strategy (in order of preference):
  1. Native browser formats (.mp4/.webm): serve file directly — instant.
  2. Non-native (cached _transcoded.mp4 on disk): serve file — instant.
  3. Non-native (transcoding in progress — .lock exists): return 202 Accepted.
  4. Non-native (not started): start transcoding in background, return 202 Accepted.

The frontend polls every 2s when it gets 202, and plays as soon as it gets 200.

Why NOT live FFmpeg pipe streaming:
  - Gunicorn (WSGI) buffers StreamingHttpResponse — browser gets nothing until
    FFmpeg finishes encoding the ENTIRE file, negating any latency benefit.
  - Use gunicorn + gevent workers OR Daphne (ASGI) for real streaming.
  - For now: fast cache-and-serve is the most reliable approach on Render.
"""
import os
import subprocess
import threading
from django.http import FileResponse, HttpResponse, HttpResponseNotFound
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from video_extractor.core.models import VideoUpload
from video_extractor.core.utils.ffmpeg_utils import _get_ffmpeg_cmd


# Formats that every browser can play without transcoding
BROWSER_NATIVE_FORMATS = {'.mp4', '.webm', '.ogg', '.ogv'}


def _cors(response):
    """Set CORS headers so any frontend domain can load the video."""
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Range, Authorization'
    response['Access-Control-Expose-Headers'] = (
        'Content-Length, Content-Range, Accept-Ranges, X-Transcode-Status'
    )
    return response


def _transcoded_path(original_path):
    base, _ = os.path.splitext(original_path)
    return base + '_transcoded.mp4'


def _lock_path(transcoded):
    return transcoded + '.lock'


def _start_transcode_thread(video_id, input_path, output_path):
    """
    Start FFmpeg transcoding in a daemon thread.
    Writes a .lock file while encoding so callers know it's in progress.
    """
    lock = _lock_path(output_path)
    if os.path.exists(lock) or os.path.exists(output_path):
        return  # Already running or already done

    def _run():
        try:
            open(lock, 'w').close()
            ffmpeg = _get_ffmpeg_cmd()
            cmd = [
                ffmpeg,
                '-i', input_path,
                '-vf', 'scale=-2:720',
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-crf', '28',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-movflags', '+faststart',
                '-y', output_path,
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
            if result.returncode == 0:
                print(f'[Transcode] Done: {output_path}')
            else:
                print(f'[Transcode] Error for video {video_id}: {result.stderr[-300:]}')
                # Clean up incomplete file
                if os.path.exists(output_path):
                    os.remove(output_path)
        except Exception as e:
            print(f'[Transcode] Failed for video {video_id}: {e}')
        finally:
            if os.path.exists(lock):
                os.remove(lock)

    t = threading.Thread(target=_run, daemon=True)
    t.start()


@api_view(['GET', 'OPTIONS'])
@permission_classes([])
def stream_video(request, video_id):
    """
    Serve a video for browser playback with proper CORS headers.

    Returns:
      200 + video file   — ready to play
      202 Accepted       — transcoding in progress; Retry-After: 3
      404                — video/file not found
    """
    # CORS preflight
    if request.method == 'OPTIONS':
        return _cors(HttpResponse(status=200))

    try:
        video = VideoUpload.objects.get(id=video_id)
    except VideoUpload.DoesNotExist:
        return _cors(HttpResponseNotFound('Video not found'))

    file_path = os.path.join(str(settings.MEDIA_ROOT), str(video.video_path))
    if not os.path.exists(file_path):
        return _cors(HttpResponseNotFound('Video file not found on disk'))

    _, ext = os.path.splitext(file_path)
    ext_lower = ext.lower()

    # ── 1. Browser-native format: serve directly ─────────────────────────────
    if ext_lower in BROWSER_NATIVE_FORMATS:
        resp = FileResponse(open(file_path, 'rb'), content_type='video/mp4')
        resp['Content-Disposition'] = f'inline; filename="{video.video_name}"'
        resp['Accept-Ranges'] = 'bytes'
        return _cors(resp)

    # ── 2. Cached transcoded file exists: serve instantly ────────────────────
    out = _transcoded_path(file_path)
    if os.path.exists(out):
        resp = FileResponse(open(out, 'rb'), content_type='video/mp4')
        resp['Content-Disposition'] = (
            f'inline; filename="{os.path.splitext(video.video_name)[0]}.mp4"'
        )
        resp['Accept-Ranges'] = 'bytes'
        resp['X-Transcode-Status'] = 'done'
        return _cors(resp)

    # ── 3. Transcoding in progress (lock file exists): ask client to retry ───
    lock = _lock_path(out)
    if os.path.exists(lock):
        resp = HttpResponse(status=202)
        resp['Retry-After'] = '3'
        resp['X-Transcode-Status'] = 'in-progress'
        return _cors(resp)

    # ── 4. Not started yet: kick off background transcode, return 202 ────────
    _start_transcode_thread(video_id, file_path, out)
    resp = HttpResponse(status=202)
    resp['Retry-After'] = '3'
    resp['X-Transcode-Status'] = 'started'
    return _cors(resp)
