set -euo pipefail

BRANCH_NAME="feat/telemetry"
TARGET_DIR="../feat-telemetry"
BASE_REF="origin/main"

git fetch origin main --prune

if [ -d "$TARGET_DIR" ]; then
    git worktree remove --force "$TARGET_DIR"
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
