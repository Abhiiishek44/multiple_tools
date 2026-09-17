from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Conversation:
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True, slots=True)
class ChatDocument:
    id: str
    conversation_id: str
    filename: str
    media_type: str
    artifact_key: str
    status: str
    error: str | None
    created_at: datetime
    processed_at: datetime | None


@dataclass(frozen=True, slots=True)
class Citation:
    document_id: str
    filename: str
    chunk_index: int
    excerpt: str


@dataclass(frozen=True, slots=True)
class Message:
    id: str
    conversation_id: str
    role: str
    content: str
    citations: list[dict[str, object]] = field(default_factory=list)
    created_at: datetime | None = None
