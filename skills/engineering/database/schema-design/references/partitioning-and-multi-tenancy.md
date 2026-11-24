# Multi-Tenant Schema Architecture and Declarative Partitioning

Engineering standards for multi-tenant isolation, PostgreSQL Row-Level Security (RLS), and declarative range/list partitioning.

---

## 1. Multi-Tenancy Architecture Patterns

| Pattern | Isolation Level | Complexity | Operational Scaling |
| :--- | :--- | :--- | :--- |
| **Database-per-Tenant** | Total physical isolation | Highest | Challenging at >1,000 tenants |
| **Schema-per-Tenant** | Namespace isolation | High | Migration overhead multiplies per tenant |
| **Shared Table with Tenant ID** | Logical isolation via RLS | Lowest | Requires declarative partitioning for large tables |

---

## 2. PostgreSQL Row-Level Security (RLS)

When using shared tables, enforce tenant boundaries directly at the database engine level so queries cannot accidentally leak cross-tenant data:

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON documents
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

The application connection sets session configuration before executing queries:
```sql
SET LOCAL app.current_tenant_id = 'tenant_enterprise_alpha';
```

---

## 3. Declarative Table Partitioning

For tables exceeding tens of millions of records (telemetry, event logs, invoices), partition by range (time) or list (tenant region):

```sql
CREATE TABLE audit_logs (
  id UUID NOT NULL,
  tenant_id TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (id, event_time)
) PARTITION BY RANGE (event_time);

CREATE TABLE audit_logs_2026_11 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-11-01 00:00:00+00') TO ('2026-12-01 00:00:00+00');
```

### Partition Pruning Benefits
- When querying `WHERE event_time >= '2026-11-15'`, the planner scans ONLY partition `audit_logs_2026_11`, ignoring all historical partitions.
- Archiving data is an instantaneous metadata drop: `DROP TABLE audit_logs_2024_01;` instead of a slow, blocking delete.
