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
| **Transaction** | Connection released back to pool immediately after `COMMIT`/`ROLLBACK` | Supported via named prepared statements or protocol-level support | Modern OLTP microservices (Standard) |
| **Statement** | Connection released after every single SQL statement | Prohibited (multi-statement transactions break) | Simple single-query read replicas |

---

## 3. Transaction Pooling Rules & Caveats

When deploying PgBouncer in `pool_mode = transaction`:
- **Forbid Session-Level State**: Statements like `SET timezone = 'UTC'` or `LISTEN / NOTIFY` fail or leak into subsequent transactions for other clients.
- **Forbid Temporary Tables**: Session-bound `CREATE TEMP TABLE` instances leak or throw errors. Use `WITH` (CTE) or table variables.
- **Configure Application Pool Sizing**:
  Set application connection pool sizes (e.g. HikariCP, Prisma, pg-node) to small values:
  $$\text{PoolSize} = (\text{CoreCount} \times 2) + \text{SpindleCount}$$
  A fleet of 20 pods with 5 connections each (100 total) performs substantially better than 20 pods with 100 connections each (2,000 total).
