# Node.js Built-in SQLite Storage (`node:sqlite`)

Technical standards for utilizing Node.js built-in zero-dependency SQLite database module for local storage, caching, and testing.

---

## 1. Zero-Dependency Database Architecture

Node.js provides `node:sqlite`, a built-in SQLite engine:
- Eliminates native C++ compilation tools (`node-gyp`, Python, Visual C++ build tools) previously required by `better-sqlite3` or `sqlite3`.
- Ideal for embedded storage, fast session caching, audit logging, and isolated unit test fixtures.

---

## 2. Synchronous Database Operations: `DatabaseSync`

Initialize and interact with on-disk or in-memory databases (Note: On Node.js 22 LTS, pass `--experimental-sqlite` CLI flag; on Node.js 24/26+, it is available without flags, with `Database` supported alongside `DatabaseSync`):

```typescript
import { DatabaseSync } from 'node:sqlite';

export function initializeDatabase(dbPath: string = ':memory:'): DatabaseSync {
  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      balance INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    ) STRICT;
  `);

  return db;
}
```

### Mandatory `STRICT` Mode Tables
Always append `STRICT` to SQLite table definitions. This enforces strict datatype verification (integers cannot be coerced into strings, preventing silent type corruption).

---

## 3. Prepared Statements and Parameter Binding

Prepared statements prevent SQL injection and maximize query execution performance:

```typescript
import { DatabaseSync } from 'node:sqlite';

export class AccountRepository {
  private db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  insertAccount(id: string, email: string, balance: number): void {
    const statement = this.db.prepare(`
      INSERT INTO accounts (id, email, balance)
      VALUES (?, ?, ?)
    `);
    statement.run(id, email, balance);
  }

  findById(id: string): { id: string; email: string; balance: number } | undefined {
    const statement = this.db.prepare(`
      SELECT id, email, balance FROM accounts WHERE id = ?
    `);
    return statement.get(id) as { id: string; email: string; balance: number } | undefined;
  }

  listAll(): Array<{ id: string; email: string; balance: number }> {
    const statement = this.db.prepare(`
      SELECT id, email, balance FROM accounts ORDER BY created_at DESC
    `);
    return statement.all() as Array<{ id: string; email: string; balance: number }>;
  }
}
```

---

## 4. Transaction Management

Wrap multi-statement writes in transactions to ensure atomicity:

```typescript
export function transferFunds(
  db: DatabaseSync,
  sourceId: string,
  targetId: string,
  amount: number
): void {
  db.exec('BEGIN TRANSACTION');
  try {
    const debit = db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?');
    debit.run(amount, sourceId);

    const credit = db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?');
    credit.run(amount, targetId);

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
```
