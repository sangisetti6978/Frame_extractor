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
