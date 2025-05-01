from dataclasses import dataclass
from datetime import datetime
from rest_framework import serializers


@dataclass
class UpdateItemRequest:
    id: str
    title: str
    description: str
    is_done: bool
    created_at: datetime


class UpdateItemRequestSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    is_done = serializers.BooleanField(default=False)
    created_at = serializers.DateTimeField()
