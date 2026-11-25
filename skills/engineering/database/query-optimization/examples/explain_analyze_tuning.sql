EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email, created_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 20;

-- Execute outside a transaction block; partial predicate avoids indexing inactive rows
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_perf
ON users (created_at DESC)
INCLUDE (id, email)
WHERE status = 'active';

-- Run VACUUM users so the Visibility Map marks heap pages all-visible (achieving Heap Fetches: 0)
VACUUM ANALYZE users;

EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email, created_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 20;
