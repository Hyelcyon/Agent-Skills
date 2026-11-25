# GitHub Governance & Release Engineering

Detailed reference for setting up repository standards, release automation, automated changelogs, and organizational security.

---

## 1. Automated Semantic Release & Changelogs

To eliminate manual release toil, connect Conventional Commits to automated release tooling (`semantic-release`, `Release-Please`, or `Changesets`).

### Release Pipeline Flow
1. Analyzes commits merged into `main` since the last tag.
2. Computes the next version bump (`MAJOR`, `MINOR`, or `PATCH`).
3. Generates or updates `CHANGELOG.md` with categorized sections.
4. Creates an annotated Git tag and publishes a GitHub Release.

```yaml
name: Release
on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          persist-credentials: false
      - uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Supply-Chain Hardening: Immutable Commit SHA Pinning
Always pin every `uses:` action reference in `.github/workflows/` to a full 40-character commit SHA paired with an inline `# vX.Y.Z` tag comment. Mutable version tags (`@v4`, `@main`) can be moved if an upstream maintainer account or action repository is compromised, whereas commit SHAs guarantee deterministic workflow execution.

---

## 2. Issue Form Schemas (`.github/ISSUE_TEMPLATE/`)

Standardize bug reporting and feature requests using GitHub Form Schemas (`.yml`):

```yaml
name: "Bug Report"
description: "File a reproducible bug report"
title: "[Bug]: "
labels: ["triage", "bug"]
body:
  - type: markdown
    attributes:
      value: "Thank you for reporting an issue! Please be as detailed as possible."
  - type: textarea
    id: reproduction
    attributes:
      label: Reproduction Steps
      description: How can we reliably reproduce this?
      placeholder: 1. Go to '...' 2. Click '...'
    validations:
      required: true
```

---

## 3. Merge Queues (High-Velocity Repositories)

When multiple PRs merge concurrently into `main`, enable GitHub **Merge Queues**:
- Automatically creates temporary speculative branches merging PRs with the latest `main`.
- Runs CI tests against the true integrated state before merging.
- Prevents the classic *"it passed on my branch but broke main"* incident.
