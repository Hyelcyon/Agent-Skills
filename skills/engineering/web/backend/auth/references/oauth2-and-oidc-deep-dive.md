# OAuth 2.1 and OpenID Connect (OIDC) Architecture

Engineering specifications for modern authorization flows, PKCE enforcement, OIDC discovery, and token exchange.

---

## 1. The OAuth 2.1 Security Baseline

OAuth 2.1 consolidates best practices into a mandatory baseline:
- **Deprecation of Implicit Flow**: The implicit grant (`response_type=token`) is prohibited; it exposes access tokens in URL hash fragments and browser histories.
- **Deprecation of Resource Owner Password Credentials**: Direct credential sharing is prohibited.
- **Mandatory PKCE**: Proof Key for Code Exchange (RFC 7636) is required for ALL clients (both public SPAs and confidential server backends).
- **Exact Redirect URI Matching**: Authorization servers must strictly enforce exact string matching on redirect URIs, forbidding wildcard domains.

---

## 2. Authorization Code with PKCE Flow

```
[Client] ──(1) Compute code_verifier & code_challenge (S256)──► [Browser]
   │                                                                 │
   │ ◄──(2) Redirect to /authorize?code_challenge=...───────────────┘
   │
   ▼
[Auth Server] ──(3) Authenticate user & issue authorization_code
   │
   ▼
[Client Backend] ──(4) POST /token (code + code_verifier)
   │
   ▼
[Auth Server] ──(5) Verify S256(code_verifier) == code_challenge ──► Returns JWT access_token & id_token
```

---

## 3. OpenID Connect Discovery Metadata

Client applications must dynamically discover authorization server endpoints via the standard metadata endpoint:
`https://auth.enterprise.com/.well-known/openid-configuration`

Clients must verify that:
- `jwks_uri` keys match the `kid` header in incoming ID tokens.
- `iss` claim matches the issuer URL exactly.
- `aud` claim matches the registered client ID.

---

## 4. Workload Identity Token Exchange (RFC 8693)

For zero-trust microservice-to-microservice delegation:
- Use RFC 8693 OAuth 2.0 Token Exchange to trade end-user tokens for scoped, short-lived service tokens.
- Never pass long-lived user refresh tokens downstream across multiple internal services.
