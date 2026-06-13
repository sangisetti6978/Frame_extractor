from django.db import models
from .User import User


class FolderConfig(models.Model):
    """User folder configuration for output paths"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folder_configs')
    folder_path = models.CharField(max_length=500)
    folder_name = models.CharField(max_length=255)
    image_format = models.CharField(max_length=10, choices=[
        ('jpg', 'JPEG'),
        ('png', 'PNG'),
        ('webp', 'WebP'),
        ('bmp', 'BMP'),
    ], default='png')
    compression_quality = models.IntegerField(default=85, help_text="Quality 0-100")
    auto_blur_detection = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'folder_configs'

    def __str__(self):
        return f"{self.user.username} - {self.folder_name}"
