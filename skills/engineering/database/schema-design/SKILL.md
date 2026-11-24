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

## 5-Phase Agent Operational Protocol

```
Phase 1: Domain Entity & Cardinality Profiling
Phase 2: Primary Key & Multi-Tenancy Boundary Selection (UUIDv7, tenant_id)
Phase 3: Normalization & Constraint Modeling (3NF, CHECK, FOREIGN KEY)
Phase 4: Semi-Structured Boundary Partitioning (JSONB vs Relational)
Phase 5: Schema DDL Validation & Linter Verification
```

### Phase 1: Domain Entity & Cardinality Profiling
Map business domain aggregates, relationships (1:1, 1:N, N:M), and expected transaction volumes. Identify isolation requirements (multi-tenancy, soft deletes, temporal tracking).

### Phase 2: Primary Key & Multi-Tenancy Boundaries
Select primary keys:
- Use monotonic **UUIDv7** for distributed entities and public API surfaces to prevent B-Tree index fragmentation.
- Use **BIGINT GENERATED ALWAYS AS IDENTITY** for internal high-throughput append-only ledgers.
- Enforce composite primary/foreign keys `(tenant_id, id)` for shared-database multi-tenant architectures.

### Phase 3: Normalization & Constraint Modeling
Enforce Third Normal Form (3NF) to eliminate update anomalies. Mandate domain invariants via database-level `CHECK` constraints, foreign keys with `ON DELETE RESTRICT/CASCADE`, and non-nullable timestamp tracking.

### Phase 4: Semi-Structured Boundaries
Confine `JSONB` to unstructured third-party payloads, dynamic schema-less fields, or unindexed metadata. Keep filterable, aggregatable business fields in strongly typed relational columns.

### Phase 5: Verification & Schema Linting
Validate DDL syntax, index placement, and constraint definitions using schema verification tools:
```bash
sqlfluff lint schema.sql --dialect postgres
```

---

## Prohibited Anti-Patterns

- ❌ Using random UUIDv4 as primary keys on high-insert B-Tree tables (causes page splits).
- ❌ Storing relational, queryable domain fields inside unstructured JSONB blobs.
- ❌ Omitting `CHECK` constraints on status, currency, or numerical ranges.
- ❌ Missing composite foreign key indexes on join columns.
- ❌ Storing timestamps without explicit timezone metadata (`TIMESTAMP` instead of `TIMESTAMPTZ`).

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
