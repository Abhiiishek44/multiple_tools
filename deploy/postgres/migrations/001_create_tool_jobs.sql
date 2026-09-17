CREATE TABLE IF NOT EXISTS tool_jobs (
    id uuid PRIMARY KEY,
    tool_name text NOT NULL,
    tool_version text NOT NULL,
    status text NOT NULL DEFAULT 'QUEUED'
        CHECK (status IN ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED')),
    progress smallint NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    input_artifact_key text NOT NULL,
    input_filename text NOT NULL,
    input_media_type text,
    options jsonb NOT NULL DEFAULT '{}'::jsonb,
    output_artifact_key text,
    output_filename text,
    output_media_type text,
    error text,
    idempotency_key text UNIQUE,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    started_at timestamptz,
    completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS tool_jobs_status_created_at_idx
    ON tool_jobs (status, created_at);

CREATE INDEX IF NOT EXISTS tool_jobs_tool_name_created_at_idx
    ON tool_jobs (tool_name, created_at);
