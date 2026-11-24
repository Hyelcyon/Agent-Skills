DO $$
DECLARE
    batch_size INT := 5000;
    rows_affected INT := 0;
BEGIN
    LOOP
        UPDATE orders
        SET status_normalized = LOWER(status)
        WHERE id IN (
            SELECT id FROM orders
            WHERE status_normalized IS NULL
            ORDER BY id
            LIMIT batch_size
            FOR UPDATE SKIP LOCKED
        );

        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        EXIT WHEN rows_affected = 0;

        PERFORM pg_sleep(0.05);
    END LOOP;
END $$;
