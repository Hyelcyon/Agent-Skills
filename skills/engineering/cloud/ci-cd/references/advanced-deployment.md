# Advanced Deployment & Artifact Promotion Patterns

Reference guide for containerized builds, GitOps pipelines, and immutable artifact promotion.

---

## 1. "Build Once, Promote Everywhere" Principle

Never rebuild Docker images or application bundles across staging and production environments. Rebuilding introduces non-deterministic dependency shifts.

```text
[Build Step] ──► Build Docker Image ──► Tag: commit-<SHA> ──► Push to Registry
                                                                    │
           ┌────────────────────────────────────────────────────────┴──────────────────────────────┐
           ▼                                                                                       ▼
[Deploy to Staging]                                                                     [Deploy to Production]
Pull: image:commit-<SHA>                                                                Pull EXACT SAME image:commit-<SHA>
Inject: STAGING_CONFIG                                                                  Inject: PROD_CONFIG
```

---

## 2. GitHub Environments & Deployment Gates

Configure environment protection rules in repository settings under **Settings → Environments**:

1. **Required Reviewers**: Protect `production` environment with mandatory team sign-offs.
2. **Deployment Branches**: Restrict production deployment to `main` branch only.
3. **Wait Timer**: Optional cooldown timer to catch early regressions.

```yaml
jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.myproject.com
    steps:
      - name: Deploy to Cloud
        run: ./deploy.sh
```
