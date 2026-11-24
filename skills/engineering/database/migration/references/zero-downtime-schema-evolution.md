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

## 3. Safe `NOT NULL` Column Additions

Never run `ALTER TABLE items ADD COLUMN status TEXT NOT NULL DEFAULT 'active';` on large tables (causes heavy table rewrite):

### Safe 4-Phase Strategy:
1. **Add column as nullable**:
   ```sql
   SET lock_timeout = '2s';
   ALTER TABLE items ADD COLUMN status TEXT;
   ```
2. **Backfill values in small asynchronous batches** (`LIMIT 5000`).
3. **Add constraint marked as `NOT VALID`** (locks table for <1ms without table scan):
   ```sql
   SET lock_timeout = '2s';
   ALTER TABLE items ADD CONSTRAINT check_status_not_null CHECK (status IS NOT NULL) NOT VALID;
   ```
4. **Validate constraint concurrently** (scans table with zero exclusive write locks):
   ```sql
   ALTER TABLE items VALIDATE CONSTRAINT check_status_not_null;
   ```

---

## 4. `CREATE INDEX CONCURRENTLY` Invariants
- `CREATE INDEX CONCURRENTLY` acquires only a `ShareUpdateExclusiveLock`, permitting concurrent reads and writes.
- **The Transaction Trap**: Concurrent index creation **CANNOT** run inside a transaction block (`BEGIN ... COMMIT`).
- Migration tools must disable transactional DDL for index migration scripts.
