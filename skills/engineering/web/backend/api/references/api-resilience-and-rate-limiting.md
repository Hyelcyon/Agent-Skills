# API Resilience, Rate Limiting, and Error Handling Standards

Engineering standards for protecting backend services from thundering herds, cascading failures, and unhandled fault propagation.

---

## 1. Sliding Window Rate Limiting

Avoid fixed-window counters that allow burst traffic at boundary edges. Implement sliding window logs or sliding window counters:

```typescript
export interface RateLimitStatus {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export function computeRateLimitHeaders(status: RateLimitStatus): Record<string, string> {
  return {
    'RateLimit-Limit': String(status.limit),
    'RateLimit-Remaining': String(status.remaining),
    'RateLimit-Reset': String(status.resetSeconds),
    ...(status.allowed ? {} : { 'Retry-After': String(status.resetSeconds) })
  };
}
```

---

## 2. Distributed Circuit Breaker Pattern

Prevent dead downstream dependencies from saturating API gateway thread pools:
- **Closed**: Requests pass through normally. Failure counts are tracked within a rolling time window.
- **Open**: When failure percentage exceeds threshold (e.g., 50%), all subsequent calls fail fast immediately without making network calls.
- **Half-Open**: After a recovery delay (e.g., 10 seconds), a single probe request is permitted. If successful, state resets to Closed.

---

## 3. Standardized Error Contracts: RFC 9457 Problem Details

Never return unstructured error strings or raw database stack traces. Return RFC 9457 JSON payloads:

```json
{
  "type": "https://api.enterprise.com/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Client exceeded the 100 requests per minute quota",
  "instance": "/orders/checkout",
  "retryAfter": 12
}
```

---

## 4. Key Failure Recovery Rules
- Always supply `Retry-After` headers on `429 Too Many Requests` and `503 Service Unavailable`.
- Pair client-side retries with exponential backoff and randomized jitter to eliminate synchronized retry spikes.
- Enforce request timeout budgets across every network hop using `AbortSignal.timeout(ms)`.
