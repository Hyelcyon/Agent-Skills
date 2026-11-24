interface DatabaseClient {
  query<T>(sql: string, params: readonly unknown[]): Promise<T[]>;
}

interface UserAccount {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}

const ALLOWED_ORDER_COLUMNS: ReadonlySet<string> = new Set([
  'id',
  'email',
  'createdAt'
]);

const ALLOWED_DIRECTIONS: ReadonlySet<string> = new Set([
  'ASC',
  'DESC'
]);

async function findUsersSafely(
  db: DatabaseClient,
  roleFilter: string,
  sortColumn: string,
  sortDirection: string
): Promise<UserAccount[]> {
  const safeColumn = ALLOWED_ORDER_COLUMNS.has(sortColumn) ? sortColumn : 'id';
  const safeDirection = ALLOWED_DIRECTIONS.has(sortDirection.toUpperCase())
    ? sortDirection.toUpperCase()
    : 'ASC';

  const sql = `SELECT id, email, role, created_at AS "createdAt" FROM users WHERE role = $1 ORDER BY ${safeColumn} ${safeDirection} LIMIT 50`;

  return db.query<UserAccount>(sql, [roleFilter]);
}

export { findUsersSafely };
export type { DatabaseClient, UserAccount };
