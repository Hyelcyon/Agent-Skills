# Example: Read-Only Forked PR Diff Review Skill

Demonstrates `context: fork`, `agent: Explore`, narrow read-only `allowed-tools`, and safe dynamic git inspection without polluting main session history.

```markdown
---
name: pr-review
description: Deep read-only pull request audit for correctness, concurrency hazards, security flaws, and missing tests. Use when reviewing branch diffs or staged changes.
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob, Bash(git status *), Bash(git diff *), Bash(git log *)
---

# Pull Request Engineering Audit

Inspect current repository state safely before forming conclusions:

- Working status: !`git status --short`
- Current branch: !`git branch --show-current`

## Audit Protocol
1. Inspect the full diff (`git diff main...HEAD`) and trace every changed callee and caller.
2. Flag concrete bugs only: race conditions, auth/input validation gaps, silent error swallowing, missing negative tests.
3. Exclude style nitpicks unless violating documented repository rules.
4. Cite exact file paths, line numbers, and reproducible verification steps for every finding.
```
