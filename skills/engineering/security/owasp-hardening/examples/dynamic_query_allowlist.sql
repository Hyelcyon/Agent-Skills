CREATE OR REPLACE FUNCTION get_filtered_users(
    p_status TEXT,
    p_sort_column TEXT,
    p_sort_direction TEXT,
    p_limit INT
)
RETURNS TABLE (
    id UUID,
    email TEXT,
    username TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_clean_col TEXT;
    v_clean_dir TEXT;
    v_clean_limit INT;
    v_query TEXT;
BEGIN
    IF p_sort_column IN ('id', 'email', 'username', 'created_at') THEN
        v_clean_col := p_sort_column;
    ELSE
        v_clean_col := 'id';
    END IF;

    IF UPPER(p_sort_direction) IN ('ASC', 'DESC') THEN
        v_clean_dir := UPPER(p_sort_direction);
    ELSE
        v_clean_dir := 'ASC';
    END IF;

    v_clean_limit := GREATEST(1, LEAST(COALESCE(p_limit, 20), 100));

    v_query := format(
        'SELECT id, email, username, status, created_at FROM users WHERE status = %L ORDER BY %I %s LIMIT %s',
        p_status,
        v_clean_col,
        v_clean_dir,
        v_clean_limit
    );

    RETURN QUERY EXECUTE v_query;
END;
$$;
