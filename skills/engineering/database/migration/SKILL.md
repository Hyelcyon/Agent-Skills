---
name: migration
description: Use when authoring or executing database migrations, applying the zero-downtime Expand-Contract pattern, adding columns or indexes concurrently without table locks, or planning batch backfills.
---

# Zero-Downtime Database Migration Engineering

Enterprise procedures for schema migrations in PostgreSQL and distributed SQL engines, eliminating table locks, query timeouts, and downtime during rolling application updates.

## When to Use
- Adding columns, indexes, foreign keys, or constraints to high-traffic production tables.
- Refactoring or renaming columns using the 3-phase Expand-Contract pattern.
- Backfilling large datasets without WAL bloat or lock contention.
- Auditing ORM migration scripts for unsafe locking DDL before deployment.

## When NOT to Use
- General query optimization or EXPLAIN ANALYZE tuning (use `query-optimization`).
- Initial database ERD and normal form modeling (use `schema-design`).

---

## Senior Engineering Craftsmanship

- **Root-Cause Lock & Dependency Tracing**: Inspect `pg_locks`, `pg_stat_activity`, foreign keys, triggers, and dependent views before authoring DDL.
- **Minimal Surgical Diff**: Split incompatible phases (`ALTER TABLE` vs non-transactional `CREATE INDEX CONCURRENTLY`) into separate migration steps instead of rewriting unrelated tables.
- **Failing-First Repro**: Reproduce lock queuing, `NOT VALID` failures, or `indisvalid = false` index builds against a production-sized staging clone before rollout.
- **Non-Blocking Verification**: Validate migrations with dry-run SQL checks, `lock_timeout` boundaries, and `pg_index.indisvalid` queries rather than holding long-running locks or blocking processes.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Table Scale & Lock Dependency Profiling
Phase 2: Expand Phase Execution (Additive, Nullable DDL, Concurrent Indexes)
Phase 3: Dual-Write & Throttled Batch Backfilling
Phase 4: Contract Phase Execution (Constraint Validation & Schema Cleanup)
Phase 5: Lock & Replication Verification (pg_stat_activity, indisvalid check)
```

### Phase 1: Table Scale & Lock Dependency Profiling
Inspect table size, active read/write traffic, and foreign key dependencies. Set `lock_timeout = '2s'` (never exceed `'5s'`) to prevent DDL from queuing behind long-running queries and blocking application traffic.

### Phase 2: Expand Phase Execution
Execute strictly additive changes:
- Add new columns as `NULLABLE` without volatile/expression defaults (`random()`, `clock_timestamp()`, `gen_random_uuid()`). PostgreSQL 11+ supports constant `DEFAULT` expressions as metadata-only operations (brief `ACCESS EXCLUSIVE` lock still requires `lock_timeout`).
- Create indexes using `CREATE INDEX CONCURRENTLY` **strictly outside any transaction block** (`BEGIN ... COMMIT` or ORM auto-transactions reject concurrent index creation).
- Add constraints (`CHECK`, `FOREIGN KEY`) with `NOT VALID` to avoid full table scans under `ACCESS EXCLUSIVE` or `SHARE ROW EXCLUSIVE`.

### Phase 3: Dual-Write & Throttled Backfilling
Deploy dual-write triggers or application code writing to both old and new schema representations before starting backfills. Execute backfilling in bounded batches inside a `PROCEDURE` (`CALL ...`) with explicit per-batch `COMMIT` and `pg_sleep` intervals (or external chunked transactions) to release row locks and prevent WAL replication lag.

### Phase 4: Contract Phase Execution
Validate constraints asynchronously via `VALIDATE CONSTRAINT` (`SHARE UPDATE EXCLUSIVE`, allowing concurrent reads/writes). Switch application read traffic to new columns, drop sync triggers, and drop legacy columns only after all running pods use the new schema.

### Phase 5: Verification & Integrity Proof
Verify non-blockingly that concurrent indexes are valid (`indisvalid = true`) and no blocked locks remain in `pg_stat_activity`. If a concurrent index build fails, drop the invalid index with `DROP INDEX CONCURRENTLY IF EXISTS`.

---

## Fatal Mistakes Never to Make

- ❌ Running non-concurrent index creation (`CREATE INDEX`) on live production tables.
- ❌ Wrapping `CREATE INDEX CONCURRENTLY` inside a SQL transaction block or leaving failed `indisvalid = false` indexes behind without dropping them (`DROP INDEX CONCURRENTLY`).
- ❌ Using `COMMIT;` inside a PostgreSQL `DO $$ ... END $$;` block (syntax/runtime error: use `CREATE PROCEDURE` with `CALL` or external batched transactions).
- ❌ Running a batched backfill loop inside a single `DO $$` transaction without intermediate commits (holds row locks and dead tuples across the entire table until loop completion).
- ❌ Adding columns with volatile defaults (or non-constant defaults on `< PG 11`) that rewrite the full table heap under `ACCESS EXCLUSIVE`.
- ❌ Renaming or dropping columns directly without the dual-write Expand-Contract lifecycle.
- ❌ Running unthrottled `UPDATE` or `DELETE` across millions of rows without bounded batch limits.
- ❌ Executing DDL without explicit `lock_timeout` boundaries.

---

## References & Documentation
- Deep Playbook: [references/expand-contract-guide.md](./references/expand-contract-guide.md)
- Zero-Downtime Schema Evolution: [references/zero-downtime-schema-evolution.md](./references/zero-downtime-schema-evolution.md)
- Batched Backfilling & Shadow Writing: [references/data-backfill-and-shadow-writing.md](./references/data-backfill-and-shadow-writing.md)

## Resources & Examples
- Safe Migration Template: [resources/migration_template.sql](./resources/migration_template.sql)
- Migration Safety Checklist: [resources/migration-safety-checklist.json](./resources/migration-safety-checklist.json)
- Reversible Rollback Template: [resources/rollback_template.sql](./resources/rollback_template.sql)
- Zero-Lock DDL Script: [examples/zero_downtime_column_rename.sql](./examples/zero_downtime_column_rename.sql)
- Concurrent Index Creation: [examples/concurrent_index_creation.sql](./examples/concurrent_index_creation.sql)
- Batched Backfill Iterator: [examples/backfill_batch_iterator.sql](./examples/backfill_batch_iterator.sql)
