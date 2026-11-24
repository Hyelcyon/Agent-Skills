---
name: owasp-hardening
description: Use when neutralizing OWASP Top 10 and CWE Top 25 vulnerabilities across Python, TypeScript, and SQL, mitigating SQLi, Command Injection, SSRF, Path Traversal, Prototype Pollution, Insecure Deserialization, ReDoS, Timing Attacks, XSS, CSRF, or XXE.
---

# Enterprise OWASP Defense & Vulnerability Hardening

Senior security engineering standards for mitigating all major web and application vulnerability classes across Python, TypeScript, and SQL according to the OWASP Top 10 (2025/2026 Edition) and the MITRE CWE Top 25 Most Dangerous Software Weaknesses.

## When to Use
- Writing or reviewing database queries, dynamic sorting, or ORM calls (SQLi, CWE-89).
- Invoking system processes, CLI binaries, or external tools from backend runtimes (Command Injection, CWE-78).
- Performing outbound HTTP requests, webhooks, or fetching user-provided URLs (SSRF, CWE-918).
- Accessing local files, uploads, and assets based on user-supplied paths (Path Traversal, CWE-22).
- Parsing and deserializing JSON, YAML, XML, or handling object merges (Insecure Deserialization, Prototype Pollution, XXE).
- Compiling or executing regular expressions on untrusted user inputs (ReDoS, CWE-1333).
- Implementing authentication verification, password hashing, HMAC checks, or session cookies (Timing Attacks, Cryptographic Failures).
- Rendering dynamic web content, templates, or managing state-changing requests (XSS, CSRF, CSP).

## When NOT to Use
- Managing cloud infrastructure secrets, Vault tokens, or API keys in CI/CD pipelines (use `secret-management`).
- Setting up network firewalls or physical perimeter security.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Attack Surface & Input Boundary Enumeration
Phase 2: Strict Allowlisting & Canonicalization
Phase 3: Parameterization & Safe API Substitution
Phase 4: Defense-in-Depth Context Enforcement
Phase 5: Automated Static & Dynamic Verification
```

### Phase 1: Attack Surface & Input Boundary Enumeration
Identify all untrusted input vectors: query parameters, JSON payloads, headers, path variables, file uploads, and webhooks. Map each vector to its downstream sink.

### Phase 2: Strict Allowlisting & Canonicalization
Enforce strict allowlists before processing. Canonicalize paths with `Path.resolve()` and verify boundary containment (`is_relative_to`). For dynamic SQL identifiers, match against immutable sets:
```typescript
const ALLOWED_COLUMNS: ReadonlySet<string> = new Set(['id', 'email', 'createdAt']);
const safeColumn = ALLOWED_COLUMNS.has(userCol) ? userCol : 'id';
```

### Phase 3: Parameterization & Safe API Substitution
Never concatenate input into interpreters:
- **SQL**: Use parameterized placeholders (`$1`, `?`).
- **OS Exec**: Pass argument vectors to `subprocess.run(shell=False)` or `execFile()`.
- **SSRF**: Resolve DNS once, reject private IP ranges, and pin connections.
- **Timing**: Use `timingSafeEqual()` for cryptographic comparisons.

### Phase 4: Defense-in-Depth Context Enforcement
Apply context-aware protections:
- Strip `__proto__`, `constructor`, `prototype` during object assignments.
- Sanitize HTML with DOMPurify and mandate strict Content-Security-Policy headers.
- Bound regex input lengths and avoid nested quantifiers to neutralize ReDoS.

### Phase 5: Automated Static & Dynamic Verification
Execute static security analysis and unit tests:
```bash
npx eslint --plugin security .
bandit -r src/
```

---

## Prohibited Anti-Patterns

- ❌ Dynamic SQL string formatting or template literals (`SELECT ... WHERE id = ${id}`).
- ❌ Passing commands to shell interpreters with `shell=True` or `child_process.exec()`.
- ❌ Direct HTTP requests to user-supplied URLs without IP range validation and DNS pinning.
- ❌ Resolving filesystem paths without canonical containment checks (`target.resolve()`).
- ❌ Standard equality checks (`===`) for HMAC, API tokens, or session secrets.
- ❌ Native unpickling or untrusted object deserialization (`pickle.loads`, `yaml.unsafe_load`).

---

## References & Documentation
- [OWASP Deep Defense Playbook](./references/owasp-deep-dive.md)
- [Injection Defenses (SQLi, Command, Code)](./references/injection-defenses.md)
- [Broken Access Control, SSRF & Path Traversal](./references/broken-access-control.md)
- [Web Client Defenses (XSS, CSRF, CSP)](./references/web-client-defenses.md)
- [Data Integrity, Deserialization, Prototype Pollution & ReDoS](./references/data-integrity-and-deserialization.md)
- [Cryptography, Timing Attacks & Authentication Hardening](./references/cryptography-and-authentication.md)

## Resources & Configuration
- [Production Security Headers](./resources/security-headers.json)
- [Restricted IP Ranges & CIDR Blocks](./resources/restricted-ip-ranges.json)
- [Input Validation & Identifier Schemas](./resources/input-validation-schemas.json)

## Production-Grade Defense Code Examples
- SQL Injection Defense: [TypeScript](./examples/safe_sql_parameterization.ts) | [Python](./examples/safe_sql_parameterization.py) | [SQL](./examples/dynamic_query_allowlist.sql)
- OS Command Injection: [TypeScript](./examples/safe_command_execution.ts) | [Python](./examples/safe_command_execution.py)
- SSRF & DNS Pinning: [TypeScript](./examples/ssrf_dns_pinning_agent.ts) | [Python](./examples/ssrf_dns_pinning_fetcher.py)
- Path Traversal Guard: [TypeScript](./examples/safe_path_traversal_guard.ts) | [Python](./examples/safe_path_traversal_guard.py)
- Prototype Pollution & Safe Parsing: [TypeScript](./examples/safe_deserialization_and_proto.ts) | [Python](./examples/safe_deserialization.py)
- ReDoS Mitigation: [TypeScript](./examples/redos_mitigation.ts) | [Python](./examples/redos_mitigation.py)
- Timing Attack Defense: [TypeScript](./examples/timing_attack_protection.ts) | [Python](./examples/timing_attack_protection.py)
- Client Defenses: [XSS & CSRF](./examples/xss_and_csrf_protection.ts) | [XXE Parser](./examples/safe_xml_parsing.py)
