# Large-Scale Data Backfilling and Shadow Writing

Engineering specifications for migrating billions of records without table lockups, replication lag spikes, or CPU starvation.

---

## 1. Principles of Safe Production Backfilling

Never execute unbounded updates (`UPDATE orders SET status_code = 1;`). Large monolithic updates:
- Hold row locks across millions of records.
- Flood WAL (Write-Ahead Log) buffers, causing replication lag on read replicas.
- Trigger autovacuum storms and table bloat.

---

## 2. Batched Keyset Backfill Pattern

Perform backfills in small, deterministic keyset batches using a `PROCEDURE` (`PG 11+`) so each `COMMIT` actually releases row locks and allows vacuuming between sleeps (`DO $$` blocks cannot execute `COMMIT` and hold all locks for the entire loop):

```sql
CREATE OR REPLACE PROCEDURE backfill_normalized_emails(batch_size INT DEFAULT 5000)
LANGUAGE plpgsql
AS $$
DECLARE
  last_processed_id BIGINT := 0;
  batch_count INT := 0;
  max_batch_id BIGINT;
BEGIN
  LOOP
    WITH batch AS (
      SELECT id, email
      FROM accounts
      WHERE id > last_processed_id
      ORDER BY id ASC
      LIMIT batch_size
    ),
    updated AS (
      UPDATE accounts AS a
      SET normalized_email = LOWER(b.email)
      FROM batch AS b
      WHERE a.id = b.id
        AND a.normalized_email IS DISTINCT FROM LOWER(b.email)
      RETURNING a.id
    )
    SELECT COUNT(*), COALESCE(MAX(id), last_processed_id)
    INTO batch_count, max_batch_id
    FROM batch;

    EXIT WHEN batch_count = 0;
    last_processed_id := max_batch_id;

    COMMIT;
    PERFORM pg_sleep(0.05);
  END LOOP;
END;
$$;

CALL backfill_normalized_emails(5000);
```

---

## 3. Shadow Writing and Dual-Writing Verification

When migrating between database engines or major schema architectures:
1. **Shadow Writing**: Application writes to both Primary (Old) and Shadow (New) stores. Failures on the shadow write are logged but do not fail user requests.
2. **Reconciliation**: A background comparison worker reads historical records, verifies parity, and logs discrepancies.
3. **Cutover**: Once parity exceeds 99.999% and zero divergences occur over 48 hours, switch read paths to the new store.
4. **Contract**: Decommission the old write path and drop legacy storage.
