from django.db import models
from django.contrib.auth.models import User
import re

class Text(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    hashtags = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}..."

    def save(self, *args, **kwargs):
        self.hashtags = self.extract_hashtags()
        super().save(*args, **kwargs)

    def extract_hashtags(self):
        hashtags = re.findall(r'#(\w+)', self.content)
        return ','.join(set(hashtags))
