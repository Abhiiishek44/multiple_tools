BEGIN;

CREATE TABLE IF NOT EXISTS api_keys (
    key_id text PRIMARY KEY,
    secret_hash text NOT NULL
        CHECK (secret_hash ~ '^[a-f0-9]{64}$'),
    owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
    scopes text[] NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    last_used_at timestamptz,
    expires_at timestamptz,
    revoked_at timestamptz,
    CONSTRAINT api_keys_key_id_format_check CHECK (key_id ~ '^[a-f0-9]{24}$'),
    CONSTRAINT api_keys_scopes_not_empty_check CHECK (cardinality(scopes) > 0),
    CONSTRAINT api_keys_scopes_valid_check CHECK (
        scopes <@ ARRAY[
            'tools:read',
            'jobs:create',
            'jobs:read',
            'jobs:download'
        ]::text[]
    )
);

CREATE INDEX IF NOT EXISTS api_keys_owner_id_created_at_idx
    ON api_keys (owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS api_keys_active_expiration_idx
    ON api_keys (expires_at)
    WHERE revoked_at IS NULL;

COMMIT;
