# Indexing Deep Dive & Planner Internals

Advanced architectural guide for composite index ordering, GIN fastupdate tuning, and index bloat mitigation.

---

## 1. The ERS Rule & B-Tree Prefix Sort Limits

Order composite B-Tree index keys carefully based on **Equality (`E`)**, **Range (`R`)**, and **Sort (`S`)**:
1. **Equality (`E`) first**: Columns filtered with exact `=` comparisons narrow the index scan to a single contiguous prefix.
2. **Range breaks downstream sort order**: Once a B-Tree encounters an inequality range (`<`, `<=`, `>`, `>=`, `BETWEEN`, `IN`), subsequent columns are only sorted *within* identical values of that range column—**never globally across the range**.
   - If the query sorts on the range column itself (`WHERE tenant_id = 'abc' AND created_at >= '2026-01-01' ORDER BY created_at DESC`), `(tenant_id, created_at DESC)` eliminates both extra scans and any `Sort` node.
   - If the query filters a range on `created_at` and sorts on a *different* column (`ORDER BY priority DESC`), compare:
     - `(tenant_id, created_at)` (minimal scan over matching date window, followed by an in-memory `Sort` on `priority DESC`)
     - `(tenant_id, priority DESC, created_at)` (avoids `Sort` entirely and enables early exit for small `LIMIT`, at the cost of scanning higher priorities filtered by `created_at`)
3. **Null ordering**: Match `NULLS FIRST` / `NULLS LAST` explicitly when sorting nullable columns (`DESC` defaults to `NULLS FIRST` in PostgreSQL).

```sql
-- Eliminates Sort when ordering by the range column itself:
CREATE INDEX CONCURRENTLY idx_tenant_orders_created
ON orders (tenant_id, created_at DESC);

-- Eliminates Sort for top-N queries ordered by priority DESC:
CREATE INDEX CONCURRENTLY idx_tenant_orders_priority
ON orders (tenant_id, priority DESC, created_at);
```

---

## 2. Expression (Functional) Indexes

Prevent index bypass caused by function wrappers (function expressions need single parentheses; binary expressions like `(a + b)` need double parentheses):

```sql
-- Standard index on (email) is bypassed by WHERE LOWER(email) = 'user@domain.com'
CREATE INDEX CONCURRENTLY idx_users_lower_email ON users (LOWER(email));
```

---

## 3. Detecting Index Bloat with `pgstattuple`

```sql
CREATE EXTENSION IF NOT EXISTS pgstattuple;

SELECT table_len, tuple_count, free_percent
FROM pgstattuple('idx_orders_unprocessed');
```
