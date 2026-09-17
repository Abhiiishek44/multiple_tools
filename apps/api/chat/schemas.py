from datetime import datetime

from pydantic import BaseModel, Field

from packages.chat.models import ChatDocument, Conversation, Message


class CreateConversationRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class AskQuestionRequest(BaseModel):
    content: str = Field(min_length=1, max_length=20_000)


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, value: Conversation) -> "ConversationResponse":
        return cls(
            id=value.id,
            title=value.title,
            created_at=value.created_at,
            updated_at=value.updated_at,
        )


class DocumentResponse(BaseModel):
    id: str
    filename: str
    media_type: str
    status: str
    error: str | None
    created_at: datetime
    processed_at: datetime | None

    @classmethod
    def from_model(cls, value: ChatDocument) -> "DocumentResponse":
        return cls(
            id=value.id,
            filename=value.filename,
            media_type=value.media_type,
            status=value.status,
            error=value.error,
            created_at=value.created_at,
            processed_at=value.processed_at,
        )


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    citations: list[dict[str, object]]
    created_at: datetime | None

    @classmethod
    def from_model(cls, value: Message) -> "MessageResponse":
        return cls(
            id=value.id,
            role=value.role,
            content=value.content,
            citations=value.citations,
            created_at=value.created_at,
        )


class ConversationDetailResponse(BaseModel):
    conversation: ConversationResponse
    documents: list[DocumentResponse]
    messages: list[MessageResponse]
