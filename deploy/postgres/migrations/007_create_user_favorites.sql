BEGIN;

CREATE TABLE IF NOT EXISTS user_favorites (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_slug text NOT NULL CHECK (
        char_length(tool_slug) BETWEEN 1 AND 120
        AND tool_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, tool_slug)
);

CREATE INDEX IF NOT EXISTS user_favorites_user_created_at_idx
    ON user_favorites (user_id, created_at, tool_slug);

COMMIT;
