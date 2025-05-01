from dataclasses import dataclass
from rest_framework import serializers


@dataclass
class CreateItemRequest:
    title: str
    description: str
    is_done: bool


class CreateItemRequestSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    is_done = serializers.BooleanField(default=False)
