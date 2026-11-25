-- Execute outside a transaction block (autocommit); PostgreSQL rejects CONCURRENTLY inside BEGIN..COMMIT
SET statement_timeout = '0';
SET lock_timeout = '5s';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_tenant_created
ON users (tenant_id, created_at DESC);

RESET lock_timeout;
RESET statement_timeout;

-- If is_valid = false after an interrupted build, clean up via: DROP INDEX CONCURRENTLY IF EXISTS idx_users_tenant_created;
SELECT
    c.relname AS index_name,
    i.indisvalid AS is_valid,
    i.indisready AS is_ready,
    pg_size_pretty(pg_relation_size(c.oid)) AS index_size
FROM pg_index i
JOIN pg_class c ON c.oid = i.indexrelid
WHERE c.relname = 'idx_users_tenant_created';
