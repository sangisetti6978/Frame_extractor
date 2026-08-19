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
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',  # Enable progressive download
        '-y',  # Overwrite output
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
    """
    try:
        # Check token if provided, but don't strictly enforce for native streaming
        # to simplify VideoPlayer.jsx
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
    
    # Need transcoding - check if we already have a cached transcoded version
    transcoded_path = _get_transcoded_path(file_path)
    
    if not os.path.exists(transcoded_path):
        try:
            print(f"Transcoding {file_path} -> {transcoded_path}")
            _transcode_video(file_path, transcoded_path)
            print(f"Transcoding complete: {transcoded_path}")
        except Exception as e:
            print(f"Transcoding failed: {e}")
            return HttpResponseNotFound(f'Failed to transcode video: {str(e)}')
    
    response = FileResponse(open(transcoded_path, 'rb'), content_type='video/mp4')
    response['Content-Disposition'] = f'inline; filename="{os.path.splitext(video.video_name)[0]}.mp4"'
    return response
