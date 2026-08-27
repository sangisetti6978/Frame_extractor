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
        Always return the stream URL for every format.

        The /stream/<id>/ endpoint handles all cases:
          - Native MP4/WebM: served from disk instantly.
          - Non-native (cached MP4): served from disk instantly.
          - Non-native (not cached): live-streamed via FFmpeg fragmented MP4
            so the browser starts playing within ~2 seconds — no polling needed.
        """
        url = f'/stream/{obj.id}/'
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(url)
        return url


