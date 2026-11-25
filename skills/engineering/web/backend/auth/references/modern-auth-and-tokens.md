# Modern Web Authentication & Token Security Architecture

A comprehensive guide for OAuth 2.1, Proof Key for Code Exchange (PKCE), Backend-for-Frontend (BFF) session isolation, and Passkeys / WebAuthn.

---

## 1. OAuth 2.1 Standard & Mandatory PKCE

OAuth 2.1 consolidates core OAuth 2.0 specifications while eliminating outdated and insecure practices:

### Key Changes from OAuth 2.0
1. **PKCE Mandatory for All Clients**:
   - Proof Key for Code Exchange is required for public clients (SPAs, mobile apps) AND confidential clients (backend servers).
   - Prevents authorization code interception attacks.
2. **Deprecation of Dangerous Grants**:
   - The **Implicit Grant** (`response_type=token`) is prohibited; access tokens are never returned in URL fragments.
   - The **Resource Owner Password Credentials (ROPC)** grant is prohibited; applications must never handle raw user passwords directly.
3. **Exact Redirect URI Matching**:
   - Wildcards or partial path matching in `redirect_uri` configurations are forbidden.

---

## 2. Backend-for-Frontend (BFF) Pattern

### The SPA Token Storage Dilemma
Storing access tokens or refresh tokens in browser `localStorage` or `sessionStorage` exposes them to immediate theft via any Cross-Site Scripting (XSS) vulnerability.

### The BFF Solution
1. The browser client communicates only with a lightweight backend proxy (the BFF).
2. The BFF exchanges the authorization code for tokens and retains the access and refresh tokens in server-side storage (Redis/encrypted session store).
3. The BFF issues an encrypted, `HttpOnly`, `Secure` session cookie (`SameSite=Lax` when OAuth IdP top-level redirects must reach `/callback`; `SameSite=Strict` for state-changing APIs and privilege-step cookies).
4. When the browser makes API requests, the BFF validates the session cookie, attaches the Bearer token, and proxies the request to downstream resource APIs.

---

## 3. Passkeys & WebAuthn (FIDO2) Architecture

Passkeys replace passwords with public-key cryptography tied to hardware authenticators (Touch ID, Face ID, Windows Hello, YubiKeys).
- **Registration**: Server issues a random cryptographic challenge. The authenticator generates a key pair, signs the challenge with the private key, and returns the public key to the server.
- **Authentication**: Server issues a new challenge. The authenticator prompts biometric verification, signs the challenge, and the server verifies the signature against the stored public key.
- Completely immune to credential stuffing, brute-forcing, and phishing.
