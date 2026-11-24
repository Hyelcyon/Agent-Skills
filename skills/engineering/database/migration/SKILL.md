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

## 5-Phase Agent Operational Protocol

```
Phase 1: Table Scale & Lock Dependency Profiling
Phase 2: Expand Phase Execution (Additive, Nullable DDL, Concurrent Indexes)
Phase 3: Dual-Write & Throttled Batch Backfilling
Phase 4: Contract Phase Execution (Constraint Validation & Schema Cleanup)
Phase 5: Lock & Replication Verification (pg_stat_activity, indisvalid check)
```

### Phase 1: Table Scale & Lock Dependency Profiling
Inspect table size, active read/write traffic, and foreign key dependencies. Set `lock_timeout = '5s'` to prevent queuing behind long-running queries.

### Phase 2: Expand Phase Execution
Execute strictly additive changes:
- Add new columns as `NULLABLE` without synchronous defaults.
- Create indexes using `CREATE INDEX CONCURRENTLY`.
- Add constraints with `NOT VALID` to avoid table scans during lock acquisition.

### Phase 3: Dual-Write & Throttled Backfilling
Deploy application version writing to both old and new schema representations. Execute backfilling in bounded cursor batches with sleep intervals to prevent WAL replication saturation.

### Phase 4: Contract Phase Execution
Validate constraints asynchronously via `VALIDATE CONSTRAINT`. Switch application read traffic to new columns. Deprecate and drop legacy columns once all pods run current code.

### Phase 5: Verification & Integrity Proof
Verify that concurrent indexes are valid (`indisvalid = true`) and that no orphaned locks remain in `pg_stat_activity`.

---

## Prohibited Anti-Patterns

- ❌ Non-concurrent index creation (`CREATE INDEX`) on production tables.
- ❌ Adding columns with non-constant defaults on legacy database engines.
- ❌ Renaming columns directly without the dual-write Expand-Contract lifecycle.
- ❌ Running unthrottled `UPDATE` or `DELETE` across millions of rows without batch limits.
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
