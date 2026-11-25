-- Migration Step A (Transactional Expand DDL)
SET lock_timeout = '2s';
SET statement_timeout = '10s';

ALTER TABLE target_table
ADD COLUMN new_column_name TEXT;

ALTER TABLE target_table
ADD CONSTRAINT chk_new_column_valid
CHECK (new_column_name IS NOT NULL)
NOT VALID;

RESET lock_timeout;
RESET statement_timeout;

-- Migration Step B (Non-Transactional Autocommit Script — MUST NOT run inside BEGIN..COMMIT)
-- SET lock_timeout = '5s';
-- SET statement_timeout = '0';
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_target_new_column
-- ON target_table (new_column_name);
-- RESET lock_timeout;
-- RESET statement_timeout;

-- Migration Step C (After batched backfill completes)
-- ALTER TABLE target_table VALIDATE CONSTRAINT chk_new_column_valid;
