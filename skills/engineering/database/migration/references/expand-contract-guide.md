# Zero-Downtime Migration Deep Playbook

Comprehensive guidelines for table locks, lock timeouts, and PostgreSQL catalog mechanics.

---

## 1. Setting Explicit Lock Timeouts

Never run DDL in production without a strict `lock_timeout`:

```sql
SET lock_timeout = '2s';
SET statement_timeout = '10s';

ALTER TABLE orders ADD COLUMN fulfillment_status TEXT;
```

---

## 2. Safe Foreign Key Addition

Adding a foreign key can lock both child and parent tables during verification:

```sql
-- Step 1: Add constraint as NOT VALID (acquires brief lock, doesn't validate historical rows)
ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_order_id
FOREIGN KEY (order_id) REFERENCES orders(id)
NOT VALID;

-- Step 2: Validate constraint in background (takes SHARE UPDATE EXCLUSIVE, allows writes)
ALTER TABLE order_items VALIDATE CONSTRAINT fk_order_items_order_id;
```

---

## 3. Pre-Deployment DDL Verification Checklist

- [ ] All `CREATE INDEX` statements use `CONCURRENTLY`.
- [ ] No table-rewriting operations (`ALTER TABLE ... ALTER TYPE`) executed without shadow tables.
- [ ] Explicit `lock_timeout` defined at session start.
- [ ] Dual-writing verified in application staging before triggering backfills.
