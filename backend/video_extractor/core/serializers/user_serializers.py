from rest_framework import serializers
from video_extractor.core.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone',
                  'avatar_url', 'is_email_verified', 'is_staff', 'is_superuser', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_staff', 'is_superuser']
