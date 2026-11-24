#!/usr/bin/env bash
set -euo pipefail

PLAN_DIR="${1:-.}"
TARGET_ENV="${2:-production}"

cd "$PLAN_DIR"

echo "=== Commencing Terraform State Drift Detection for [$TARGET_ENV] ==="

if [[ ! -d ".terraform" ]]; then
  echo "Terraform not initialized. Running terraform init..."
  terraform init -backend=true -input=false
fi

echo "Refreshing cloud state and calculating drift..."

# -detailed-exitcode:
# 0 = Succeeded with empty diff (no changes)
# 1 = Error
# 2 = Succeeded with non-empty diff (changes present)
set +e
terraform plan -detailed-exitcode -no-color -input=false > drift_plan.log 2>&1
EXIT_CODE=$?
set -e

if [[ $EXIT_CODE -eq 0 ]]; then
  echo "[OK] No infrastructure drift detected. State is synchronized."
  rm -f drift_plan.log
  exit 0
elif [[ $EXIT_CODE -eq 2 ]]; then
  echo "[WARNING] Infrastructure drift detected!" >&2
  echo "--- Drift Plan Summary ---" >&2
  grep -E "(Plan:|#|~|\+|\-)" drift_plan.log | head -n 30 >&2
  rm -f drift_plan.log
  exit 2
else
  echo "[ERROR] Terraform plan failed with execution error:" >&2
  cat drift_plan.log >&2
  rm -f drift_plan.log
  exit 1
fi
