-- Before Optimization: Full Sequential Scan on 2M rows
-- Execution Time: ~140ms
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email, created_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 20;

-- Apply Composite Index with Covering INCLUDE
CREATE INDEX CONCURRENTLY idx_users_active_perf
ON users (status, created_at DESC)
INCLUDE (id, email);

-- After Optimization: Index-Only Scan with 0 heap fetches
-- Execution Time: ~0.15ms
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email, created_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 20;
