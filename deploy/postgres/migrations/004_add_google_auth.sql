BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    google_sub text NOT NULL UNIQUE,
    email text NOT NULL,
    name text NOT NULL,
    picture_url text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE tool_jobs
    ADD COLUMN IF NOT EXISTS user_id uuid;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'tool_jobs_user_id_fkey'
    ) THEN
        ALTER TABLE tool_jobs
            ADD CONSTRAINT tool_jobs_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
    END IF;
END $$;

ALTER TABLE tool_jobs
    DROP CONSTRAINT IF EXISTS tool_jobs_idempotency_key_key;

DROP INDEX IF EXISTS tool_jobs_idempotency_key_key;

CREATE UNIQUE INDEX IF NOT EXISTS tool_jobs_user_id_idempotency_key_idx
    ON tool_jobs (user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS tool_jobs_user_id_created_at_idx
    ON tool_jobs (user_id, created_at DESC);

COMMIT;
