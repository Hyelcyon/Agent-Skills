-- Phase 1 (Transactional Expand): Add nullable column + dual-write trigger under lock_timeout
SET lock_timeout = '2s';
SET statement_timeout = '10s';

ALTER TABLE accounts ADD COLUMN display_name TEXT;

CREATE OR REPLACE FUNCTION sync_account_display_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.display_name IS NULL AND NEW.username IS NOT NULL THEN
        NEW.display_name := NEW.username;
    ELSIF NEW.username IS NULL AND NEW.display_name IS NOT NULL THEN
        NEW.username := NEW.display_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_account_display_name
BEFORE INSERT OR UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION sync_account_display_name();

RESET lock_timeout;
RESET statement_timeout;

-- Phase 2 (Non-Transactional Autocommit): Concurrent index cannot execute inside BEGIN..COMMIT
SET lock_timeout = '5s';
SET statement_timeout = '0';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_display_name ON accounts (display_name);
RESET lock_timeout;
RESET statement_timeout;

-- Phase 3 (Non-Transactional PROCEDURE): Commit each batch so locks release before sleep
CREATE OR REPLACE PROCEDURE backfill_account_display_name(batch_size INT DEFAULT 2500)
LANGUAGE plpgsql
AS $$
DECLARE
    affected_count INT := 0;
BEGIN
    LOOP
        UPDATE accounts
        SET display_name = username
        WHERE id IN (
            SELECT id
            FROM accounts
            WHERE display_name IS NULL
              AND username IS NOT NULL
            ORDER BY id
            LIMIT batch_size
            FOR UPDATE SKIP LOCKED
        );
        GET DIAGNOSTICS affected_count = ROW_COUNT;
        EXIT WHEN affected_count = 0;

        COMMIT;
        PERFORM pg_sleep(0.05);
    END LOOP;
END;
$$;

CALL backfill_account_display_name(2500);

-- Phase 4 (Validation): NOT VALID acquires brief lock; VALIDATE scans under SHARE UPDATE EXCLUSIVE
SET lock_timeout = '2s';
ALTER TABLE accounts
ADD CONSTRAINT chk_display_name_not_null
CHECK (display_name IS NOT NULL) NOT VALID;
RESET lock_timeout;

ALTER TABLE accounts VALIDATE CONSTRAINT chk_display_name_not_null;

-- Phase 5 (Contract - run ONLY in a subsequent deploy after all app instances stop reading/writing username):
-- SET lock_timeout = '2s';
-- DROP TRIGGER IF EXISTS trg_sync_account_display_name ON accounts;
-- DROP FUNCTION IF EXISTS sync_account_display_name();
-- DROP PROCEDURE IF EXISTS backfill_account_display_name(INT);
-- ALTER TABLE accounts DROP COLUMN IF EXISTS username;
-- RESET lock_timeout;
