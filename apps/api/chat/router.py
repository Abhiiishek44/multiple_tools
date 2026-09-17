from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse

from apps.api.chat.schemas import (
    AskQuestionRequest,
    ConversationDetailResponse,
    ConversationResponse,
    CreateConversationRequest,
    DocumentResponse,
    MessageResponse,
)
from apps.api.dependencies import require_authenticated_user
from packages.auth.models import User
from packages.chat import service
from packages.core.errors import (
    AuthenticationUnavailableError,
    ConflictError,
    NotFoundError,
    ValidationError,
)

router = APIRouter(prefix="/v1/chats", tags=["chat"])


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    request: CreateConversationRequest,
    user: Annotated[User, Depends(require_authenticated_user)],
) -> ConversationResponse:
    try:
        return ConversationResponse.from_model(
            service.create_conversation(user.id, request.title)
        )
    except ValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation(
    conversation_id: str,
    user: Annotated[User, Depends(require_authenticated_user)],
) -> ConversationDetailResponse:
    try:
        conversation, documents, messages = service.get_conversation(
            conversation_id, user.id
        )
    except NotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return ConversationDetailResponse(
        conversation=ConversationResponse.from_model(conversation),
        documents=[DocumentResponse.from_model(document) for document in documents],
        messages=[MessageResponse.from_model(message) for message in messages],
    )


@router.post(
    "/{conversation_id}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def upload_document(
    conversation_id: str,
    file: Annotated[UploadFile, File()],
    user: Annotated[User, Depends(require_authenticated_user)],
) -> DocumentResponse:
    try:
        document = service.submit_document(
            conversation_id=conversation_id,
            user_id=user.id,
            filename=file.filename or "document",
            media_type=file.content_type or "application/octet-stream",
            stream=file.file,
        )
    except NotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return DocumentResponse.from_model(document)


@router.post("/{conversation_id}/messages", response_model=MessageResponse)
def ask_question(
    conversation_id: str,
    request: AskQuestionRequest,
    user: Annotated[User, Depends(require_authenticated_user)],
) -> MessageResponse:
    try:
        return MessageResponse.from_model(
            service.answer_question(conversation_id, user.id, request.content)
        )
    except NotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except ConflictError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except AuthenticationUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@router.post("/{conversation_id}/messages/stream", response_class=StreamingResponse)
def stream_question(
    conversation_id: str,
    request: AskQuestionRequest,
    user: Annotated[User, Depends(require_authenticated_user)],
) -> StreamingResponse:
    try:
        stream = service.stream_answer(conversation_id, user.id, request.content)
        first_event = next(stream)
    except NotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except ConflictError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error

    def events():
        yield first_event
        yield from stream

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
