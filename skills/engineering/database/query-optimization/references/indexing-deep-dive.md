# Indexing Deep Dive & Planner Internals

Advanced architectural guide for composite index ordering, GIN fastupdate tuning, and index bloat mitigation.

---

## 1. The ERS Rule for Composite B-Tree Indexes

Always order multi-column index keys according to:
1. **Equality (E)**: Columns filtered with exact `=` comparisons.
2. **Range (R)**: Columns filtered with `<`, `>`, `BETWEEN`.
3. **Sort (S)**: Columns specified in `ORDER BY`.

```sql
-- Optimal for: WHERE tenant_id = 'abc' AND created_at >= '2026-01-01' ORDER BY priority DESC
CREATE INDEX idx_tenant_orders ON orders (tenant_id, created_at, priority DESC);
```

---

## 2. Expression (Functional) Indexes

Prevent index bypass caused by function wrappers:

```sql
-- Fails standard index: WHERE LOWER(email) = 'user@domain.com'
-- Optimal Expression Index:
CREATE INDEX CONCURRENTLY idx_users_lower_email ON users ((LOWER(email)));
```

---

## 3. Detecting Index Bloat with `pgstattuple`

```sql
CREATE EXTENSION IF NOT EXISTS pgstattuple;

SELECT table_len, tuple_count, free_percent
FROM pgstattuple('idx_orders_unprocessed');
```
