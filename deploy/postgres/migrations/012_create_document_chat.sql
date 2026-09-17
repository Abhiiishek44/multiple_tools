BEGIN;

CREATE TABLE IF NOT EXISTS chat_conversations (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_documents (
    id uuid PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    filename text NOT NULL,
    media_type text NOT NULL,
    artifact_key text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'QUEUED'
        CHECK (status IN ('QUEUED', 'PROCESSING', 'READY', 'FAILED')),
    error text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS chat_document_chunks (
    id bigserial PRIMARY KEY,
    document_id uuid NOT NULL REFERENCES chat_documents(id) ON DELETE CASCADE,
    chunk_index integer NOT NULL CHECK (chunk_index >= 0),
    content text NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS
        (to_tsvector('english', content)) STORED,
    UNIQUE (document_id, chunk_index)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    citations jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_conversations_user_updated_idx
    ON chat_conversations (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS chat_documents_conversation_idx
    ON chat_documents (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS chat_chunks_search_idx
    ON chat_document_chunks USING gin (search_vector);
CREATE INDEX IF NOT EXISTS chat_messages_conversation_idx
    ON chat_messages (conversation_id, created_at);

COMMIT;
