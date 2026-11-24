import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { DatabaseSync } from 'node:sqlite';

interface AccountRecord {
  id: string;
  name: string;
  balance: number;
}

class AccountService {
  private db: DatabaseSync;

  constructor() {
    this.db = new DatabaseSync(':memory:');
    this.db.exec(`
      CREATE TABLE accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0
      ) STRICT;
    `);

    const insert = this.db.prepare('INSERT INTO accounts (id, name, balance) VALUES (?, ?, ?)');
    insert.run('acc_1', 'Alice', 1000);
    insert.run('acc_2', 'Bob', 500);
  }

  getAccount(id: string): AccountRecord | undefined {
    const stmt = this.db.prepare('SELECT id, name, balance FROM accounts WHERE id = ?');
    return stmt.get(id) as AccountRecord | undefined;
  }

  listAccounts(): AccountRecord[] {
    const stmt = this.db.prepare('SELECT id, name, balance FROM accounts');
    return stmt.all() as AccountRecord[];
  }
}

const service = new AccountService();

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/accounts') {
    const accounts = service.listAccounts();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(accounts));
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/accounts/')) {
    const id = url.pathname.slice('/accounts/'.length);
    const account = service.getAccount(id);

    if (!account) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Account not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(account));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

export { server, AccountService };
