# Zero-Downtime Migration Deep Playbook

Comprehensive guidelines for table locks, lock timeouts, and PostgreSQL catalog mechanics.

---

## 1. Setting Explicit Lock Timeouts

Never run DDL in production without strict `lock_timeout` and `statement_timeout` bounds, and reset them afterwards:

```sql
SET lock_timeout = '2s';
SET statement_timeout = '10s';

ALTER TABLE orders ADD COLUMN fulfillment_status TEXT;

RESET lock_timeout;
RESET statement_timeout;
```

---

## 2. Safe Foreign Key Addition

Adding a foreign key acquires `SHARE ROW EXCLUSIVE` on both child and referenced parent tables during validation:

```sql
-- NOT VALID skips historical row scans so the SHARE ROW EXCLUSIVE lock is held briefly
SET lock_timeout = '2s';
ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_order_id
FOREIGN KEY (order_id) REFERENCES orders(id)
NOT VALID;
RESET lock_timeout;

-- VALIDATE CONSTRAINT takes SHARE UPDATE EXCLUSIVE, permitting concurrent reads and writes
ALTER TABLE order_items VALIDATE CONSTRAINT fk_order_items_order_id;
```

---

## 3. Contract Phase Cleanup

Execute Contract DDL only after all running application instances read/write exclusively from the new column or table and dependent views/triggers have been updated:

```sql
SET lock_timeout = '2s';
DROP TRIGGER IF EXISTS sync_legacy_to_new ON orders;
DROP FUNCTION IF EXISTS sync_orders_columns();
ALTER TABLE orders DROP COLUMN IF EXISTS legacy_status;
RESET lock_timeout;
```

---

## 4. Pre-Deployment DDL Verification Checklist

- [ ] All `CREATE INDEX` statements use `CONCURRENTLY` outside any transaction block.
- [ ] Every `ALTER TABLE` and `DROP` statement executes under explicit `lock_timeout`.
- [ ] No table-rewriting operations (`ALTER TABLE ... ALTER TYPE`, volatile `DEFAULT`s) executed without shadow columns/tables.
- [ ] Dual-writing verified in application staging before triggering backfills.
- [ ] Concurrent index builds verified via `pg_index.indisvalid = true`.
