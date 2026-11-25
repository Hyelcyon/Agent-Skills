# PostgreSQL EXPLAIN (ANALYZE, BUFFERS) Execution Plan Diagnostics

Engineering standards for reading execution plans, identifying bottlenecks, and optimizing query cost.

---

## 1. Running True Diagnostic Queries

Never run bare `EXPLAIN query` when profiling latency. Always include `ANALYZE` and `BUFFERS` to observe actual runtime execution and disk/cache interactions (wrap write statements `INSERT`/`UPDATE`/`DELETE` in `BEGIN; EXPLAIN (ANALYZE, BUFFERS) ...; ROLLBACK;` so mutations do not persist):

```sql
EXPLAIN (ANALYZE, BUFFERS, SETTINGS, TIMING)
SELECT id, total_amount
FROM orders
WHERE tenant_id = 't_101'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 2. Deciphering Key Scan Nodes

- **Sequential Scan (`Seq Scan`)**:
  - Scans every page in the table from disk/RAM.
  - Efficient only when returning $> 10-20\%$ of the entire table. On large tables with selective filters, indicates a missing or unusable index.
- **Index Scan**:
  - Navigates B-Tree index to retrieve tuple pointers, then fetches each row from table heap.
  - Can cause random I/O if rows are physically scattered.
- **Index Only Scan**:
  - All requested columns exist directly in the index (via index key or `INCLUDE` columns). Zero table heap pages are read **only when the Visibility Map (VM) marks those heap pages as `all-visible`** (maintained by `VACUUM` / autovacuum). High `Heap Fetches:` indicates stale visibility map bits.
- **Bitmap Index Scan + Bitmap Heap Scan**:
  - Collects row pointers in a memory bitmap, sorts them by physical disk location, and reads heap pages sequentially. Typical when returning a moderate number of rows ($1-10\%$).

---

## 3. Buffer Health Indicators

Inspect the `Buffers:` output line:
- `shared hit`: Pages found directly in PostgreSQL buffer cache (RAM).
- `shared read`: Pages read from disk or OS file cache (disk I/O penalty).
- `shared dirtied`: Pages modified by the operation.
- **Goal**: Minimize `shared read` on high-frequency OLTP queries.

---

## 4. Common Execution Plan Traps
- **Row Estimation Divergence**: If `rows=1` is estimated by the planner but `actual rows=500000` is observed, table statistics are stale. Run `ANALYZE table_name;`.
- **Function Wrapping on Indexed Columns**: `WHERE LOWER(email) = 'user@example.com'` invalidates a standard index on `email`. Use an expression index: `CREATE INDEX idx_users_lower_email ON users (LOWER(email));`.
