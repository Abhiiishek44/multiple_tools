from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class User:
    id: str
    google_sub: str
    email: str
    name: str
    picture_url: str | None
    created_at: datetime
    updated_at: datetime
