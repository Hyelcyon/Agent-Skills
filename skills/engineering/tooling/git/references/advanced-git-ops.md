# Advanced Git Operations & Recovery Runbook

This document details low-level Git plumbing, incident recovery techniques, `.gitignore` architecture, and team branching hygiene for senior engineers.

---

## 1. Safety Net: The `git reflog`

If you accidentally delete a branch, run a destructive reset (`git reset --hard`), or make an erroneous rebase, Git records every reference update in the reflog:

```bash
git reflog
git checkout -b recovery-branch HEAD@{1}
```

---

## 2. Advanced Interactive Staging (`git add -p`)

Never commit unrelated changes together. Use interactive hunk staging:

- `y`: Stage this hunk.
- `n`: Do not stage this hunk.
- `s`: Split hunk into smaller sub-hunks.
- `e`: Manually edit the hunk before staging.
- `q`: Quit interactive staging.

---

## 3. Worktree Management (Parallel Task Execution)

Instead of stashing or cloning separate repositories for urgent hotfixes:

```bash
git worktree add ../project-hotfix main
cd ../project-hotfix

cd ../main-repo
git worktree remove ../project-hotfix
```

---

## 4. Safe Force-Pushing: `--force-with-lease`

Never use bare `git push -f` or `--force`. Bare force-pushes overwrite remote commits even if a teammate pushed work while you were rebasing:

```bash
git push --force-with-lease origin <branch-name>
```

---

## 5. `.gitignore` Precedence & Index Cache Refresh

### Ignore Precedence Hierarchy
Git resolves ignore rules in the following order of precedence (highest to lowest):
1. Command-line patterns passed via `--exclude`.
2. `.gitignore` located in the same directory as the target file.
3. `.gitignore` in parent directories up to the repository root.
4. `.git/info/exclude` (local private rules unshared with team).
5. Global excludes file configured in `core.excludesFile` (e.g. `~/.gitignore_global` for OS `.DS_Store` or personal editor preferences).

### Untracking Already Committed Files
Adding a rule to `.gitignore` does not untrack files that were already committed to the index. To purge tracked files that match new ignore rules without deleting them from the filesystem:

```bash
git rm -r --cached .
git add .
git commit -m "chore(git): re-apply .gitignore to index"
```

### Negative Patterns & Directory Exceptions
To ignore a directory but preserve a specific nested file, the parent directory itself must NOT be excluded with a trailing slash rule, or the exclusion must allow folder traversal:

```text
logs/*
!logs/.gitkeep
```
