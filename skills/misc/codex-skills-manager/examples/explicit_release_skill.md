# Example: Explicit Release Skill for Codex (`$release-gatekeeper`)

Demonstrates a clean open-standard `SKILL.md` paired with `agents/openai.yaml` (`allow_implicit_invocation: false`) so destructive tag/release actions require explicit `$release-gatekeeper` invocation.

```markdown
---
name: release-gatekeeper
description: Verify clean working tree, changelog parity, full test pass, and tag format prior to cutting a release. Explicitly invoke via $release-gatekeeper.
---

# Release Gatekeeper

## Fatal Mistakes Never to Make
- Never run git tag or push without explicit user authorization in the current session.
- Never proceed if working tree has uncommitted changes or any test fails.

## Verification Steps
1. Verify git status is clean and target branch matches expected release branch.
2. Execute the full build, type-check, and unit test suite with zero skipped failures.
3. Display the exact SemVer bump, commit SHA, and dry-run summary for user confirmation.
```
