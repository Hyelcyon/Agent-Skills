---
name: schema-design
description: Use when designing relational database schemas, modeling ERDs, choosing primary key strategies (UUIDv7 vs BIGINT), enforcing third normal form (3NF), or planning JSONB vs relational columns.
---

# Enterprise Database Schema Architecture

Production standard for designing relational data models, selecting high-performance primary keys, and balancing normalization with read access patterns.

## When to Use
- Designing new entity relationship models and tables.
- Selecting primary key strategies (UUIDv7 vs sequential BIGINT).
- Deciding between structured relational columns vs semi-structured `JSONB`.
- Enforcing domain integrity via composite foreign keys and constraints.

## When NOT to Use
- Running alter migrations on live tables (use `migration`).
- Tuning query planner bottlenecks or indexing existing tables (use `query-optimization`).

---

## Senior Engineering Craftsmanship

- **Root-Cause Domain Tracing**: Trace entity cardinality, tenant isolation boundaries, and query/write access paths before writing DDL.
- **Minimal Surgical Diff**: Model normalized core entities and explicit constraints without speculative columns, premature denormalization, or redundant indexes.
- **Failing-First Repro**: Validate schema constraints against edge-case inserts (case-variant emails, overlapping temporal intervals, cross-tenant RLS, integer overflow) on a test DB before deploying.
- **Non-Blocking Verification**: Run DDL linters (`sqlfluff lint`) and ephemeral schema checks rather than mutating shared production schemas directly.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Domain Entity & Cardinality Profiling
Phase 2: Primary Key & Multi-Tenancy Boundary Selection (UUIDv7, tenant_id)
Phase 3: Normalization & Constraint Modeling (3NF, CHECK, FOREIGN KEY)
Phase 4: Semi-Structured Boundary Partitioning (JSONB vs Relational)
Phase 5: Schema DDL Validation & Linter Verification
```

### Phase 1: Domain Entity & Cardinality Profiling
Map business domain aggregates, relationships (1:1, 1:N, N:M), and expected transaction volumes. Identify isolation requirements (multi-tenancy, archival lifecycle, temporal tracking).

### Phase 2: Primary Key & Multi-Tenancy Boundaries
Select primary keys:
- Use monotonic **UUIDv7** (application-generated UUIDv7 / `pg_uuidv7`, or native `uuidv7()` in PostgreSQL 18+) for distributed entities and public API surfaces to prevent B-Tree index fragmentation. Never default high-write B-Tree PKs to `gen_random_uuid()` (UUIDv4).
- Use **BIGINT GENERATED ALWAYS AS IDENTITY** for internal high-throughput append-only ledgers and audit tables (never legacy `BIGSERIAL`).
- Enforce composite primary/foreign keys `(tenant_id, id)` for shared-database multi-tenant architectures.

### Phase 3: Normalization & Constraint Modeling
Enforce Third Normal Form (3NF) to eliminate update anomalies. Mandate domain invariants via database-level `CHECK` constraints, explicitly named foreign keys (`fk_...`) with `ON DELETE RESTRICT/CASCADE`, `BIGINT` or `NUMERIC` for monetary values, and non-nullable `TIMESTAMPTZ` tracking.

### Phase 4: Semi-Structured Boundaries
Confine `JSONB` to unstructured third-party payloads, dynamic schema-less fields, or unindexed metadata. Keep filterable, aggregatable business fields in strongly typed relational columns.

### Phase 5: Verification & Schema Linting
Validate DDL syntax, index placement, and constraint definitions using schema verification tools:
```bash
sqlfluff lint schema.sql --dialect postgres
```

---

## Fatal Mistakes Never to Make

- ❌ Using random UUIDv4 (`gen_random_uuid()`) as primary keys on high-insert B-Tree tables (causes page splits and buffer cache thrashing).
- ❌ Using legacy `BIGSERIAL` instead of SQL-standard `BIGINT GENERATED ALWAYS AS IDENTITY`.
- ❌ Storing relational, queryable domain fields inside unstructured JSONB blobs.
- ❌ Using `BETWEEN` for SCD Type 2 temporal queries (double-matches boundary timestamps; use half-open `[valid_from, valid_to)` ranges).
- ❌ Omitting `CHECK` constraints on status, currency, or numerical ranges, or sizing monetary cents columns as 32-bit `INT`.
- ❌ Missing foreign key indexes on child join columns.
- ❌ Storing timestamps without explicit timezone metadata (`TIMESTAMP` instead of `TIMESTAMPTZ`).
- ❌ Relying on PostgreSQL RLS with `SUPERUSER` or `BYPASSRLS` application roles, or missing `NULLIF(current_setting(...), '')`.

---

## References & Documentation
- Deep Playbook: [references/normalization-tradeoffs.md](./references/normalization-tradeoffs.md)
- Multi-Tenancy & Partitioning: [references/partitioning-and-multi-tenancy.md](./references/partitioning-and-multi-tenancy.md)
- Temporal Schemas & Auditing: [references/temporal-and-audit-schemas.md](./references/temporal-and-audit-schemas.md)

## Resources & Examples
- Production Schema Starter: [resources/base_table_schema.sql](./resources/base_table_schema.sql)
- Common Constraints & Triggers: [resources/common-constraints.sql](./resources/common-constraints.sql)
- Schema Linter Rules: [resources/schema-linter-rules.json](./resources/schema-linter-rules.json)
- Normalized E-Commerce Schema Example: [examples/ecommerce_schema.sql](./examples/ecommerce_schema.sql)
- Multi-Tenant Partitioning Example: [examples/multi_tenant_partitioning.sql](./examples/multi_tenant_partitioning.sql)
- Temporal Audit Table Example: [examples/temporal_audit_table.sql](./examples/temporal_audit_table.sql)
