-- Requires PostgreSQL 11+ PROCEDURE so COMMIT releases batch locks before pg_sleep
-- (DO $$ blocks run in a single transaction and cannot release locks mid-loop)
CREATE OR REPLACE PROCEDURE backfill_order_statuses(batch_size INT DEFAULT 5000)
LANGUAGE plpgsql
AS $$
DECLARE
    rows_affected INT := 0;
BEGIN
    LOOP
        UPDATE orders
        SET status_normalized = LOWER(status)
        WHERE id IN (
            SELECT id
            FROM orders
            WHERE status_normalized IS NULL
            ORDER BY id
            LIMIT batch_size
            FOR UPDATE SKIP LOCKED
        );

        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        EXIT WHEN rows_affected = 0;

        COMMIT;
        PERFORM pg_sleep(0.05);
    END LOOP;
END;
$$;

CALL backfill_order_statuses(5000);
