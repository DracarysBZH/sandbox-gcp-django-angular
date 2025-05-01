import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime

from django.test.testcases import TestCase

from todo_list.adapters.exceptions.item_not_found_exception import ItemNotFoundException
from todo_list.domain.entities.item import Item
from todo_list.adapters.http.models.resquests.create_item_request import CreateItemRequest
from todo_list.adapters.http.models.resquests.update_item_request import UpdateItemRequest
from todo_list.adapters.services.item_service import ItemService


class TestItemService(TestCase):
    def setUp(self):
        self.mock_repository = MagicMock()
        self.service = ItemService(item_repository=self.mock_repository)

    def test_lists_items_successfully(self):
        items = [
            Item(id="1", title="Title 1", description="description 1", is_done=True, created_at=datetime.now()),
            Item(id="2", title="Title 2", description="description 2", is_done=False, created_at=datetime.now()),
        ]
        self.mock_repository.list_all.return_value = items

        result = self.service.list_items()

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].__dict__, items[0].__dict__)
        self.assertEqual(result[1].__dict__, items[1].__dict__)
        self.mock_repository.list_all.assert_called_once()

    def test_get_item_successfully(self):
        item = Item(id="1", title="Title 1", description="description 1", is_done=True, created_at=datetime.now())
        item_id = "1"
        self.mock_repository.get_item.return_value = item

        result = self.service.get_item(item_id)

        self.assertEqual(result.__dict__, item.__dict__)
        self.mock_repository.get_item.assert_called_once_with(item_id)

    @patch("todo_list.adapters.services.item_service.datetime")
    @patch("todo_list.adapters.services.item_service.uuid")
    def test_creates_item_successfully(self, mock_uuid, mock_datetime):
        uuid = "uuid"
        title = "Test Item"
        description = "Test Description"
        fixed_now = datetime(2025, 5, 2, 12, 0, 0)
        create_request = CreateItemRequest(title=title, description=description, is_done=False)
        expected_item = Item(id=uuid, title=title, description=description, is_done=False, created_at=fixed_now)

        mock_uuid.uuid4.return_value = uuid
        mock_datetime.now.return_value = fixed_now
        self.mock_repository.create_item.return_value = expected_item

        result = self.service.create_item(create_request)

        self.assertEqual(result.__dict__, expected_item.__dict__)
        self.mock_repository.create_item.assert_called_once_with(expected_item)
        mock_uuid.uuid4.assert_called_once()
        mock_datetime.now.assert_called_once()

    def test_updates_item_successfully(self):
        fixed_now = datetime(2025, 5, 2, 12, 0, 0)
        update_item_request = UpdateItemRequest(id="1", title="Title 1", description="description 1", is_done=True, created_at=fixed_now)
        item = Item(id="1", title="Title 1", description="description 1", is_done=True, created_at=fixed_now)
        self.mock_repository.update_item.return_value = item

        result = self.service.update_item(update_item_request)

        self.assertEqual(result.__dict__, item.__dict__)
        self.mock_repository.update_item.assert_called_once_with(update_item_request.id, item)

    def test_delete_item_successfully(self):
        item_id = "1234"
        result = self.service.delete_item(item_id)
        self.assertIsNone(result)
        self.mock_repository.delete_item.assert_called_once_with(item_id)

    def test_raises_exception_when_item_not_found(self):
        item_id = "nonexistent_id"
        self.mock_repository.get_item.side_effect = ItemNotFoundException(item_id)

        with self.assertRaises(ItemNotFoundException):
            self.service.get_item(item_id)
