-- Matching index invariant: both keyset columns (created_at, id) must be NOT NULL and share identical sort direction
-- Execute outside a transaction block:
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_tenant_status_created_id
-- ON orders (tenant_id, status, created_at DESC, id DESC);

EXPLAIN (ANALYZE, BUFFERS, SETTINGS)
SELECT
    id,
    tenant_id,
    order_number,
    total_amount,
    currency,
    created_at
FROM orders
WHERE tenant_id = 't_1001'
  AND status = 'COMPLETED'
  AND (created_at, id) < ('2026-11-01 12:00:00+00'::timestamptz, '018f3a5b-7b00-7c22-8d99-001122334455'::uuid)
ORDER BY created_at DESC, id DESC
LIMIT 50;
