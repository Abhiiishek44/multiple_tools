BEGIN;

CREATE TABLE IF NOT EXISTS site_love_device_users (
    anonymous_id_hash text PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    linked_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT site_love_device_users_hash_check CHECK (
        anonymous_id_hash ~ '^[a-f0-9]{64}$'
    )
);

CREATE INDEX IF NOT EXISTS site_love_device_users_user_id_idx
    ON site_love_device_users (user_id);

COMMIT;
