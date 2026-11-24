# Enterprise Cryptography, Timing Attacks & Authentication Hardening

A definitive security reference for mitigating Timing Attacks (CWE-208), Cryptographic Failures (CWE-916), and Identification / Authentication Failures (OWASP A07).

---

## 1. Timing Attacks & Side-Channel Mitigation

### Root Cause
Standard string comparison operators (`===`, `!=`, `strcmp`, `==`) return `false` as soon as the first non-matching byte is encountered (early exit optimization). Attackers measure network latency differences down to nanoseconds to deduce password hashes, HMAC signatures, or authentication tokens character-by-character.

### Mitigation: Constant-Time Comparison
1. Always perform cryptographic token, signature, and hash comparisons using constant-time algorithms:
   - In Node.js / TypeScript: `crypto.timingSafeEqual(bufferA, bufferB)`.
   - In Python: `hmac.compare_digest(str_a, str_b)` or `secrets.compare_digest()`.
2. Ensure both buffers/strings are identical in length before passing to `timingSafeEqual`. To avoid leaking length information, hash both inputs with SHA-256 before constant-time comparison if input length is variable.

---

## 2. Password Hashing Standards (2026 Baseline)

### Obsolete vs Standard Cryptographic Functions
- Banned for Passwords: MD5, SHA-1, SHA-256, SHA-512 (these are designed for fast digest computation and can be broken with billions of guesses per second on modern GPUs/ASICs).
- Enterprise Standard: **Argon2id** (winner of the Password Hashing Competition, combines resistance to side-channel attacks and memory-hard GPU cracking).
- Secondary Standard: `scrypt` or `bcrypt` (minimum cost factor 12).

### Argon2id Recommended Parameters (2026 Production Baseline)
- Algorithm: Argon2id (hybrid version of Argon2d and Argon2i)
- Memory Cost ($m$): 64 MB (65,536 KiB)
- Time Cost ($t$, iterations): 3 passes
- Parallelism ($p$): 4 threads

---

## 3. Secure Session & Token Management

### Cryptographically Secure Randomness
- Never use pseudo-random generators like `Math.random()` or Python `random.random()` for security tokens, session IDs, or password reset tokens.
- Always use platform CSPRNGs:
  - Node.js / TypeScript: `crypto.randomBytes(32)` or `crypto.getRandomValues()`.
  - Python: `secrets.token_bytes(32)` or `secrets.token_urlsafe(32)`.

### Cookie Security Attributes
Production session cookies must strictly mandate:
- `HttpOnly`: Prevents client-side JavaScript from accessing the session token via `document.cookie` (defense-in-depth against session theft via XSS).
- `Secure`: Ensures cookies are transmitted only across encrypted HTTPS connections.
- `SameSite=Strict`: Blocks cross-site request leakage.
- `Path=/`: Restricts scope to application root.
- `Max-Age` / `Expires`: Enforce bounded session lifetimes with idle timeouts.
