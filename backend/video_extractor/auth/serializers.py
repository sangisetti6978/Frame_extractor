from rest_framework import serializers
from video_extractor.core.models import User


class AuthSerializer(serializers.Serializer):
    """Authentication serializer"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
