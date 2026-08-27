"""
Video streaming view that transcodes non-browser-compatible formats
(like .MTS, .AVI, .MOV, .WMV) to MP4 on the fly using FFmpeg.
"""
import os
import shutil
import subprocess
from django.http import FileResponse, HttpResponseNotFound, StreamingHttpResponse
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from video_extractor.core.models import VideoUpload
from video_extractor.core.utils.ffmpeg_utils import _get_ffmpeg_cmd


# Browser-native video formats that don't need transcoding
BROWSER_NATIVE_FORMATS = {'.mp4', '.webm', '.ogg', '.ogv'}


def _get_transcoded_path(original_path):
    """Get the path for a transcoded MP4 version of the video"""
    base, _ = os.path.splitext(original_path)
    return base + '_transcoded.mp4'


def _transcode_video(input_path, output_path):
    """Transcode a video to browser-compatible MP4 using FFmpeg"""
    ffmpeg_cmd = _get_ffmpeg_cmd()
    cmd = [
        ffmpeg_cmd,
        '-i', input_path,
        '-vf', 'scale=-2:720',  # Scale to 720p to speed up transcoding
        '-c:v', 'libx264',
        '-preset', 'ultrafast', # Maximize speed to avoid proxy timeouts
        '-crf', '28',           # Lower quality for preview is fine
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',
        output_path
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    if result.returncode != 0:
        raise Exception(f"FFmpeg transcoding failed: {result.stderr[-500:]}")
    
    return output_path


@api_view(['GET'])
@permission_classes([])
def stream_video(request, video_id):
    """
    Stream a video file. If the format is not browser-compatible,
    transcode it to MP4 first (cached for future requests).

    If a background pre-transcode (started during upload) is already running,
    wait for it to finish instead of starting a second FFmpeg process.
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

    # If it's a browser-native format, serve directly
    if ext_lower in BROWSER_NATIVE_FORMATS:
        response = FileResponse(open(file_path, 'rb'), content_type='video/mp4')
        response['Content-Disposition'] = f'inline; filename="{video.video_name}"'
        return response

    # Non-native — check if transcoded version is ready
    transcoded_path = _get_transcoded_path(file_path)
    lock_path = transcoded_path + '.lock'

    if not os.path.exists(transcoded_path):
        # If a background pre-transcode is running, wait for it (poll every 2s, up to 10min)
        if os.path.exists(lock_path):
            import time
            waited = 0
            while os.path.exists(lock_path) and waited < 600:
                time.sleep(2)
                waited += 2
        
        # If still not done, kick off transcoding ourselves
        if not os.path.exists(transcoded_path):
            try:
                # Write lock so parallel requests don't double-transcode
                open(lock_path, 'w').close()
                print(f"Transcoding {file_path} -> {transcoded_path}")
                _transcode_video(file_path, transcoded_path)
                print(f"Transcoding complete: {transcoded_path}")
            except Exception as e:
                print(f"Transcoding failed: {e}")
                if os.path.exists(lock_path):
                    os.remove(lock_path)
                return HttpResponseNotFound(f'Failed to transcode video: {str(e)}')
            finally:
                if os.path.exists(lock_path):
                    os.remove(lock_path)

    response = FileResponse(open(transcoded_path, 'rb'), content_type='video/mp4')
    response['Content-Disposition'] = f'inline; filename="{os.path.splitext(video.video_name)[0]}.mp4"'
    return response

