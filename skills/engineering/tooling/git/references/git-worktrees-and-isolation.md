# Git Worktrees and Isolated Multi-Branch Development Architecture

Operational guidelines for using Git worktrees to develop parallel features, run test suites concurrently, and isolate agent environments without cloning redundant repositories.

## 1. Why Git Worktrees Over Redundant Clones

Cloning an entire repository multiple times wastes gigabytes of disk space, duplicates `.git` packfiles, and requires separate authentication and remote tracking setups.

Git Worktrees allow a single underlying repository (`.git` object database) to check out and work on multiple independent branches simultaneously in separate filesystem directories.

### Creating a Worktree

```bash
git worktree add ../feature-auth -b feature/user-auth
git worktree add ../hotfix-payment hotfix/stripe-webhook
```

The new directory `../feature-auth` contains a full checked-out working tree for `feature/user-auth`, while the primary repository directory remains on `main`.

---

## 2. Managing and Inspecting Worktree State

Inspect all active working trees attached to the repository:

```bash
git worktree list
```

The output displays the path, current commit SHA, and checked-out branch for each working tree.

### Removing and Pruning Worktrees

When work on a feature branch is merged:

```bash
git worktree remove ../feature-auth
git worktree prune
```

`git worktree prune` cleans up internal administrative metadata files in `.git/worktrees` for any linked working tree directories that were deleted manually.

---

## 3. Best Practices for Automated Agents and CI

1. **Dedicated Worktree Directory Structure**: Place parallel worktrees in a sibling directory (e.g. `../worktrees/<branch-name>`) to prevent accidentally nesting one working tree inside another.
2. **Locking Active Worktrees**: If a worktree is stored on a shared or network volume, prevent accidental pruning using `git worktree lock <path> --reason "Active CI runner"`.
3. **Detached HEAD for Ephemeral Verification**: To run automated test builds on a specific commit without creating a local branch:
   ```bash
   git worktree add --detach ../test-runner 7f9a12c
   ```
