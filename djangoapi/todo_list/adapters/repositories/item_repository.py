from typing import List


from todo_list.adapters.exceptions.item_not_found_exception import ItemNotFoundException
from todo_list.ports.spi.item_repository import AItemRepository
from todo_list.adapters.repositories.models.item_model import ItemModel
from todo_list.domain.entities.item import Item


class ItemRepository(AItemRepository):
    def list_all(self, order_by: str | None = None) -> List[Item]:
        query = ItemModel.objects.all()
        if order_by:
            query = query.order_by(order_by)
        return [self._to_entity(item) for item in query]

    def get_item(self, item_id: str) -> Item | ItemNotFoundException:
        try:
            item = ItemModel.objects.get(id=item_id)
            return self._to_entity(item)
        except ItemModel.DoesNotExist:
            raise ItemNotFoundException(item_id)

    def create_item(self, item: Item) -> Item:
        item = ItemModel.objects.create(**item.__dict__)
        return self._to_entity(item)

    def update_item(self, item_id: str, item: Item) -> Item:
        try:
            db_item = ItemModel.objects.get(id=item_id)
            for attr, value in item.__dict__.items():
                setattr(db_item, attr, value)
            db_item.save()
            return self._to_entity(db_item)
        except ItemModel.DoesNotExist:
            raise ItemNotFoundException(item_id)

    def delete_item(self, item_id: str) -> None | ItemNotFoundException:
        try:
            ItemModel.objects.get(id=item_id).delete()
        except ItemModel.DoesNotExist:
            raise ItemNotFoundException(item_id)

    @staticmethod
    def _to_entity(item_model: ItemModel) -> Item:
        return Item(
            id=item_model.id,
            title=item_model.title,
            description=item_model.description,
            is_done=item_model.is_done,
            created_at=item_model.created_at,
        )
