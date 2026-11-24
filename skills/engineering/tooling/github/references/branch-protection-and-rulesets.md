# GitHub Repository Rulesets and Branch Protection Architecture

Enterprise architecture guidelines for governing repository branches, enforcing multi-layered rulesets, defining bypass permissions, and securing production release lines.

## 1. Evolution from Classic Branch Protection to Rulesets

GitHub Rulesets provide granular, declarative governance across multiple branches, tags, and repositories without configuring each branch pattern individually.

### Key Advantages of Rulesets

- **Targeting**: Target branches by ref patterns (`refs/heads/main`, `refs/heads/release/*`) or evaluate dynamically across an organization.
- **Layered Evaluation**: Multiple rulesets can apply to the same branch simultaneously; the most restrictive rule always takes precedence.
- **Bypass Actors**: Exempt specific automated service accounts (such as release bots) from specific restrictions without giving them full repository admin rights.

---

## 2. Enterprise Production Ruleset Specification

For default branches (`main`, `master`), configure the following constraints:

### Pull Request Governance
- Require pull request before merging.
- Required approvals: Minimum 1 senior engineer approval.
- Dismiss stale pull request approvals when new commits are pushed.
- Require review from Code Owners matching modified file paths.
- Require all review conversations to be resolved before merge.

### Status Checks and Quality Gates
- Require status checks to pass before merging.
- Enforce strict branch state: branch must be up-to-date with `main` prior to merging.
- Required check jobs: lint, test matrix, security audit, container build.

### Commit and Push Protections
- Require linear history: merge commits prohibited; squash or rebase merges only.
- Require signed commits: commits must be cryptographically signed via GPG, SSH, or S/MIME.
- Block force pushes: prevents accidental history rewriting.
- Block branch deletions.

---

## 3. Managing Rulesets Programmatically via GitHub API

Rulesets can be managed as code via GitHub REST or GraphQL APIs to ensure consistent enforcement across thousands of organizational repositories:

```bash
gh api --method POST /repos/{owner}/{repo}/rulesets \
  -H "Accept: application/vnd.github+json" \
  -f name="production-protection" \
  -f target="branch" \
  -f enforcement="active" \
  -F "conditions[ref_name][include][]=refs/heads/main" \
  -F "rules[][type]=pull_request" \
  -F "rules[][type]=required_linear_history" \
  -F "rules[][type]=non_fast_forward"
```

Managing rulesets via API allows organizations to audit, version-control, and roll out compliance policies continuously.
