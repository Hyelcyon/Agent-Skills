# Temporal Schemas, SCD Type 2, and Audit Trails

Engineering standards for point-in-time historical querying, audit compliance, and system-versioned temporal data modeling.

---

## 1. Slowly Changing Dimensions (SCD Type 2)

SCD Type 2 captures historical changes by creating a new record for every mutation, preserving previous states indefinitely:

```sql
CREATE TABLE product_price_history (
  history_id BIGSERIAL PRIMARY KEY,
  product_id UUID NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  valid_from TIMESTAMPTZ NOT NULL,
  valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity'::timestamptz,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT check_time_order CHECK (valid_from < valid_to)
);

CREATE INDEX idx_product_price_temporal
ON product_price_history (product_id, valid_from, valid_to);
```

### Querying Point-in-Time Price
```sql
SELECT price
FROM product_price_history
WHERE product_id = 'prod_442'
  AND '2026-06-15 10:00:00+00'::timestamptz BETWEEN valid_from AND valid_to;
```

---

## 2. Append-Only Event Sourced Ledgers

For financial and compliance-critical data (ledgers, balances), prohibit in-place updates completely:
- No `UPDATE` or `DELETE` statements are ever granted on the ledger table (`REVOKE UPDATE, DELETE ON ledger_entries FROM app_user;`).
- All state changes are recorded as positive or negative transaction entries.
- The current balance is derived as `SUM(amount)` or queried from a materialized snapshot table refreshed via triggers or events.

---

## 3. Automated Change Data Auditing

Track the exact actor, timestamp, and field diff for every table update:

```sql
CREATE TABLE audit_trail (
  audit_id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  actor_id TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
