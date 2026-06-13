from django.db import models
from .User import User
from .FolderConfig import FolderConfig


class CapturedImage(models.Model):
    """Captured frame from video"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='captured_images')
    config = models.ForeignKey(FolderConfig, on_delete=models.SET_NULL, null=True, related_name='images')
    image_path = models.CharField(max_length=500)
    image_url = models.URLField()
    source_video = models.CharField(max_length=255)
    timestamp = models.FloatField(help_text="Timestamp in seconds")
    is_blurred = models.BooleanField(default=False)
    blur_score = models.FloatField(null=True, blank=True, help_text="Blur detection score 0-1")
    file_size = models.IntegerField(help_text="File size in bytes")
    width = models.IntegerField()
    height = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'captured_images'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.source_video} @ {self.timestamp}s"
