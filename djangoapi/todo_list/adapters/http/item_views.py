from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status

from todo_list.adapters.exceptions.item_not_found_exception import ItemNotFoundException
from todo_list.adapters.factory.item_factory import get_item_service
from todo_list.adapters.http.models.responses.item_response_serializer import (
    ItemResponseSerializer,
)
from todo_list.adapters.http.models.resquests.create_item_request import (
    CreateItemRequest,
    CreateItemRequestSerializer,
)
from todo_list.adapters.http.models.resquests.update_item_request import (
    UpdateItemRequest,
    UpdateItemRequestSerializer,
)


class ItemView(viewsets.ViewSet):
    serializer_class = ItemResponseSerializer

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.item_service = get_item_service()

    @extend_schema(
        responses=ItemResponseSerializer(many=True),
        summary="List all items",
    )
    def get_all_items(self, request):
        items = self.item_service.list_items()
        return Response(ItemResponseSerializer(items, many=True).data)

    @extend_schema(
        responses=ItemResponseSerializer,
        summary="Get an item by ID",
    )
    def get_item_by_id(self, request, item_id):
        try:
            item = self.item_service.get_item(item_id)
            return Response(ItemResponseSerializer(item).data)
        except ItemNotFoundException as e:
            return Response(e.message, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        request=CreateItemRequestSerializer,
        responses=ItemResponseSerializer,
        summary="Create a new item",
    )
    def create_item(self, request):
        item_serialized = CreateItemRequestSerializer(data=request.data)
        if item_serialized.is_valid():
            created_item = self.item_service.create_item(
                CreateItemRequest(**item_serialized.validated_data)
            )
            return Response(
                ItemResponseSerializer(created_item).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(item_serialized.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Delete an item by ID",
    )
    def delete_item_by_id(self, request, item_id):
        try:
            self.item_service.delete_item(item_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ItemNotFoundException as e:
            return Response(e.message, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        request=UpdateItemRequestSerializer,
        responses=ItemResponseSerializer,
        summary="Update an item by ID",
    )
    def update_item(self, request):
        item_serialized = UpdateItemRequestSerializer(data=request.data)
        if item_serialized.is_valid():
            updated_item = self.item_service.update_item(
                UpdateItemRequest(**item_serialized.validated_data)
            )
            return Response(
                ItemResponseSerializer(updated_item).data, status=status.HTTP_200_OK
            )
        return Response(item_serialized.errors, status=status.HTTP_400_BAD_REQUEST)
