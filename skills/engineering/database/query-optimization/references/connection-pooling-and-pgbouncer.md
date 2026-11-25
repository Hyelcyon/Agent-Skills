# PostgreSQL Connection Pooling and PgBouncer Architecture

Engineering standards for scaling concurrent database connections, preventing memory exhaustion, and managing connection pool modes.

---

## 1. Why Connection Pooling is Mandatory

In PostgreSQL, each client connection spawns a dedicated operating system backend process:
- Each backend allocates 5-20 MB of baseline RAM plus `work_mem`.
- 1,000 idle connections can consume $> 10\text{ GB}$ of RAM simply maintaining connection state.
- CPU context switching degrades drastically when active server connections exceed $2-4\times$ physical CPU cores.

---

## 2. PgBouncer Pool Modes

| Pool Mode | Lifecycle | Prepared Statements | Best For |
| :--- | :--- | :--- | :--- |
| **Session** | Connection tied to client for entire session duration | Fully supported | Legacy apps requiring session variables |
| **Transaction** | Connection released back to pool immediately after `COMMIT`/`ROLLBACK` | Supported in PgBouncer 1.21+ (`max_prepared_statements > 0`); older versions require disabling client prepared statements | Modern OLTP microservices (Standard) |
| **Statement** | Connection released after every single SQL statement | Prohibited (multi-statement transactions break) | Simple single-query read replicas |

---

## 3. Transaction Pooling Rules & Caveats

When deploying PgBouncer in `pool_mode = transaction`:
- **Forbid Session-Level State**: Statements like `SET timezone = 'UTC'` or `LISTEN / NOTIFY` leak across clients or fail. Use transaction-scoped `SET LOCAL` inside explicit `BEGIN ... COMMIT` blocks.
- **Forbid Session Temporary Tables**: Session-bound `CREATE TEMP TABLE` instances leak or fail across pooled backends. Use `WITH` (CTEs), `VALUES` lists, `unnest()` arrays, or route to a dedicated session-mode pool.
- **Budget Total Server Pool Size Across the Fleet**:
  Keep total upstream PostgreSQL backend connections (`default_pool_size` in PgBouncer) bounded near the hardware saturation limit:
  $$\text{TotalServerPool} \approx (\text{CoreCount} \times 2) + \text{EffectiveSpindleCount}$$
  On modern NVMe/cloud SSD volumes, treat `EffectiveSpindleCount` as `0–1`, then divide the total budget across pods (e.g., 20 pods with 5 connections each = 100 client slots multiplexed onto 16–32 server connections), rather than sizing each pod to the full core formula.
