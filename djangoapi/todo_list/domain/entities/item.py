from dataclasses import dataclass
from datetime import datetime


@dataclass
class Item:
    id: str
    title: str
    description: str
    is_done: bool
    created_at: datetime
