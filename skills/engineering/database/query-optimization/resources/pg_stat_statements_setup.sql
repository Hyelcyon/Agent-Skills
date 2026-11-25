-- Step 1 (PGC_POSTMASTER): Requires server restart after altering shared_preload_libraries / max
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.max = '10000';
-- Restart PostgreSQL before running CREATE EXTENSION and pg_reload_conf().

-- Step 2 (After restart): Create extension and apply hot-reloadable PGC_SUSET settings
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET track_io_timing = 'on';

SELECT pg_reload_conf();

SELECT
    queryid,
    calls,
    total_exec_time,
    mean_exec_time,
    stddev_exec_time,
    rows,
    shared_blks_hit,
    shared_blks_read,
    shared_blks_dirtied,
    shared_blks_written,
    temp_blks_written,
    round((shared_blks_hit::numeric / nullif(shared_blks_hit + shared_blks_read, 0)) * 100, 2) AS cache_hit_pct,
    substring(query from 1 for 120) AS normalized_query
FROM pg_stat_statements
WHERE calls > 5
ORDER BY total_exec_time DESC
LIMIT 25;
