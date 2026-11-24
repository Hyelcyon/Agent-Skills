from typing import Any, Sequence
import psycopg
from psycopg import sql

ALLOWED_SORT_COLUMNS: frozenset[str] = frozenset({"id", "email", "created_at", "username"})
ALLOWED_DIRECTIONS: frozenset[str] = frozenset({"ASC", "DESC"})

def fetch_users_safely(
    conn: psycopg.Connection[Any],
    status_filter: str,
    sort_column: str,
    sort_direction: str,
    limit: int = 50,
) -> list[tuple[Any, ...]]:
    safe_col = sort_column if sort_column in ALLOWED_SORT_COLUMNS else "id"
    safe_dir = sort_direction.upper() if sort_direction.upper() in ALLOWED_DIRECTIONS else "ASC"
    safe_limit = max(1, min(limit, 100))

    query = sql.SQL(
        "SELECT id, email, username, status FROM users WHERE status = %s ORDER BY {col} {dir} LIMIT %s"
    ).format(
        col=sql.Identifier(safe_col),
        dir=sql.SQL(safe_dir),
    )

    with conn.cursor() as cursor:
        cursor.execute(query, (status_filter, safe_limit))
        return cursor.fetchall()
