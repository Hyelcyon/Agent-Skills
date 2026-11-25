# Advanced Deployment & Artifact Promotion Patterns

Reference guide for containerized builds, GitOps pipelines, and immutable artifact promotion.

---

## 1. "Build Once, Promote Everywhere" Principle

Never rebuild Docker images or application bundles across staging and production environments. Rebuilding introduces non-deterministic dependency shifts.

```text
[Build Step] ──► Build Image ──► Push image:commit-<SHA> (@sha256:<DIGEST>)
                                                  │
           ┌──────────────────────────────────────┴──────────────────────────────────────┐
           ▼                                                                             ▼
[Deploy to Staging]                                                           [Deploy to Production]
Pull: image@sha256:<DIGEST>                                                   Pull EXACT SAME @sha256:<DIGEST>
Inject: STAGING_CONFIG                                                        Inject: PROD_CONFIG
```

---

## 2. GitHub Environments & Deployment Gates

Configure environment protection rules in repository settings under **Settings → Environments**:

1. **Required Reviewers**: Protect `production` environment with mandatory team sign-offs.
2. **Deployment Branches**: Restrict production deployment to `main` branch only.
3. **Wait Timer**: Optional cooldown timer to catch early regressions.

```yaml
permissions:
  contents: read

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    environment:
      name: production
      url: https://api.myproject.com
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - name: Deploy to Cloud
        run: ./deploy.sh
```
