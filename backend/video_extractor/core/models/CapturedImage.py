from django.db import models
from .User import User
from .FolderConfig import FolderConfig


class CapturedImage(models.Model):
    """Captured frame from video"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='captured_images')
    config = models.ForeignKey(FolderConfig, on_delete=models.SET_NULL, null=True, related_name='images')
    image_path = models.CharField(max_length=500)
    image_url = models.URLField(blank=True, default='')
    source_video = models.CharField(max_length=255)
    timestamp = models.FloatField(help_text="Timestamp in seconds")
    is_blurred = models.BooleanField(default=False)
    blur_score = models.FloatField(null=True, blank=True, help_text="Blur detection score 0-1")
    is_exported = models.BooleanField(default=False, help_text="Whether the image has been exported to the PC folder")
    file_size = models.IntegerField(help_text="File size in bytes")
    width = models.IntegerField()
    height = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'captured_images'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.source_video} @ {self.timestamp}s"

from django.db.models.signals import post_delete
from django.dispatch import receiver
import os
from django.conf import settings

@receiver(post_delete, sender=CapturedImage)
def delete_image_file(sender, instance, **kwargs):
    if instance.image_path:
        # Only delete if it's inside MEDIA_ROOT (not saved directly to PC via FolderConfig)
        if not os.path.isabs(instance.image_path):
            file_path = os.path.join(settings.MEDIA_ROOT, instance.image_path)
            if os.path.isfile(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error deleting image file {file_path}: {e}")
