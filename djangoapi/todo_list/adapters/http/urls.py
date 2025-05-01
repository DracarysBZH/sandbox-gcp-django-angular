from django.urls import path
from todo_list.adapters.http.item_views import ItemView

urlpatterns = [
    path(
        "items",
        ItemView.as_view(
            {
                "get": "get_all_items",
                "post": "create_item",
                "put": "update_item",
            }
        ),
        name="items",
    ),
    path(
        "items/<str:item_id>",
        ItemView.as_view(
            {
                "get": "get_item_by_id",
                "delete": "delete_item_by_id",
            }
        ),
        name="item by id",
    ),
]
