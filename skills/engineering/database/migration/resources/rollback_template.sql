-- Rollback Step A (Non-Transactional Autocommit — run outside BEGIN..COMMIT)
SET lock_timeout = '5s';
SET statement_timeout = '0';
DROP INDEX CONCURRENTLY IF EXISTS idx_target_new_column;
RESET lock_timeout;
RESET statement_timeout;

-- Rollback Step B (Transactional Contract Cleanup)
SET lock_timeout = '5s';
SET statement_timeout = '30s';

DROP TRIGGER IF EXISTS sync_v1_to_v2 ON target_table;
DROP FUNCTION IF EXISTS sync_target_table_column();

ALTER TABLE target_table DROP CONSTRAINT IF EXISTS chk_new_column_valid;
ALTER TABLE target_table DROP COLUMN IF EXISTS new_column_name;

RESET lock_timeout;
RESET statement_timeout;
