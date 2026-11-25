---
name: git
description: Use when committing changes, crafting atomic commits, writing conventional commit messages with imperative mood, rebasing branches, configuring .gitignore and untracking files, resolving merge conflicts, or bisecting regressions with git.
---

# Senior Git Workflow & Commit Standards

A comprehensive runbook for enterprise-grade Git hygiene, atomic commit architecture, Google-standard imperative commit messages, `.gitignore` governance, and surgical regression debugging.

## When to Use
- Writing commit messages following Google/Conventional Commit global standards.
- Enforcing atomic commits (one logical increment per commit).
- Setting up `.gitignore` patterns and purging tracked files from index cache.
- Curating local history using interactive rebase (`git rebase -i`) before code reviews.
- Resolving complex merge or rebase conflicts cleanly.
- Hunting down bugs across history using `git bisect`.

## When NOT to Use
- Determining release version bumps, PR templates, or CODEOWNERS (use `github`).
- Authoring CI/CD build or deployment pipelines (use `ci-cd`).

---

## 5-Phase Agent Operational Protocol

```text
Phase 1: Working Tree & Status Inspection (git status -s, git diff)
Phase 2: Staging Boundary Isolation (git add -p, atomic change scoping)
Phase 3: Imperative Commit Crafting (type(scope): summary in imperative mood)
Phase 4: History Hygiene & Linear Rebase (rebase on origin/main, fixup)
Phase 5: Push Verification (only on user request: --force-with-lease --force-if-includes)
```

### Phase 1: Working Tree & Status Inspection
Inspect repository state with `git status -s` and `git diff`. Verify branch topology and ensure unrelated local edits remain unstaged.

### Phase 2: Staging Boundary Isolation
Stage files atomically using `git add -p` or specific file paths. Separate refactoring, style updates, and functional changes into independent commits.

### Phase 3: Imperative Commit Crafting
Formulate commit messages completing the statement: *"If applied, this commit will..."*. Only create commits when explicitly requested by the user:
```text
feat(auth): add jwt token refresh handler
fix(db): prevent deadlocks during concurrent migrations
```

### Phase 4: History Hygiene & Linear Rebase
Rebase feature branches against `origin/main`. Squash intermediate fixup commits using `git rebase -i` to maintain a clean linear commit graph.

### Phase 5: Verification & Safe Propagation
Verify tests pass on the rebased HEAD commit. Push only when explicitly requested by the user; when updating rebased feature branches use `git push --force-with-lease --force-if-includes` so concurrent remote updates fetched in the background are not silently overwritten.

---

## Prohibited Anti-Patterns & Fatal Mistakes

- ❌ Running `git commit`, `git push`, `git reset --hard`, or `git checkout --` on shared/unrequested user work without explicit user authorization.
- ❌ Non-atomic commits combining unrelated features, fixes, and formatting.
- ❌ Non-imperative commit messages (e.g. `Fixed bug`, `Changes`, `WIP`).
- ❌ Force pushing with `--force` (or `--force-with-lease` without `--force-if-includes`) on shared branches.
- ❌ Leaving sensitive credential files or build artifacts in repository history.
- ❌ Staging entire directories with `git add .` without reviewing diffs (`git status -s` / `git diff`).

---

## References & Documentation
- Deep Operations & Reflog Runbook: [references/advanced-git-ops.md](./references/advanced-git-ops.md)
- Git Worktrees & Isolation: [references/git-worktrees-and-isolation.md](./references/git-worktrees-and-isolation.md)
- Interactive Rebase & Bisect: [references/interactive-rebase-and-bisect.md](./references/interactive-rebase-and-bisect.md)

## Resources & Examples
- Recommended Git Global Config: [resources/.gitconfig.recommended](./resources/.gitconfig.recommended)
- Recommended Enterprise .gitignore: [resources/.gitignore.recommended](./resources/.gitignore.recommended)
- Cross-Platform .gitattributes: [resources/.gitattributes.recommended](./resources/.gitattributes.recommended)
- Conventional Commit Example: [examples/sample_commit_message.txt](./examples/sample_commit_message.txt)
- Interactive Rebase Checklist: [examples/interactive_rebase_checklist.txt](./examples/interactive_rebase_checklist.txt)
- Worktree Feature Workflow: [examples/worktree_feature_workflow.sh](./examples/worktree_feature_workflow.sh)
