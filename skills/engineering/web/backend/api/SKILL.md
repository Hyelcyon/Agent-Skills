---
name: api
description: Use when designing, building, or reviewing modern RESTful, RPC, or streaming APIs, implementing cursor-based pagination, RFC 9457 Problem Details error schemas, or Idempotency-Key mechanisms.
---

# Enterprise Backend API Engineering

A comprehensive runbook for architecting resilient, production-grade REST and RPC APIs, implementing O(1) cursor pagination, idempotency guarantees, and standard Problem Details error schemas.

## When to Use
- Designing RESTful endpoints, payload structures, and status code semantics.
- Replacing slow `LIMIT / OFFSET` pagination with opaque cursor-based pagination.
- Enforcing payment or state-changing mutation idempotency via `Idempotency-Key`.
- Formatting error responses according to RFC 9457 `application/problem+json`.
- Implementing API rate limiting (Token Bucket, Sliding Window).

## When NOT to Use
- Managing database migrations or query plans (use `migration` or `query-optimization`).
- Configuring network firewalls or TLS termination.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Contract & Resource URI Topology Profiling (OpenAPI 3.1)
Phase 2: Error & Header Boundary Definition (RFC 9457 Problem Details)
Phase 3: State Mutation & Idempotency Enforcement (Idempotency-Key header)
Phase 4: Scalable Traversal Implementation (O(1) cursor keyset pagination)
Phase 5: Contract & Integration Verification (prism mock, schema validation)
```

### Phase 1: Contract & Resource URI Profiling
Define RESTful resources with plural nouns (`/orders`, `/customers`). Validate payload schemas against OpenAPI 3.1 specifications.

### Phase 2: Error & Header Boundary Definition
Standardize error responses on RFC 9457 `application/problem+json`:
```json
{
  "type": "https://api.example.com/errors/invalid-order",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "Order items cannot be empty",
  "instance": "/orders/req_998877"
}
```

### Phase 3: State Mutation & Idempotency Enforcement
Require `Idempotency-Key` headers on non-idempotent mutation endpoints (`POST /payments`, `POST /transfers`). Cache results in an atomic distributed store (Redis) with TTLs.

### Phase 4: Scalable Traversal Implementation
Implement opaque, base64url-encoded composite cursor pagination `(created_at, id)`. Never expose raw database offsets on large public endpoints.

### Phase 5: Verification & Schema Proof
Validate endpoint conformance and status codes:
```bash
npx prism mock resources/openapi-31-template.json
```

---

## Prohibited Anti-Patterns

- ❌ Using deep `OFFSET` pagination on tables with more than 10,000 rows.
- ❌ Non-standard ad-hoc JSON error structures without status codes or RFC 9457 fields.
- ❌ Executing financial or stateful mutations without idempotency keys.
- ❌ Using HTTP verbs in URI paths (e.g. `/api/getOrderById` instead of `GET /api/orders/:id`).
- ❌ Returning HTTP 200 with `{ "error": true }` payloads.

---

## References & Documentation
- Deep API Architecture Guide: [references/api-design-guide.md](./references/api-design-guide.md)
- Modern API Protocols (REST vs RPC): [references/rest-vs-rpc-and-grpc.md](./references/rest-vs-rpc-and-grpc.md)
- Resilience & Rate Limiting: [references/api-resilience-and-rate-limiting.md](./references/api-resilience-and-rate-limiting.md)

## Resources & Examples
- RFC 9457 Problem Details Schema: [resources/problem-details.schema.json](./resources/problem-details.schema.json)
- OpenAPI 3.1 Specification Starter: [resources/openapi-31-template.json](./resources/openapi-31-template.json)
- API Versioning & Sunset Rules: [resources/api-versioning-rules.json](./resources/api-versioning-rules.json)
- Cursor Pagination Implementation: [examples/cursor_pagination.ts](./examples/cursor_pagination.ts)
- Idempotency Middleware: [examples/idempotency_middleware.ts](./examples/idempotency_middleware.ts)
- Sliding Window Rate Limiter: [examples/resilient_rate_limiter.ts](./examples/resilient_rate_limiter.ts)
