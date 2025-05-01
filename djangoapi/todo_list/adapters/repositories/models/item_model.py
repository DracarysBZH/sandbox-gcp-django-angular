from django.db import models


class ItemModel(models.Model):
    id = models.CharField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField()

    def __str__(self):
        return self.title
