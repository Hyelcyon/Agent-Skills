---
name: secret-management
description: Use when managing application secrets, configuring HashiCorp Vault or AWS Secrets Manager, eliminating hardcoded credentials, automating secret rotation, or preventing secret leaks in CI/CD.
---

# Enterprise Secret Management & Zero-Hardcoded Secrets

Architecture and operational runbook for dynamic credential injection, automated secret rotation, and eliminating static secrets in source code and CI pipelines.

## When to Use
- Integrating HashiCorp Vault or AWS Secrets Manager into backend applications.
- Replacing long-lived static database passwords with Just-In-Time (JIT) dynamic credentials.
- Automating secret rotation without application downtime.
- Auditing codebases and git history for leaked credentials or static tokens.

## When NOT to Use
- Managing web application authorization or session cookies (use `owasp-hardening`).
- Implementing standard user authentication or OAuth2 login flows (use `auth`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Secret Surface & Credential Dependency Discovery
Phase 2: Dynamic Secret Provider Integration (Vault JIT, KMS, AWS Secrets Manager)
Phase 3: Automated Rotation Lifecycle Implementation (Dual-state, AWSPENDING)
Phase 4: Pre-Commit & CI Leak Prevention (Gitleaks, detect-secrets)
Phase 5: Remediation & Revocation Audit (git-filter-repo, token invalidation)
```

### Phase 1: Secret Surface Discovery
Scan source trees for hardcoded strings, API keys, private certificates, and unencrypted `.env` files. Identify whether secrets are long-lived or dynamic.

### Phase 2: Dynamic Secret Provider Integration
Replace static configuration files with runtime dynamic credential leases via HashiCorp Vault or cloud KMS. Applications request short-lived, auto-expiring database users or API tokens.

### Phase 3: Automated Rotation Implementation
Implement dual-credential rotation lifecycles:
1. Generate pending secret version (`AWSPENDING`).
2. Update target service/database credentials.
3. Validate connection health with candidate credentials.
4. Promote candidate to active (`AWSCURRENT`) without downtime.

### Phase 4: Leak Prevention & Pre-Commit Gates
Enforce automated commit hooks and CI scanning gates with Gitleaks:
```bash
gitleaks detect --source . --verbose
```

### Phase 5: Verification & Remediation Proof
If a leak occurs, **revoke and rotate the exposed credential first** before cleaning history (removing git commits without rotation leaves active keys exposed in forks/caches). Purge history via `git-filter-repo` only with explicit team/user authorization, then confirm zero hits with `gitleaks`.

---

## Prohibited Anti-Patterns & Fatal Mistakes

- ❌ Rewriting or force-pushing shared git history (`git-filter-repo`, `git push --force`) without revoking leaked tokens first and obtaining explicit user authorization.
- ❌ Storing secrets, passwords, or private keys directly in source code or git history.
- ❌ Checking plaintext `.env` files into version control.
- ❌ Using static root database credentials in production application pods.
- ❌ Logging decrypted secret payloads in error traces or console outputs.
- ❌ Rotating secrets destructively without health verification of the new credential.

---

## References & Documentation
- Zero-Trust Secrets Runbook: [references/zero-trust-secrets.md](./references/zero-trust-secrets.md)
- Vault Dynamic Credentials: [references/vault-and-dynamic-credentials.md](./references/vault-and-dynamic-credentials.md)
- Secrets Scanning & Remediation: [references/secrets-scanning-and-remediation.md](./references/secrets-scanning-and-remediation.md)

## Resources & Examples
- Recommended Environment Template: [resources/.env.example](./resources/.env.example)
- Gitleaks Production Config: [resources/gitleaks.toml](./resources/gitleaks.toml)
- Secrets Rotation Policy: [resources/secrets-rotation-policy.json](./resources/secrets-rotation-policy.json)
- AWS Secrets Manager Cache: [examples/aws_secrets_manager_cache.ts](./examples/aws_secrets_manager_cache.ts)
- Environment Redaction Sanitizer: [examples/env_redaction_sanitizer.ts](./examples/env_redaction_sanitizer.ts)
- Vault Dynamic Secret Fetcher: [examples/vault_dynamic_secret_fetcher.ts](./examples/vault_dynamic_secret_fetcher.ts)
