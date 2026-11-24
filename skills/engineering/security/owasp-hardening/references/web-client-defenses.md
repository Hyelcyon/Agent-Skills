# Enterprise Web Client Defense Architecture

An advanced security manual for neutralizing Cross-Site Scripting (XSS, CWE-79), Cross-Site Request Forgery (CSRF, CWE-352), and implementing robust Content Security Policy (CSP).

---

## 1. Cross-Site Scripting (XSS)

### Attack Vectors
1. **Reflected XSS**: Malicious scripts from an HTTP request (URL parameter, query string) are reflected back in the immediate HTTP response without sanitization.
2. **Stored XSS**: Malicious script payload is persisted in a database (such as user comments, forum posts, profile names) and rendered unsanitized to other users.
3. **DOM-based XSS**: Malicious data is read from a DOM source (e.g. `location.search`, `window.name`) and written directly into an execution sink (e.g. `element.innerHTML`, `document.write`, `eval`).

### Mitigation Strategy
1. **Context-Aware Encoding**:
   - HTML Body: encode `<`, `>`, `&`, `"`, `'`.
   - HTML Attribute: encode all non-alphanumeric characters.
   - JavaScript Context: use JSON serialization with Unicode escaping (`\u003C` for `<`) rather than template string interpolation.
2. **Sanitization with DOMPurify**:
   - When rich text or HTML formatting must be supported, sanitize the untrusted string through a battle-tested library like DOMPurify with an explicit tag and attribute allowlist.
3. **Safe DOM Sinks**:
   - Always prefer `element.textContent` over `element.innerHTML`.
   - Never use `document.write()` or assign untrusted values to `element.src` for `script` or `iframe` elements.

---

## 2. Content Security Policy (CSP Level 3)

### Core Directives
A restrictive CSP is the ultimate defense-in-depth against XSS execution:

- `default-src 'self'`: Restricts loading of all resources to the current origin by default.
- `script-src 'self' 'nonce-RANDOM'`: Allows scripts only from the same origin or containing a cryptographically random, per-request nonce. Blocks all inline `<script>` tags without the nonce and forbids `eval()`.
- `object-src 'none'`: Disables dangerous legacy plugins like Flash or Silverlight.
- `base-uri 'self'`: Prevents attackers from injecting `<base href="...">` to hijack relative URL resolutions.
- `frame-ancestors 'none'`: Modern replacement for `X-Frame-Options: DENY`, completely neutralizing Clickjacking.
- `form-action 'self'`: Prevents form submissions from being redirected to malicious third-party origins.

---

## 3. Cross-Site Request Forgery (CSRF)

### Root Cause
Web browsers automatically include ambient authentication credentials (session cookies) with any outgoing HTTP request, regardless of whether the request was initiated by the trusted site or an attacker-controlled site (`<form action="https://bank.com/transfer" method="POST">`).

### Defense Strategy
1. **SameSite Cookie Attributes**:
   - Set `SameSite=Strict` on session cookies for high-security applications, preventing the cookie from being sent on any cross-site request.
   - Set `SameSite=Lax` as the minimum baseline for standard web applications.
2. **Synchronizer Token Pattern (Anti-CSRF Tokens)**:
   - Generate a cryptographically strong, pseudo-random token per user session (`crypto.randomBytes(32)`).
   - Require state-changing endpoints (POST, PUT, DELETE, PATCH) to supply this token via a custom HTTP request header (`X-CSRF-Token`).
   - Reject any state-changing request where the header token is missing or does not match the session-stored token.
3. **Custom Headers & Preflight Verification**:
   - Enforce that API endpoints require custom headers (e.g. `Content-Type: application/json` or `X-Requested-With: XMLHttpRequest`), which cannot be forged via standard cross-origin HTML form submissions without triggering a CORS preflight `OPTIONS` check.
