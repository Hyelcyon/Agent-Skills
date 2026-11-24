# Normalization Trade-offs & High-Scale Modeling

Detailed reference for 3NF boundaries, denormalization thresholds, and soft delete alternatives.

---

## 1. Third Normal Form (3NF) vs Pragmatic Denormalization

- **Rule 1 (1NF)**: Atomic values, no repeating groups.
- **Rule 2 (2NF)**: All non-key attributes fully dependent on the primary key.
- **Rule 3 (3NF)**: No transitive dependencies (e.g., store `user_id`, not `user_name` inside `orders`).
- **When to Denormalize**: Only when profiling proves cross-table JOINs exceed latency SLOs, and cache invalidation is explicitly automated.

---

## 2. Eliminating the Soft-Delete Anti-Pattern (`is_deleted`)

The `is_deleted = true` pattern poisons every unique constraint and query planner filter.
- **Senior Alternative**: Move deleted rows into an explicit archive table (`orders_archive`), or use separate PostgreSQL table partitioning.
