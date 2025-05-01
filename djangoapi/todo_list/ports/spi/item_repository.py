from abc import ABC, abstractmethod
from typing import List

from todo_list.adapters.exceptions.item_not_found_exception import ItemNotFoundException
from todo_list.domain.entities.item import Item


class AItemRepository(ABC):
    pass

    @abstractmethod
    def list_all(self, order_by: str | None = None) -> List[Item]:
        pass

    @abstractmethod
    def get_item(self, item_id: str) -> Item | ItemNotFoundException:
        pass

    @abstractmethod
    def create_item(self, item: Item) -> Item:
        pass

    @abstractmethod
    def update_item(self, item_id: str, item: Item) -> Item:
        pass

    @abstractmethod
    def delete_item(self, item_id: str) -> None | ItemNotFoundException:
        pass
