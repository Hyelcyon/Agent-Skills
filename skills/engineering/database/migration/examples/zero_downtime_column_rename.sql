-- Step 1: Add new column as nullable (Metadata lock only)
ALTER TABLE accounts ADD COLUMN display_name TEXT;

-- Step 2: Index concurrently for immediate read optimization
CREATE INDEX CONCURRENTLY idx_accounts_display_name ON accounts(display_name);

-- Step 3: Backfill data from legacy column 'username' in batches
DO $$
DECLARE
    batch_size INT := 2500;
    affected_count INT;
BEGIN
    LOOP
        UPDATE accounts
        SET display_name = username
        WHERE id IN (
            SELECT id FROM accounts
            WHERE display_name IS NULL
            ORDER BY id
            LIMIT batch_size
            FOR UPDATE SKIP LOCKED
        );
        GET DIAGNOSTICS affected_count = ROW_COUNT;
        EXIT WHEN affected_count = 0;
        PERFORM pg_sleep(0.05);
    END LOOP;
END $$;

-- Step 4: Validate not null constraint
ALTER TABLE accounts ADD CONSTRAINT chk_display_name_not_null CHECK (display_name IS NOT NULL) NOT VALID;
ALTER TABLE accounts VALIDATE CONSTRAINT chk_display_name_not_null;

-- Step 5: (Executed in a subsequent deployment after application code switches over)
-- ALTER TABLE accounts DROP COLUMN username;
