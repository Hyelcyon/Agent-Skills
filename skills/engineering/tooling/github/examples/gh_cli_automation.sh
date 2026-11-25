#!/usr/bin/env bash
set -euo pipefail

gh pr create \
  --title "feat(telemetry): integrate sliding window rate limiter" \
  --body-file .github/pull_request_template.md \
  --draft \
  --label "enhancement,backend" \
  --reviewer "enterprise/security-team"
