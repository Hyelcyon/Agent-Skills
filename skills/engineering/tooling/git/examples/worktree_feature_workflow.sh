#!/usr/bin/env bash
set -euo pipefail

BRANCH_NAME="feat/telemetry"
TARGET_DIR="../feat-telemetry"
BASE_REF="origin/main"

git fetch origin main --prune

if [ -d "$TARGET_DIR" ]; then
    echo "Worktree directory already exists: $TARGET_DIR" >&2
    exit 1
fi

git worktree add -b "$BRANCH_NAME" "$TARGET_DIR" "$BASE_REF"

(
    cd "$TARGET_DIR"
    pnpm install --frozen-lockfile
    pnpm run lint
    pnpm run test
)

git worktree list
git worktree remove "$TARGET_DIR"
git worktree prune
