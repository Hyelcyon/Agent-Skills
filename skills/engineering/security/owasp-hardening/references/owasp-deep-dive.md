# OWASP Top 10 (2025/2026) Enterprise Deep Defense Playbook

A senior security architecture playbook aligning with the OWASP Top 10 (2025/2026 Edition) and the MITRE CWE Top 25 Most Dangerous Software Weaknesses.

---

## 1. Global Taxonomy & Threat Mapping

| OWASP Category | CWE Primary Targets | Core Defense Strategy |
| :--- | :--- | :--- |
| **A01: Broken Access Control** | CWE-862 (Missing Auth), CWE-918 (SSRF), CWE-22 (Path Traversal) | Tenant scoping, DNS pinning IP socket isolation, canonical path containment |
| **A02: Cryptographic Failures** | CWE-208 (Timing Attacks), CWE-916 (Weak Hashing), CWE-327 (Broken Crypto) | Constant-time comparisons, Argon2id memory-hard hashing, CSPRNG tokens |
| **A03: Injection** | CWE-89 (SQLi), CWE-78 (Command Injection), CWE-94 (Code Injection) | Parameterized queries, identifier allowlisting, isolated argument vectors (`shell=False`) |
| **A04: Insecure Design** | CWE-1059, Threat Modeling Flaws | Security architecture reviews, defense-in-depth, least privilege enforcement |
| **A05: Security Misconfiguration** | CWE-16 (Configuration Errors), CWE-1004 (Missing Cookie Flags) | Restrictive CSP, automated security headers, disabling debug modes |
| **A06: Vulnerable Components** | CWE-1104 (Third-Party Components) | Automated lockfile audits (`npm audit`, `pip-audit`, `cargo audit`), SBOM generation |
| **A07: Auth Failures** | CWE-287 (Improper Authentication), CWE-384 (Session Fixation) | Rate limiting, MFA enforcement, strict session rotation on privilege change |
| **A08: Software & Data Integrity** | CWE-502 (Insecure Deserialization), CWE-1321 (Prototype Pollution) | Structured schema deserialization (Zod/Pydantic), prototype key stripping |
| **A09: Logging & Monitoring** | CWE-778 (Insufficient Logging), CWE-117 (Log Injection) | Structured JSON logging with CRLF sanitization, centralized SIEM alerts |
| **A10: Exceptional Conditions & ReDoS** | CWE-1333 (ReDoS), CWE-755 (Improper Exception Handling) | Linear regex engines (RE2), input length bounds, safe exception handling |

---

## 2. Cross-Language Defense Standards

### Python (3.12 / 3.13 Standards)
- Parameterized SQL: `psycopg` (v3) using native `%s` tuples or `sql.Identifier` allowlisting.
- Subprocess: `subprocess.run(["binary", ...], shell=False, check=True)`.
- Filesystem: `pathlib.Path(target).resolve().is_relative_to(base_dir)`.
- Deserialization: `pydantic.BaseModel.model_validate_json()` instead of `pickle`.
- Timeouts & Network: `urllib3` with custom socket verification against internal CIDRs.

### TypeScript / Node.js (22 / 24 LTS Standards)
- Parameterized SQL: Tagged templates (`prisma.$queryRaw`, `sql` tags, `db.query('$1', [val])`).
- Process Spawning: `node:child_process.execFile` with explicit argument array and `{ shell: false }`.
- Filesystem: `node:path.resolve` boundary verification with `node:fs/promises.realpath`.
- Deserialization: `JSON.parse` with recursive prototype key filter (`__proto__`, `constructor`, `prototype`).
- Network: Custom `http.Agent` / `https.Agent` overriding socket connection to pinned, validated IP.

---

## 3. Specialized Deep Dive Modules
- Injection Defenses: [references/injection-defenses.md](./injection-defenses.md)
- Broken Access Control & SSRF: [references/broken-access-control.md](./broken-access-control.md)
- Web Client Defenses (XSS & CSRF): [references/web-client-defenses.md](./web-client-defenses.md)
- Data Integrity, Deserialization & ReDoS: [references/data-integrity-and-deserialization.md](./data-integrity-and-deserialization.md)
- Cryptography & Authentication: [references/cryptography-and-authentication.md](./cryptography-and-authentication.md)
