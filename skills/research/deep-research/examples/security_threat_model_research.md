# STRIDE Threat Modeling Assessment: Tenant API Gateway

## 1. Scope
Evaluation of tenant API edge gateway authentication, JWKS key validation, and error response serialization boundaries.

## 2. Threat Vector Analysis

| STRIDE Category | Threat Description | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Forged JWT signatures via `alg: none` or RS256/HS256 key confusion | Critical | Pin explicit allowed asymmetric algorithms (`EdDSA`, `RS256`) and verify against pinned JWKS endpoint |
| **Tampering** | Parameter tampering on `tenantId` query or body field | High | Derive `tenantId` exclusively from verified JWT claims; reject mismatched resource paths |
| **Repudiation** | Unauthenticated or disputed mutation without audit trace | Medium | Append immutable structured audit records via Transactional Outbox |
| **Information Disclosure** | Internal stack traces leaked in HTTP 500 responses | Medium | Serialize sanitized errors as `application/problem+json` (RFC 9457 Problem Details) |
| **Denial of Service** | Unbounded request flooding or oversized JWKS fetch | High | Enforce token-bucket rate limiting at edge plus cached JWKS with bounded HTTP timeouts |
| **Elevation of Privilege** | Role escalation via unvalidated claim or mass assignment | Critical | Enforce strict RBAC permission gates in service layer using explicit allowlists |

## 3. Spike Falsification & Verification Probes
- Verify JWT verifier rejects `alg: none`, expired `exp`, and symmetric `HS256` tokens signed with the public RSA key.
- Verify JWKS fetcher rejects private/link-local IP redirects (SSRF defense) and bounds response body size.
- Verify unhandled exceptions emit RFC 9457 JSON (`type`, `title`, `status`, `detail`) with zero stack frame leakage.
