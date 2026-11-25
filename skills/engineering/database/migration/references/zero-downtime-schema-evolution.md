# Zero-Downtime Schema Evolution in PostgreSQL

Engineering standards for safe DDL execution, lock avoidance, and non-blocking constraint additions in PostgreSQL 16+.

---

## 1. The Lock Queue Cascading Outage Hazard

Standard DDL statements (`ALTER TABLE`, `CREATE INDEX`) require an `AccessExclusiveLock`:
- The migration waits for active queries (`SELECT`, `UPDATE`) to release their locks.
- **The Queue Hazard**: While the migration waits, ALL subsequent application queries line up behind it in the lock queue.
- Within seconds, application connection pools are exhausted, triggering a catastrophic cascading outage.

---

## 2. The Defensive DDL Protocol

Every production DDL execution must enforce strict timeout boundaries:

```sql
SET lock_timeout = '2s';
SET statement_timeout = '30s';

ALTER TABLE users ADD COLUMN phone_number TEXT;

RESET lock_timeout;
RESET statement_timeout;
```

If the lock cannot be acquired within 2 seconds, the command fails fast, leaving live user traffic completely unaffected. The deployment pipeline can retry after a short delay.

---

## 3. Safe `NOT NULL` and Default Column Additions

In PostgreSQL 11+, `ADD COLUMN ... NOT NULL DEFAULT 'constant'` with an immutable/constant expression is a metadata-only catalog update (`attmissingval`) and does **not** rewrite the table heap, though it still requires a brief `AccessExclusiveLock` (so `lock_timeout` is mandatory).

By contrast, **volatile defaults** (`DEFAULT gen_random_uuid()`, `DEFAULT clock_timestamp()`, `DEFAULT random()`), non-constant defaults on `< PG 11`, or running `ALTER TABLE ... ALTER COLUMN ... SET NOT NULL` directly on an existing nullable column trigger a full table rewrite or full-table scan under `AccessExclusiveLock`.

### Safe 4-Phase Strategy (Existing Columns / Volatile Defaults):
1. **Add column as nullable** (and deploy dual-write trigger or application write path):
   ```sql
   SET lock_timeout = '2s';
   ALTER TABLE items ADD COLUMN status TEXT;
   RESET lock_timeout;
   ```
2. **Backfill values in small asynchronous batches** (`LIMIT 5000` inside a `PROCEDURE` with per-batch `COMMIT`).
3. **Add `CHECK` constraint marked `NOT VALID`** (metadata lock only, no table scan):
   ```sql
   SET lock_timeout = '2s';
   ALTER TABLE items ADD CONSTRAINT check_status_not_null CHECK (status IS NOT NULL) NOT VALID;
   RESET lock_timeout;
   ```
4. **Validate constraint concurrently**, then optionally promote to column `NOT NULL` on PG 12+ (skips full scan once the validated `CHECK` proves zero nulls exist):
   ```sql
   ALTER TABLE items VALIDATE CONSTRAINT check_status_not_null;

   SET lock_timeout = '2s';
   ALTER TABLE items ALTER COLUMN status SET NOT NULL;
   ALTER TABLE items DROP CONSTRAINT check_status_not_null;
   RESET lock_timeout;
   ```

---

## 4. `CREATE INDEX CONCURRENTLY` Invariants
- `CREATE INDEX CONCURRENTLY` acquires only a `ShareUpdateExclusiveLock`, permitting concurrent reads and writes.
- **The Transaction Trap**: Concurrent index creation **CANNOT** run inside a transaction block (`BEGIN ... COMMIT`).
- Migration tools must disable transactional DDL for index migration scripts.
