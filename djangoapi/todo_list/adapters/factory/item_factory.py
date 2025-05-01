from todo_list.adapters.repositories.item_repository import ItemRepository
from todo_list.adapters.services.item_service import ItemService


def get_item_service():
    return ItemService(ItemRepository())
