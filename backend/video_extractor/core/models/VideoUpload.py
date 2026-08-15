from django.db import models
from .User import User


class VideoUpload(models.Model):
    """Uploaded video metadata"""
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='videos')
    video_path = models.CharField(max_length=500)
    video_name = models.CharField(max_length=255)
    video_size = models.BigIntegerField(help_text="File size in bytes")
    duration = models.FloatField(help_text="Duration in seconds")
    width = models.IntegerField()
    height = models.IntegerField()
    fps = models.FloatField(help_text="Frames per second")
    codec = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')
    frames_extracted = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'video_uploads'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.video_name}"

from django.db.models.signals import post_delete
from django.dispatch import receiver
import os
import shutil
from django.conf import settings

@receiver(post_delete, sender=VideoUpload)
def delete_video_file(sender, instance, **kwargs):
    if instance.video_path:
        file_path = os.path.join(settings.MEDIA_ROOT, instance.video_path)
        if os.path.isfile(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error deleting video file {file_path}: {e}")
                
        # Try to delete transcoded version if it exists
        try:
            base, _ = os.path.splitext(file_path)
            transcoded = base + '_transcoded.mp4'
            if os.path.isfile(transcoded):
                os.remove(transcoded)
        except Exception:
            pass
            
        # Clean up frames directory if any
        try:
            frames_dir = os.path.join(settings.MEDIA_ROOT, 'frames', str(instance.user.id), str(instance.id))
            if os.path.isdir(frames_dir):
                shutil.rmtree(frames_dir)
        except Exception as e:
            print(f"Error deleting frames dir {frames_dir}: {e}")
