#!/usr/bin/env bash
set -euo pipefail

TARGET_HOST="${1:-127.0.0.1}"
TARGET_PORT="${2:-50051}"
SERVICE_NAME="${3:-order.v1.OrderService}"

echo "=== Probing gRPC Service Health for [$SERVICE_NAME] on $TARGET_HOST:$TARGET_PORT ==="

if command -v grpc-health-probe >/dev/null 2>&1; then
  if grpc-health-probe -addr="$TARGET_HOST:$TARGET_PORT" -service="$SERVICE_NAME"; then
    echo "[PASS] gRPC health probe confirmed SERVING status."
    exit 0
  else
    echo "[FAIL] Service is NOT_SERVING or unreachable." >&2
    exit 1
  fi
elif command -v grpcurl >/dev/null 2>&1; then
  RESPONSE=$(grpcurl -plaintext -d "{\"service\": \"$SERVICE_NAME\"}" "$TARGET_HOST:$TARGET_PORT" grpc.health.v1.Health/Check)
  if echo "$RESPONSE" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"SERVING"'; then
    echo "[PASS] grpcurl confirmed SERVING status."
    exit 0
  else
    echo "[FAIL] grpcurl check failed: $RESPONSE" >&2
    exit 1
  fi
else
  echo "Error: Neither grpc-health-probe nor grpcurl is installed." >&2
  exit 1
fi
