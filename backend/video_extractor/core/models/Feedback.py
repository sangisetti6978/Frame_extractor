from django.db import models
from .User import User


class Feedback(models.Model):
    RATING_CHOICES = [(i, i) for i in range(1, 6)]
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('bug', 'Bug Report'),
        ('feature', 'Feature Request'),
        ('ui', 'UI/UX'),
        ('performance', 'Performance'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='general')
    rating = models.IntegerField(choices=RATING_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        db_table = 'feedback'
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback by {self.user.username} — {self.rating}★"
