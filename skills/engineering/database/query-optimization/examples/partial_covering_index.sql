-- Execute outside a transaction block; status stays in INCLUDE because the partial predicate covers multiple states
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_orders_covering
ON orders (tenant_id, created_at DESC)
INCLUDE (total_amount, currency, customer_id, status)
WHERE status IN ('PENDING', 'PROCESSING', 'REQUIRES_ACTION');

SELECT
    schemaname,
    relname AS tablename,
    indexrelname AS indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE indexrelname = 'idx_active_orders_covering';
