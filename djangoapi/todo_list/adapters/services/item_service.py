import uuid
from datetime import datetime
from typing import List

from todo_list.adapters.exceptions.item_not_found_exception import ItemNotFoundException
from todo_list.adapters.http.models.resquests.create_item_request import (
    CreateItemRequest,
)
from todo_list.adapters.http.models.resquests.update_item_request import (
    UpdateItemRequest,
)
from todo_list.ports.spi.item_repository import AItemRepository
from todo_list.domain.entities.item import Item


class ItemService:
    def __init__(self, item_repository: AItemRepository):
        self.item_repository = item_repository

    def list_items(self) -> List[Item]:
        return self.item_repository.list_all(order_by='-created_at')

    def get_item(self, item_id: str) -> Item | ItemNotFoundException:
        return self.item_repository.get_item(item_id)

    def create_item(self, create_item_request: CreateItemRequest) -> Item:
        item = Item(
            **create_item_request.__dict__,
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
        )
        return self.item_repository.create_item(item)

    def update_item(self, update_item_request: UpdateItemRequest) -> Item:
        return self.item_repository.update_item(
            update_item_request.id, Item(**update_item_request.__dict__)
        )

    def delete_item(self, item_id: str) -> None | ItemNotFoundException:
        self.item_repository.delete_item(item_id)
