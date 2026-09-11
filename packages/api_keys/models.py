from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class ApiKey:
    key_id: str
    secret_hash: str
    owner_id: str
    name: str
    scopes: frozenset[str]
    created_at: datetime
    last_used_at: datetime | None
    expires_at: datetime | None
    revoked_at: datetime | None
