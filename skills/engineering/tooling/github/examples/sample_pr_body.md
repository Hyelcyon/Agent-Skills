## Context & Motivation
Closes #104. The previous checkout endpoint lacked idempotency keys, leading to duplicate charge incidents when users double-clicked the submit button under high network latency.

## Scope of Changes
- Add `Idempotency-Key` header parsing and validation in `checkoutRouter`.
- Store and verify lock states in Redis with a 120-second TTL.
- Add integration test exercising duplicate payload rejection.

## How to Test & Verify
```bash
npm run test:e2e -- tests/checkout.spec.ts
```

## Reviewer Checklist
- [x] Added integration tests for race conditions
- [x] No secrets or private API keys committed
- [x] OpenAPI specification updated with 409 Conflict status response
