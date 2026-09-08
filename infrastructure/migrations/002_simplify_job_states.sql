BEGIN;

ALTER TABLE tool_jobs DROP CONSTRAINT IF EXISTS tool_jobs_status_check;

UPDATE tool_jobs
SET
    error = CASE
        WHEN status = 'CANCELLED' AND error IS NULL
        THEN 'Job was cancelled before the status model was simplified'
        ELSE error
    END,
    status = CASE status
        WHEN 'PENDING' THEN 'QUEUED'
        WHEN 'SUCCEEDED' THEN 'SUCCESS'
        WHEN 'CANCELLED' THEN 'FAILED'
        ELSE status
    END;

ALTER TABLE tool_jobs ALTER COLUMN status SET DEFAULT 'QUEUED';
ALTER TABLE tool_jobs ADD CONSTRAINT tool_jobs_status_check
    CHECK (status IN ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED'));

COMMIT;
