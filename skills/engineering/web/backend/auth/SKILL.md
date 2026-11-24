---
name: auth
description: Use when designing web authentication architectures, implementing OAuth 2.1 with PKCE, configuring Backend-for-Frontend (BFF) session cookie management, or securing token lifecycles.
---

# Enterprise Web Authentication & Session Architecture

Senior engineering standards for modern authentication architectures: OAuth 2.1 with enforced PKCE, Backend-for-Frontend (BFF) token isolation, and secure session cookie governance.

## When to Use
- Implementing OAuth 2.1 authorization code flows with mandatory PKCE (`S256`).
- Architecting Backend-for-Frontend (BFF) proxy patterns to shield tokens from XSS.
- Issuing and rotating encrypted `HttpOnly`, `SameSite=Strict`, `Secure` session cookies.
- Planning Passkeys / WebAuthn FIDO2 authentication integration.

## When NOT to Use
- Implementing cryptographic password hashing functions directly (use `owasp-hardening`).
- Managing cloud infrastructure service accounts (use `secret-management`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Threat Model & Client Topology Identification (SPA, Native, BFF)
Phase 2: Authorization Protocol Formulation (OAuth 2.1 with mandatory PKCE S256)
Phase 3: Token Boundary Shielding (BFF pattern, __Host- prefix, HttpOnly cookies)
Phase 4: Session Lifecycle & Rotation Management (Absolute & idle timeouts)
Phase 5: Auth Flow Verification & Security Gate (CSRF validation, state check)
```

### Phase 1: Threat Model & Client Topology Identification
Determine client trust level. For browser single-page applications (SPAs), avoid exposing refresh tokens to JavaScript runtime memory.

### Phase 2: Authorization Protocol Formulation
Enforce OAuth 2.1 specification with mandatory Proof Key for Code Exchange (PKCE) using `code_challenge_method=S256`. Reject legacy implicit grants:
```typescript
const { codeVerifier, codeChallenge } = generatePkcePair();
```

### Phase 3: Token Boundary Shielding
Adopt the Backend-for-Frontend (BFF) proxy pattern. Store access/refresh tokens in server-side session stores or encrypted `__Host-` prefixed `HttpOnly`, `SameSite=Strict`, `Secure` cookies.

### Phase 4: Session Lifecycle & Rotation
Enforce dual timeouts (e.g., 15-minute idle timeout, 8-hour absolute timeout). Rotate session tokens on privilege escalation or login state transitions to prevent session fixation.

### Phase 5: Verification & CSRF Proof
Verify that state parameters and PKCE verifiers are cryptographically validated on the token exchange callback.

---

## Prohibited Anti-Patterns

- ❌ Storing access tokens or refresh tokens in `localStorage` or `sessionStorage` (exposed to XSS).
- ❌ Using legacy OAuth implicit grant (`response_type=token`).
- ❌ Omitting PKCE (`S256`) on authorization code exchange flows.
- ❌ Session cookies without `HttpOnly`, `Secure`, and `SameSite` flags.
- ❌ Reusing session IDs after successful user authentication (session fixation).

---

## References & Documentation
- Modern Auth & Token Security Guide: [references/modern-auth-and-tokens.md](./references/modern-auth-and-tokens.md)
- OAuth 2.1 & OIDC Deep Dive: [references/oauth2-and-oidc-deep-dive.md](./references/oauth2-and-oidc-deep-dive.md)
- RBAC, ABAC & Session Security: [references/rbac-abac-and-session-security.md](./references/rbac-abac-and-session-security.md)

## Resources & Examples
- OAuth 2.1 Baseline Config: [resources/oauth2-pkce-config.json](./resources/oauth2-pkce-config.json)
- Argon2id Password Hashing Parameters: [resources/argon2-id-parameters.json](./resources/argon2-id-parameters.json)
- OpenID Connect Metadata: [resources/oauth2-oidc-metadata.json](./resources/oauth2-oidc-metadata.json)
- PKCE Generation Implementation: [examples/oauth2_pkce_handler.ts](./examples/oauth2_pkce_handler.ts)
- BFF Session Cookie Manager: [examples/session_cookie_manager.ts](./examples/session_cookie_manager.ts)
- RBAC Permission Gate: [examples/rbac_permission_gate.ts](./examples/rbac_permission_gate.ts)
