---
name: ci-cd
description: Use when authoring GitHub Actions workflows, setting up CI/CD pipelines, optimizing test parallelization and caching, hardening workflow security, or configuring deployment environments.
---

# Modern CI/CD Engineering (GitHub Actions)

An enterprise runbook for architecting fast, secure, and maintainable CI/CD pipelines following Trunk-Based Development and DevSecOps principles.

## When to Use
- Creating or editing `.github/workflows/*.yml` files.
- Optimizing pipeline speed using caching, matrix testing, and path filtering.
- Hardening workflow security: pinning action SHAs, least-privilege tokens, OIDC.
- Configuring build-once artifact promotion and deployment environments.

## When NOT to Use
- Managing GitHub repo rules, CODEOWNERS, or PR templates (use `github`).
- Resolving local git conflicts or writing commit messages (use `git`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Pipeline Trigger & Branch Topology Mapping
Phase 2: Security & Permission Boundary Lockdown (read-only tokens, pinned SHAs)
Phase 3: Deterministic Job Isolation & Caching Setup
Phase 4: Matrix Parallelization & Failure Domain Containment
Phase 5: Dry-Run Validation & Actionlint Verification
```

### Phase 1: Pipeline Trigger & Topology Mapping
Map workflow triggers (`pull_request`, `push`, `workflow_dispatch`). Configure concurrency groups with `cancel-in-progress: true` to prevent redundant worker runs.

### Phase 2: Security & Permission Boundary Lockdown
Mandate top-level `permissions: contents: read`. Pin external action references to immutable 40-character commit SHAs. Replace static cloud secrets with OIDC federated credentials.

### Phase 3: Deterministic Job Isolation & Caching
Structure pipelines to build artifacts once. Restore lockfile-hashed package caches (`actions/setup-*` or `actions/cache`) before build and test phases.

### Phase 4: Matrix Parallelization & Failure Containment
Distribute long test suites across matrix dimensions (`os`, `node-version`). Define separate failure boundaries so linting or audit failures fail fast before resource-heavy integration runs.

### Phase 5: Verification & Actionlint Validation
Verify workflow syntax and shellcheck hygiene using actionlint before pushing changes:
```bash
actionlint .github/workflows/*.yml
```

---

## Prohibited Anti-Patterns

- ❌ Using mutable action tags like `@v4` or `@main` without commit SHAs.
- ❌ Granting unbounded top-level write permissions (`permissions: write-all`).
- ❌ Storing long-lived cloud access keys in repository secrets (use OIDC).
- ❌ Rebuilding container images or binaries separately for each deployment environment.
- ❌ Running pull request pipelines without concurrency cancellation.

---

## References & Documentation
- Advanced Deployment & Multi-Environment Promotion: [references/advanced-deployment.md](./references/advanced-deployment.md)
- GitHub Actions Security & OIDC: [references/github-actions-security-and-oidc.md](./references/github-actions-security-and-oidc.md)
- Pipeline Caching & Matrix Testing: [references/pipeline-caching-and-matrix-testing.md](./references/pipeline-caching-and-matrix-testing.md)

## Resources & Examples
- Standard CI Workflow Template: [resources/ci.yml](./resources/ci.yml)
- Security Audit Scan Workflow: [resources/security-audit.yml](./resources/security-audit.yml)
- Actionlint Configuration: [resources/actionlint.yaml](./resources/actionlint.yaml)
- OIDC Production Authentication Workflow: [examples/oidc_production_workflow.yml](./examples/oidc_production_workflow.yml)
- Dependency Caching Workflow: [examples/dependency_cache_workflow.yml](./examples/dependency_cache_workflow.yml)
- Container Cosign Attestation Workflow: [examples/container_cosign_attestation.yml](./examples/container_cosign_attestation.yml)
