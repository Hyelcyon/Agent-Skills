# Secrets Scanning, Leak Remediation, and Incident Response Architecture

Engineering procedures for preventing credential leaks via pre-commit hooks, CI scanning gates, rapid revocation, and Git history sanitization.

## 1. Multi-Tiered Secret Detection Pipeline

Preventing secrets from entering source repositories requires multiple automated defense layers:
1. **Developer Workstation (Pre-Commit)**: Blocks local commit creation if high-entropy strings or known credential patterns match.
2. **Pull Request CI Gate**: Validates every incoming commit before merge.
3. **Continuous Background Scanning**: Periodically audits repository history, wikis, and issues for newly disclosed patterns.

### Pre-Commit Gitleaks Hook Setup

```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.2
    hooks:
      - id: gitleaks
```

---

## 2. Emergency Incident Response: Leak Remediation Runbook

When an active API key, token, or password is accidentally committed or pushed, follow the strict incident response sequence:

### Immediate Phase 1: Revocation and Rotation (Priority 1)
Never assume a leaked secret was not observed. Automated internet crawlers scrape GitHub public commits within seconds of ingestion.
1. Revoke the leaked credential immediately in the upstream provider (AWS IAM, Stripe, Database, GitHub).
2. Issue a replacement credential and deploy it to production services.
3. Inspect provider access logs for anomalous activity from the timestamp of the commit until the revocation timestamp.

### Phase 2: Git History Sanitization (Priority 2)
Reverting a commit (`git revert`) or pushing an edit in a new commit does **NOT** delete the secret; the plaintext secret remains visible in commit history.

Use `git-filter-repo` to permanently erase the secret from all branches and tags:

```bash
git filter-repo --replace-text <(echo "leaked-secret-string-value==>REDACTED")
git push origin --force --all
git push origin --force --tags
```

Instruct all team members to re-clone the repository or rebase local branches onto the sanitized upstream history.
