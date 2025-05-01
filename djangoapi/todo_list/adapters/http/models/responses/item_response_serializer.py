from rest_framework import serializers


class ItemResponseSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    is_done = serializers.BooleanField(default=False)
    created_at = serializers.DateTimeField(read_only=True)
