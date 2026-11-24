#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-order-processing}"
DEPLOYMENT="${2:-order-api}"
TARGET_IMAGE="${3:-}"
TIMEOUT_SECONDS="${4:-180}"

if [[ -z "$TARGET_IMAGE" ]]; then
  echo "Usage: $0 <namespace> <deployment> <image:tag> [timeout_seconds]" >&2
  exit 1
fi

echo "=== Commencing Progressive Rollout for $DEPLOYMENT in $NAMESPACE ==="
echo "Target Image: $TARGET_IMAGE"

INITIAL_REVISION=$(kubectl rollout history "deployment/$DEPLOYMENT" -n "$NAMESPACE" | tail -n 1 | awk '{print $1}')
echo "Baseline Deployment Revision: $INITIAL_REVISION"

echo "Applying image update..."
kubectl set image "deployment/$DEPLOYMENT" "order-api=$TARGET_IMAGE" -n "$NAMESPACE" --record=false

echo "Monitoring rollout progress..."
if ! kubectl rollout status "deployment/$DEPLOYMENT" -n "$NAMESPACE" --timeout="${TIMEOUT_SECONDS}s"; then
  echo "Rollout failed or timed out. Initiating automated safety rollback..." >&2
  kubectl rollout undo "deployment/$DEPLOYMENT" -n "$NAMESPACE"
  kubectl rollout status "deployment/$DEPLOYMENT" -n "$NAMESPACE" --timeout=60s
  echo "Rollback completed. Inspecting pod crash logs..." >&2
  kubectl get pods -n "$NAMESPACE" -l "app.kubernetes.io/name=$DEPLOYMENT" -o wide
  exit 1
fi

echo "Verifying endpoint health and zero restart status..."
FAILED_PODS=0
while read -r pod_name restarts ready; do
  if [[ "$ready" != "True" || "$restarts" -gt 0 ]]; then
    echo "Warning: Pod $pod_name has $restarts restarts or ready=$ready" >&2
    ((FAILED_PODS++))
  fi
done < <(kubectl get pods -n "$NAMESPACE" -l "app.kubernetes.io/name=$DEPLOYMENT" \
  -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.status.containerStatuses[0].restartCount}{" "}{.status.containerStatuses[0].ready}{"\n"}{end}')

if [[ "$FAILED_PODS" -gt 0 ]]; then
  echo "Validation detected $FAILED_PODS unstable pods after rollout." >&2
  exit 1
fi

NEW_REVISION=$(kubectl rollout history "deployment/$DEPLOYMENT" -n "$NAMESPACE" | tail -n 1 | awk '{print $1}')
echo "Rollout succeeded cleanly. Active Revision: $NEW_REVISION"
exit 0
