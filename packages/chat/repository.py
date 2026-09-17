from collections.abc import Mapping
from typing import Any

from psycopg.types.json import Jsonb

from infrastructure.database import database_connection
from packages.chat.models import ChatDocument, Citation, Conversation, Message


def create_conversation(conversation_id: str, user_id: str, title: str) -> Conversation:
    with database_connection() as connection:
        row = connection.execute(
            """
            INSERT INTO chat_conversations (id, user_id, title)
            VALUES (%s, %s, %s) RETURNING *
            """,
            (conversation_id, user_id, title),
        ).fetchone()
    return _conversation(row)


def get_conversation(conversation_id: str, user_id: str) -> Conversation | None:
    with database_connection() as connection:
        row = connection.execute(
            "SELECT * FROM chat_conversations WHERE id = %s AND user_id = %s",
            (conversation_id, user_id),
        ).fetchone()
    return _conversation(row) if row else None


def create_document(
    document_id: str,
    conversation_id: str,
    filename: str,
    media_type: str,
    artifact_key: str,
) -> ChatDocument:
    with database_connection() as connection:
        row = connection.execute(
            """
            INSERT INTO chat_documents
                (id, conversation_id, filename, media_type, artifact_key)
            VALUES (%s, %s, %s, %s, %s) RETURNING *
            """,
            (document_id, conversation_id, filename, media_type, artifact_key),
        ).fetchone()
    return _document(row)


def get_document(document_id: str) -> ChatDocument | None:
    with database_connection() as connection:
        row = connection.execute(
            "SELECT * FROM chat_documents WHERE id = %s", (document_id,)
        ).fetchone()
    return _document(row) if row else None


def list_documents(conversation_id: str) -> list[ChatDocument]:
    with database_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM chat_documents WHERE conversation_id = %s ORDER BY created_at",
            (conversation_id,),
        ).fetchall()
    return [_document(row) for row in rows]


def mark_document_processing(document_id: str) -> bool:
    with database_connection() as connection:
        row = connection.execute(
            """
            UPDATE chat_documents SET status = 'PROCESSING', error = NULL
            WHERE id = %s AND status = 'QUEUED' RETURNING id
            """,
            (document_id,),
        ).fetchone()
    return row is not None


def replace_chunks_and_mark_ready(document_id: str, chunks: list[str]) -> None:
    with database_connection() as connection:
        connection.execute(
            "DELETE FROM chat_document_chunks WHERE document_id = %s", (document_id,)
        )
        with connection.cursor() as cursor:
            cursor.executemany(
                """
                INSERT INTO chat_document_chunks (document_id, chunk_index, content)
                VALUES (%s, %s, %s)
                """,
                [(document_id, index, content) for index, content in enumerate(chunks)],
            )
        connection.execute(
            """
            UPDATE chat_documents
            SET status = 'READY', error = NULL, processed_at = NOW()
            WHERE id = %s
            """,
            (document_id,),
        )


def mark_document_failed(document_id: str, error: str) -> None:
    with database_connection() as connection:
        connection.execute(
            """
            UPDATE chat_documents
            SET status = 'FAILED', error = %s, processed_at = NOW()
            WHERE id = %s
            """,
            (error[:4000], document_id),
        )


def retrieve_chunks(conversation_id: str, query: str, limit: int = 6) -> list[Citation]:
    with database_connection() as connection:
        rows = connection.execute(
            """
            SELECT d.id AS document_id, d.filename, c.chunk_index, c.content,
                   ts_rank(c.search_vector, websearch_to_tsquery('english', %s)) AS rank
            FROM chat_document_chunks c
            JOIN chat_documents d ON d.id = c.document_id
            WHERE d.conversation_id = %s AND d.status = 'READY'
              AND c.search_vector @@ websearch_to_tsquery('english', %s)
            ORDER BY rank DESC, d.created_at, c.chunk_index
            LIMIT %s
            """,
            (query, conversation_id, query, limit),
        ).fetchall()
        if not rows:
            rows = connection.execute(
                """
                SELECT d.id AS document_id, d.filename, c.chunk_index, c.content
                FROM chat_document_chunks c
                JOIN chat_documents d ON d.id = c.document_id
                WHERE d.conversation_id = %s AND d.status = 'READY'
                ORDER BY d.created_at, c.chunk_index LIMIT %s
                """,
                (conversation_id, limit),
            ).fetchall()
    return [
        Citation(
            document_id=str(row["document_id"]),
            filename=row["filename"],
            chunk_index=row["chunk_index"],
            excerpt=row["content"],
        )
        for row in rows
    ]


def list_messages(conversation_id: str, limit: int = 50) -> list[Message]:
    with database_connection() as connection:
        rows = connection.execute(
            """
            SELECT * FROM (
                SELECT * FROM chat_messages WHERE conversation_id = %s
                ORDER BY created_at DESC LIMIT %s
            ) recent ORDER BY created_at
            """,
            (conversation_id, limit),
        ).fetchall()
    return [_message(row) for row in rows]


def create_message(
    message_id: str,
    conversation_id: str,
    role: str,
    content: str,
    citations: list[dict[str, object]] | None = None,
) -> Message:
    with database_connection() as connection:
        row = connection.execute(
            """
            INSERT INTO chat_messages (id, conversation_id, role, content, citations)
            VALUES (%s, %s, %s, %s, %s) RETURNING *
            """,
            (message_id, conversation_id, role, content, Jsonb(citations or [])),
        ).fetchone()
        connection.execute(
            "UPDATE chat_conversations SET updated_at = NOW() WHERE id = %s",
            (conversation_id,),
        )
    return _message(row)


def _conversation(row: Mapping[str, Any]) -> Conversation:
    return Conversation(**{key: str(row[key]) if key in {"id", "user_id"} else row[key] for key in Conversation.__dataclass_fields__})


def _document(row: Mapping[str, Any]) -> ChatDocument:
    values = {key: row[key] for key in ChatDocument.__dataclass_fields__}
    values["id"] = str(values["id"])
    values["conversation_id"] = str(values["conversation_id"])
    return ChatDocument(**values)


def _message(row: Mapping[str, Any]) -> Message:
    values = {key: row[key] for key in Message.__dataclass_fields__}
    values["id"] = str(values["id"])
    values["conversation_id"] = str(values["conversation_id"])
    return Message(**values)
