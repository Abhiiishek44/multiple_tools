BEGIN;

-- The original launch value was example copy, not a measured total.
-- Keep persisted love rows intact and count only real submissions.
UPDATE site_love_totals
SET historical_count = 0
WHERE id = 1;

COMMIT;
