---
name: github
description: Use when managing software versioning strategies (SemVer guardrails, ZeroVer), creating Git tags and releases, authoring Pull Request templates, configuring CODEOWNERS, setting branch rulesets, or using the GitHub CLI (gh).
---

# Enterprise GitHub Engineering & Versioning Guardrails

Standard procedures and global best practices for repository governance, semantic versioning guardrails, release automation, PR templates, CODEOWNERS, and branch protection.

## When to Use
- Determining version bump severity (Major vs Minor vs Patch) with hallucination prevention guardrails.
- Managing initial development with ZeroVer (`0.y.z`) versus production SemVer (`1.0.0+`).
- Creating annotated Git release tags and publishing automated GitHub Releases.
- Setting up or auditing `.github/pull_request_template.md` or multi-template directories.
- Defining review routing and accountability rules in `.github/CODEOWNERS`.
- Configuring branch protection rulesets and merge queues.

## When NOT to Use
- Writing local git commit messages or rebasing branches (use `git`).
- Authoring CI/CD build or deployment pipelines (use `ci-cd`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: API Contract & Diff Boundary Analysis
Phase 2: Semantic Version Evaluation (Major vs Minor vs Patch threshold)
Phase 3: Repository Governance Setup (CODEOWNERS, PR templates, rulesets)
Phase 4: Release & Changelog Artifact Generation (gh release create)
Phase 5: Release Verification & Branch Protection Audit
```

### Phase 1: API Contract & Diff Analysis
Inspect git diffs between target branch and baseline. Check for modified public signatures, renamed exports, or altered response schemas to identify potential breaking changes.

### Phase 2: Semantic Version Evaluation
Apply strict SemVer guardrails:
- **Major (`X.0.0`)**: Public breaking changes, removed endpoints, or dropped runtime compatibility.
- **Minor (`x.Y.0`)**: Backward-compatible new capabilities or optional arguments.
- **Patch (`x.y.Z`)**: Internal bug fixes, refactoring, or performance improvements.
- **ZeroVer (`0.y.z`)**: Pre-1.0 projects increment minor (`0.Y.0`) for breaking changes until `1.0.0` stabilizes public contracts.
- **Pre-releases (`1.2.0-rc.1`)**: Use hyphenated pre-release identifiers for release candidates prior to final tagging.

### Phase 3: Repository Governance Setup
Enforce explicit accountability rules in `.github/CODEOWNERS`, configure PR templates (`.github/pull_request_template.md`), and pin all third-party GitHub Actions in `.github/workflows/` to immutable 40-character commit SHAs with version comments (`uses: actions/checkout@<sha> # v4.2.2`).

### Phase 4: Release & Changelog Generation
Create annotated tags and publish releases via `gh` only when explicitly authorized by the user (use `--draft` to stage notes for review before publishing):
```bash
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
gh release create v1.2.0 --verify-tag --generate-notes --draft
```

### Phase 5: Verification & Protection Proof
Verify branch rulesets mandate status checks, linear history, and required pull request reviews before merges.

---

## Prohibited Anti-Patterns & Fatal Mistakes

- ❌ Pushing tags, creating public repositories, merging PRs, or publishing GitHub releases without explicit user authorization.
- ❌ Referencing mutable GitHub Actions tags (`@v4`, `@main`) instead of pinned 40-character commit SHAs.
- ❌ Inflating version numbers (e.g. bumping Major for non-breaking internal refactors).
- ❌ Releasing lightweight Git tags instead of annotated tags (`git tag -a`).
- ❌ Leaving repository root without `CODEOWNERS` or default reviewers.
- ❌ Bypassing required status checks or merge queues on production branches.
- ❌ Publishing releases without verified release notes or changelogs.

---

## References & Documentation
- Branch Protection & Rulesets: [references/branch-protection-and-rulesets.md](./references/branch-protection-and-rulesets.md)
- GitHub CLI & Automation: [references/gh-cli-and-automation.md](./references/gh-cli-and-automation.md)
- GitHub Governance: [references/github-governance.md](./references/github-governance.md)

## Resources & Examples
- Standard PR Template: [resources/pull_request_template.md](./resources/pull_request_template.md)
- Recommended CODEOWNERS: [resources/CODEOWNERS](./resources/CODEOWNERS)
- Dependabot Configuration: [resources/dependabot.yml](./resources/dependabot.yml)
- GitHub CLI Automation: [examples/gh_cli_automation.sh](./examples/gh_cli_automation.sh)
- Bug Report Template: [examples/issue_bug_report.md](./examples/issue_bug_report.md)
- Production PR Body: [examples/sample_pr_body.md](./examples/sample_pr_body.md)
