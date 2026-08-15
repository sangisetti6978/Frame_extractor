from rest_framework import serializers
from video_extractor.core.models import CapturedImage, VideoUpload


class CapturedImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CapturedImage
        fields = ['id', 'image_url', 'source_video', 'timestamp', 'is_blurred', 'blur_score', 'is_exported', 'file_size', 'width', 'height', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj):
        # Serve images directly from the media directory
        if obj.image_path and not obj.image_path.startswith('/'):
            return f'/media/{obj.image_path}'
        return obj.image_path or ''


class VideoUploadSerializer(serializers.ModelSerializer):
    video_url = serializers.SerializerMethodField()
    stream_url = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoUpload
        fields = ['id', 'video_name', 'video_size', 'video_path', 'duration', 'width', 'height', 'fps', 'codec', 'status', 'frames_extracted', 'video_url', 'stream_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_video_url(self, obj):
        return f'/media/{obj.video_path}'
    
    def get_stream_url(self, obj):
        return f'/stream/{obj.id}/'
