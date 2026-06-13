from rest_framework import serializers
from video_extractor.core.models import CapturedImage, VideoUpload


class CapturedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CapturedImage
        fields = ['id', 'image_url', 'source_video', 'timestamp', 'is_blurred', 'blur_score', 'file_size', 'width', 'height', 'created_at']
        read_only_fields = ['id', 'created_at']


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
