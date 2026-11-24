# Modern Backend API Engineering Guide

A senior reference for RESTful, RPC, and streaming API architectures adhering to modern enterprise web standards.

---

## 1. Pagination: Cursor-Based vs Offset-Based

### The Offset Pitfall (`LIMIT / OFFSET`)
Offset pagination (`OFFSET 100000 LIMIT 20`) causes severe performance degradation on large datasets:
- Full table scans: The database engine must scan and discard 100,000 records before returning the next 20.
- Window drift / Phantom items: If rows are added or deleted while a client paginates, items shift across pages, leading to duplicates or skipped records.

### The Cursor Standard
Cursor-based pagination uses an indexed composite key (e.g. `(created_at, id)`):
- O(1) seek performance via B-Tree index scan.
- Stable windows resistant to concurrent inserts and deletes.
- Encodes the cursor as an opaque base64 string: `base64(JSON.stringify({ createdAt, id }))`.

---

## 2. Idempotency Key Handling (IETF RFC Draft)

For state-changing operations (such as payment processing, order placement, or resource provisioning), clients send an `Idempotency-Key` header with a unique UUID.

### Lifecycle
1. Server receives request with `Idempotency-Key: <UUID>`.
2. Attempts atomic lock or entry creation in Redis with a 24-hour TTL.
3. If entry exists and status is `PROCESSING`, return `409 Conflict`.
4. If entry exists and status is `COMPLETED`, return the cached response headers and body directly without re-executing business logic.
5. If entry is new, process the business logic, store the response in the idempotency store, and return.

---

## 3. RFC 9457: Problem Details for HTTP APIs

Never return arbitrary ad-hoc error formats like `{ "error": "something failed" }`. Standardize all HTTP errors on `application/problem+json`:

- `type`: URI identifying the error problem type.
- `title`: Short human-readable summary.
- `status`: HTTP status code matching response header.
- `detail`: Human-readable explanation specific to this occurrence.
- `instance`: URI reference identifying the specific occurrence.
