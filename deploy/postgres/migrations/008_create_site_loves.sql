BEGIN;

CREATE TABLE IF NOT EXISTS site_love_totals (
    id smallint PRIMARY KEY CHECK (id = 1),
    historical_count bigint NOT NULL CHECK (historical_count >= 0)
);

-- Existing historical total supplied for the launch of the love counter.
INSERT INTO site_love_totals (id, historical_count)
VALUES (1, 12842)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS site_loves (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    anonymous_id_hash text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT site_loves_identity_check CHECK (
        (user_id IS NOT NULL AND anonymous_id_hash IS NULL)
        OR (user_id IS NULL AND anonymous_id_hash IS NOT NULL)
    ),
    CONSTRAINT site_loves_anonymous_hash_check CHECK (
        anonymous_id_hash IS NULL OR anonymous_id_hash ~ '^[a-f0-9]{64}$'
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS site_loves_user_id_idx
    ON site_loves (user_id) WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS site_loves_anonymous_id_hash_idx
    ON site_loves (anonymous_id_hash) WHERE anonymous_id_hash IS NOT NULL;

COMMIT;
