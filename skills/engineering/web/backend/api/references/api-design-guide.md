# Modern Backend API Engineering Guide

A senior reference for RESTful, RPC, and streaming API architectures adhering to modern enterprise web standards.

---

## 1. Pagination: Cursor-Based vs Offset-Based

### The Offset Pitfall (`LIMIT / OFFSET`)
Offset pagination (`OFFSET 100000 LIMIT 20`) causes severe performance degradation on large datasets:
- Full table scans: The database engine must scan and discard 100,000 records before returning the next 20.
- Window drift / Phantom items: If rows are added or deleted while a client paginates, items shift across pages, leading to duplicates or skipped records.

### The Cursor Standard
Cursor-based pagination uses an indexed composite key on `NOT NULL` columns (e.g. `(created_at, id)`):
- `O(log N)` B-Tree keyset seek with constant per-page cost regardless of page depth.
- Stable windows resistant to concurrent inserts and deletes via deterministic `(created_at, id)` tie-breaking:
  ```sql
  SELECT id, created_at, total_cents
  FROM orders
  WHERE (created_at, id) < ($1, $2)
  ORDER BY created_at DESC, id DESC
  LIMIT $3;
  ```
- Encodes the cursor as an opaque URL-safe `base64url` string: `base64url(JSON.stringify({ createdAt, id }))`.

---

## 2. Idempotency Key Handling (IETF RFC Draft)

For state-changing operations (such as payment processing, order placement, or resource provisioning), clients send an `Idempotency-Key` header with a unique UUID.

### Lifecycle
1. Server receives request with `Idempotency-Key: <UUID>` and computes a canonical `payloadHash` (e.g. SHA-256 of method + path + canonical body).
2. Acquires an atomic lock entry (`SET key value NX EX <lockTtlSeconds>`) with `status = PROCESSING`, a unique `lockId`, and a short lease TTL (e.g. 30s) so crashed workers do not wedge the key for 24 hours.
3. If an entry already exists:
   - Compare `payloadHash`; return `422 Unprocessable Content` if the same key is reused with a different payload.
   - If `status === 'PROCESSING'`, return `409 Conflict` with `Retry-After`.
   - If `status === 'COMPLETED'`, return the cached status, headers, and body directly (even for empty `204 No Content` responses) without re-executing business logic.
4. Execute business logic. If execution throws before committing side effects, release the lock only if `lockId` still matches; otherwise store `COMPLETED` with the full retention TTL (e.g. 24h) and return.

---

## 3. RFC 9457: Problem Details for HTTP APIs

Never return arbitrary ad-hoc error formats like `{ "error": "something failed" }`. Standardize all HTTP errors on `Content-Type: application/problem+json` and never expose stack traces or raw SQL errors in `detail`:

- `type`: URI reference identifying the problem type (defaults to `"about:blank"` when omitted).
- `title`: Short human-readable summary.
- `status`: HTTP status code matching the response header.
- `detail`: Human-readable explanation specific to this occurrence.
- `instance`: URI reference identifying the specific occurrence.
