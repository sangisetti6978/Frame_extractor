from django.db import models
from .User import User


class HelpContent(models.Model):
    """Editable help desk content - managed by admins"""
    SECTION_CHOICES = [
        ('documentation', 'Documentation'),
        ('video_tutorial', 'Video Tutorial'),
        ('faq', 'FAQ'),
    ]

    section = models.CharField(max_length=50, choices=SECTION_CHOICES, unique=True)
    title = models.CharField(max_length=255, blank=True, default='')
    content = models.TextField(blank=True, default='')  # For documentation/FAQ text
    video_file = models.FileField(upload_to='tutorials/', null=True, blank=True)
    video_url = models.URLField(blank=True, null=True)  # external URL fallback
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='help_updates'
    )

    class Meta:
        db_table = 'help_content'
        verbose_name = 'Help Content'

    def __str__(self):
        return f"HelpContent: {self.section}"
