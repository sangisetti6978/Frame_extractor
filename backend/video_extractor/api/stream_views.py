"""
Video streaming view — serves browser-compatible video instantly.

Strategy:
  1. Native formats (.mp4/.webm/.ogg): serve file directly — instant.
  2. Non-native (.MTS/.AVI/.MOV etc.) with cached transcode: serve file — instant.
  3. Non-native WITHOUT cache: pipe FFmpeg output LIVE to the browser using
     fragmented MP4 (frag_keyframe+empty_moov). The browser starts playing
     within 2-3 seconds while FFmpeg is still encoding. The output is also
     saved to disk so subsequent requests are instant (case 2).
"""
import os
import threading
import subprocess
from django.http import FileResponse, HttpResponseNotFound, StreamingHttpResponse
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from video_extractor.core.models import VideoUpload
from video_extractor.core.utils.ffmpeg_utils import _get_ffmpeg_cmd


# Formats browsers can play without any transcoding
BROWSER_NATIVE_FORMATS = {'.mp4', '.webm', '.ogg', '.ogv'}

CHUNK_SIZE = 65536  # 64 KB read chunks for streaming


def _get_transcoded_path(original_path):
    """Return the path where the cached transcoded MP4 lives."""
    base, _ = os.path.splitext(original_path)
    return base + '_transcoded.mp4'


def _live_stream_and_cache(input_path, output_path):
    """
    Generator: spawns FFmpeg, reads its stdout in chunks, yields each chunk
    to the HTTP response, AND simultaneously writes to a temp file on disk.

    On completion, the temp file is atomically renamed to output_path so
    the next request gets a cached instant-serve FileResponse.

    Uses fragmented MP4 (frag_keyframe+empty_moov) so the browser can begin
    decoding/playing as soon as the first few KB arrive — no need to wait
    for the full transcode to finish.
    """
    tmp_path = output_path + '.part'
    lock_path = output_path + '.lock'

    ffmpeg_cmd = _get_ffmpeg_cmd()
    cmd = [
        ffmpeg_cmd,
        '-i', input_path,
        '-vf', 'scale=-2:720',         # 720p — fast encode
        '-c:v', 'libx264',
        '-preset', 'ultrafast',         # Absolute fastest encode speed
        '-tune', 'zerolatency',         # Minimize latency for streaming
        '-crf', '28',                   # Good-enough preview quality
        '-c:a', 'aac',
        '-b:a', '128k',
        # frag_keyframe+empty_moov: write moov atom first so browser can play
        # without downloading the whole file. Essential for live streaming.
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
        '-f', 'mp4',
        'pipe:1',                       # Write encoded data to stdout
    ]

    try:
        open(lock_path, 'w').close()  # Signal that encoding is in progress
    except Exception:
        pass

    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        bufsize=0,
    )

    cache_file = None
    try:
        cache_file = open(tmp_path, 'wb')
        while True:
            chunk = proc.stdout.read(CHUNK_SIZE)
            if not chunk:
                break
            cache_file.write(chunk)
            yield chunk

        proc.wait()
        cache_file.close()
        cache_file = None

        if proc.returncode == 0 and os.path.exists(tmp_path):
            # Atomic rename: future requests will hit the cached file instantly
            os.replace(tmp_path, output_path)
            print(f"[Stream] Cached transcoded file: {output_path}")
        else:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    except GeneratorExit:
        # Client disconnected — kill FFmpeg, clean up
        proc.kill()
        proc.wait()
        if cache_file:
            cache_file.close()
        for p in (tmp_path,):
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass
    except Exception as exc:
        proc.kill()
        print(f"[Stream] Error during live stream: {exc}")
        if cache_file:
            cache_file.close()
    finally:
        for p in (lock_path,):
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass


@api_view(['GET'])
@permission_classes([])
def stream_video(request, video_id):
    """
    Serve a video for browser playback.

    - Native formats: served directly from disk (instant).
    - Non-native (cached): served from the pre-transcoded MP4 (instant).
    - Non-native (not cached): live-streamed via FFmpeg pipe with fragmented
      MP4 — browser starts playing within ~2 seconds, no spinner needed.
    """
    try:
        video = VideoUpload.objects.get(id=video_id)
    except VideoUpload.DoesNotExist:
        return HttpResponseNotFound('Video not found')

    file_path = os.path.join(str(settings.MEDIA_ROOT), str(video.video_path))

    if not os.path.exists(file_path):
        return HttpResponseNotFound('Video file not found on disk')

    _, ext = os.path.splitext(file_path)
    ext_lower = ext.lower()

    # ── 1. Native format — serve original file directly ──────────────────────
    if ext_lower in BROWSER_NATIVE_FORMATS:
        f = open(file_path, 'rb')
        response = FileResponse(f, content_type='video/mp4')
        response['Content-Disposition'] = f'inline; filename="{video.video_name}"'
        response['Accept-Ranges'] = 'bytes'
        return response

    # ── 2. Cached transcoded file exists — serve instantly ───────────────────
    transcoded_path = _get_transcoded_path(file_path)
    if os.path.exists(transcoded_path):
        f = open(transcoded_path, 'rb')
        response = FileResponse(f, content_type='video/mp4')
        response['Content-Disposition'] = (
            f'inline; filename="{os.path.splitext(video.video_name)[0]}.mp4"'
        )
        response['Accept-Ranges'] = 'bytes'
        return response

    # ── 3. Live stream FFmpeg → browser (fragmented MP4) ─────────────────────
    # The browser starts playing within ~2 seconds while FFmpeg is still
    # encoding. The result is cached to disk for future instant requests.
    print(f"[Stream] Live streaming transcode: {file_path}")
    generator = _live_stream_and_cache(file_path, transcoded_path)

    response = StreamingHttpResponse(generator, content_type='video/mp4')
    response['Content-Disposition'] = (
        f'inline; filename="{os.path.splitext(video.video_name)[0]}.mp4"'
    )
    # No Content-Length — we don't know the final size while streaming
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'  # Disable nginx output buffering
    return response
