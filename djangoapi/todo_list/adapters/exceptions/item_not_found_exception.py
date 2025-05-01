class ItemNotFoundException(Exception):
    def __init__(self, item_id):
        self.message = f"Item with ID {item_id} was not found."
