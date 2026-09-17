from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Favorite:
    user_id: str
    tool_slug: str
    created_at: datetime
