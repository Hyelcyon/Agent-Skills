---
name: query-optimization
description: Use when analyzing slow SQL queries, interpreting EXPLAIN ANALYZE execution plans, designing B-Tree, GIN, BRIN, or covering indexes, and eliminating full table scans.
---

# PostgreSQL Query Optimization & Index Engineering

Production runbook for dissecting query plans, tuning cost-based planner behavior, selecting appropriate index access methods, and eliminating I/O bottlenecks.

## When to Use
- Diagnosing slow database queries (>50ms) using `EXPLAIN (ANALYZE, BUFFERS)`.
- Selecting appropriate index types: B-Tree vs GIN (JSONB/Arrays) vs BRIN (Time-series).
- Creating Covering Indexes (`INCLUDE` clause) to achieve Index-Only Scans.
- Designing Partial Indexes to reduce write amplification and index storage bloat.

## When NOT to Use
- Running schema migrations or altering production tables (use `migration`).
- Initial table normalization or entity relationship modeling (use `schema-design`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Query Execution Profiling (EXPLAIN ANALYZE, BUFFERS)
Phase 2: Access Path & Filter Diagnostics (Heap fetches, Sequential scans)
Phase 3: Index Architecture Selection (B-Tree, GIN, BRIN, Covering)
Phase 4: Keyset Pagination & Memory Boundary Enforcement (work_mem)
Phase 5: Performance Verification & Cache Hit Measurement
```

### Phase 1: Query Execution Profiling
Profile slow statements with `EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT)`. Measure total runtime, actual row counts against planner estimates, and disk I/O buffers (`shared read` vs `shared hit`).

### Phase 2: Access Path & Filter Diagnostics
Check for costly access bottlenecks:
- `Seq Scan`: Full table scan when an indexed lookup was intended.
- `Rows Removed by Filter`: Inefficient index condition requiring excessive heap lookups.
- `Sort Method: external merge Disk`: Query exceeded `work_mem` threshold and spilled to disk.

### Phase 3: Index Architecture Selection
Choose targeted index structures:
- B-Tree with composite ordering matching query `WHERE` and `ORDER BY` predicates.
- Covering indexes with `INCLUDE` to facilitate Index-Only Scans without touching table heap.
- Partial indexes with `WHERE` clauses to eliminate index bloat on processed records.

### Phase 4: Keyset Pagination & Memory Boundaries
Eliminate high-offset pagination (`OFFSET 100000`). Replace with keyset cursor predicates `(created_at, id) < ($last_time, $last_id)`. Tune session-level `work_mem` for analytical queries.

### Phase 5: Performance Verification & Proof
Re-run `EXPLAIN (ANALYZE, BUFFERS)` to confirm zero disk spills, low buffer reads, and plan cost reductions.

---

## Prohibited Anti-Patterns

- ❌ Running bare `EXPLAIN` without `(ANALYZE, BUFFERS)` in non-production performance tuning.
- ❌ Using deep `OFFSET` pagination on tables with more than 10,000 rows.
- ❌ Adding indexes without verifying column cardinality and write amplification costs.
- ❌ Wrapping indexed columns in unindexed functions (`WHERE LOWER(email) = ...`).
- ❌ Using GIN indexes on high-frequency transaction write tables without buffer consideration.

---

## References & Documentation
- Deep Playbook: [references/indexing-deep-dive.md](./references/indexing-deep-dive.md)
- Execution Plan Diagnostics: [references/explain-analyze-and-execution-plans.md](./references/explain-analyze-and-execution-plans.md)
- Connection Pooling & PgBouncer: [references/connection-pooling-and-pgbouncer.md](./references/connection-pooling-and-pgbouncer.md)

## Resources & Examples
- Slow Query Inspection Query: [resources/inspect_slow_queries.sql](./resources/inspect_slow_queries.sql)
- pg_stat_statements Setup: [resources/pg_stat_statements_setup.sql](./resources/pg_stat_statements_setup.sql)
- Query Budget Rules: [resources/query-budget-rules.json](./resources/query-budget-rules.json)
- Query Optimization Demonstration: [examples/explain_analyze_tuning.sql](./examples/explain_analyze_tuning.sql)
- Partial Covering Index Example: [examples/partial_covering_index.sql](./examples/partial_covering_index.sql)
- Keyset Pagination Query Example: [examples/keyset_pagination_query.sql](./examples/keyset_pagination_query.sql)
