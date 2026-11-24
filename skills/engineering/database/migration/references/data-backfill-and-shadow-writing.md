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

Perform backfills in small, deterministic batches based on primary keys with sleep intervals between iterations:

```sql
DO $$
DECLARE
  batch_size INT := 5000;
  last_processed_id BIGINT := 0;
  rows_updated INT := 0;
BEGIN
  LOOP
    UPDATE accounts
    SET normalized_email = LOWER(email)
    WHERE id IN (
      SELECT id FROM accounts
      WHERE id > last_processed_id
      ORDER BY id ASC
      LIMIT batch_size
    );

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;

    SELECT MAX(id) INTO last_processed_id
    FROM (
      SELECT id FROM accounts
      WHERE id > last_processed_id
      ORDER BY id ASC
      LIMIT batch_size
    ) sub;

    COMMIT;
    PERFORM pg_sleep(0.05);
  END LOOP;
END $$;
```

---

## 3. Shadow Writing and Dual-Writing Verification

When migrating between database engines or major schema architectures:
1. **Shadow Writing**: Application writes to both Primary (Old) and Shadow (New) stores. Failures on the shadow write are logged but do not fail user requests.
2. **Reconciliation**: A background comparison worker reads historical records, verifies parity, and logs discrepancies.
3. **Cutover**: Once parity exceeds 99.999% and zero divergences occur over 48 hours, switch read paths to the new store.
4. **Contract**: Decommission the old write path and drop legacy storage.
