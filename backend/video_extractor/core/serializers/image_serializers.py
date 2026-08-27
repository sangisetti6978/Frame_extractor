from rest_framework import serializers
from video_extractor.core.models import CapturedImage, VideoUpload


class CapturedImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CapturedImage
        fields = ['id', 'image_url', 'source_video', 'timestamp', 'is_blurred', 'blur_score', 'is_exported', 'file_size', 'width', 'height', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj):
        url = obj.image_path
        if url and not url.startswith('/'):
            url = f'/media/{url}'
        request = self.context.get('request')
        if request is not None and url:
            return request.build_absolute_uri(url)
        return url or ''


class VideoUploadSerializer(serializers.ModelSerializer):
    video_url = serializers.SerializerMethodField()
    stream_url = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoUpload
        fields = ['id', 'video_name', 'video_size', 'video_path', 'duration', 'width', 'height', 'fps', 'codec', 'status', 'frames_extracted', 'video_url', 'stream_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_video_url(self, obj):
        url = f'/media/{obj.video_path}'
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(url)
        return url
    
    def get_stream_url(self, obj):
        """
        Return the stream URL ONLY when we know a browser-playable version is ready:
        - For native formats (.mp4, .webm, .ogg, .ogv): always return the stream URL
          (the backend serves the original file directly).
        - For non-native formats (.mts, .avi, .mov, etc.): return the stream URL only
          if the transcoded MP4 file already exists on disk. Otherwise return null so
          the frontend knows transcoding hasn't completed yet and can poll.
        """
        import os
        from django.conf import settings

        BROWSER_NATIVE = {'.mp4', '.webm', '.ogg', '.ogv'}
        _, ext = os.path.splitext(obj.video_path or '')
        ext_lower = ext.lower()

        if ext_lower in BROWSER_NATIVE:
            # Native format — always serveable via stream endpoint
            url = f'/stream/{obj.id}/'
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(url)
            return url

        # Non-native format — check if transcoded MP4 exists
        original_path = os.path.join(str(settings.MEDIA_ROOT), str(obj.video_path))
        base, _ = os.path.splitext(original_path)
        transcoded_path = base + '_transcoded.mp4'

        if os.path.exists(transcoded_path):
            url = f'/stream/{obj.id}/'
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(url)
            return url

        # Transcoded file doesn't exist yet — return null so frontend shows spinner
        return None

