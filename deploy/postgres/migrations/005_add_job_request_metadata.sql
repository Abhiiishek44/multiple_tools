ALTER TABLE tool_jobs
    ADD COLUMN IF NOT EXISTS client_ip inet,
    ADD COLUMN IF NOT EXISTS user_agent text;
