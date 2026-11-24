# GitHub Actions Security, OIDC Federation, and Supply Chain Architecture

Guidelines for hardening GitHub Actions CI/CD pipelines, eliminating static cloud credentials via OpenID Connect (OIDC), pinning dependencies, and preventing expression injection.

## 1. Zero Static Secrets via OpenID Connect (OIDC)

Static long-lived cloud credentials (such as AWS access key pairs or Google Cloud service account JSON keys) stored in repository secrets pose severe security risks if leaked. Modern CI/CD pipelines must authenticate to cloud providers via OIDC federation.

### AWS OIDC Federation Configuration

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - name: Checkout Repository
        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683

      - name: Configure AWS Credentials via OIDC
        uses: aws-actions/configure-aws-credentials@e3ddf14a3dc1a892e2fb21f66fd8273dca71cadd
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-production-deploy
          aws-region: us-east-1
          audience: sts.amazonaws.com
```

The GitHub Actions runner requests a short-lived JSON Web Token signed by GitHub and exchanges it for temporary STS credentials valid only for the duration of the deployment step.

---

## 2. Principle of Least Privilege: Permissions Hardening

Workflows should declare read-only permissions at the root level and grant write scopes only inside specific jobs:

```yaml
permissions:
  contents: read

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
```

Explicitly setting top-level `permissions: contents: read` prevents compromised third-party actions from abusing default repository write tokens to tamper with code, push releases, or modify pull requests.

---

## 3. Supply Chain Integrity: Action Pinning

Tag references like `@v4` or `@main` can be modified or hijacked upstream if a developer account or repository is compromised. Production pipelines must pin all external actions to full 40-character commit SHAs:

```yaml
steps:
  - name: Checkout Code
    uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
  - name: Setup Node
    uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af
    with:
      node-version: 22
```

Use automated tools such as Dependabot or Renovate to test and update pinned commit hashes periodically.

---

## 4. Preventing Script and Expression Injection

Never interpolate untrusted context values directly into shell scripts (`run: echo "${{ github.event.issue.title }}"`). Attackers can craft malicious titles containing backticks or shell operators to execute arbitrary commands inside the runner.

### Vulnerable Expression (Prohibited)

Direct evaluation of external strings in bash strings allows remote command injection.

### Hardened Architecture: Environment Variable Handover

Pass external values through environment variables, which the shell treats strictly as data:

```yaml
steps:
  - name: Process Issue Context Safely
    env:
      ISSUE_TITLE: ${{ github.event.issue.title }}
      AUTHOR_NAME: ${{ github.actor }}
    run: |
      printf 'Processing issue from %s: %s\n' "$AUTHOR_NAME" "$ISSUE_TITLE"
```
