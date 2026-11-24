#!/usr/bin/env bash
set -euo pipefail

RULES_FILE="${1:-resources/prometheus-alerts.rules.yaml}"
TESTS_FILE="${2:-resources/promtool.tests.yaml}"

echo "=== Commencing Prometheus Alerting Rules Audit ==="

if ! command -v promtool >/dev/null 2>&1; then
  echo "Error: promtool executable not found in PATH." >&2
  exit 1
fi

echo "Step 1: Checking PromQL syntax and rule structures..."
promtool check rules "$RULES_FILE"

echo "Step 2: Executing unit test assertions..."
promtool test rules "$TESTS_FILE"

echo "[PASS] All Prometheus alerting rules and test suites validated cleanly."
exit 0
