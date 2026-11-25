#!/bin/sh
set -eu

if ! command -v curl >/dev/null 2>&1; then
    printf 'Error: curl is required for container healthcheck.\n' >&2
    exit 1
fi

HOST="127.0.0.1"
PORT="${PORT:-3000}"
ENDPOINT="${HEALTH_ENDPOINT:-/healthz}"
TIMEOUT=3
MAX_RETRIES=3

attempt=1
while [ "$attempt" -le "$MAX_RETRIES" ]; do
    # Evaluate curl inside `if` so `set -e` does not abort before exhausting retries
    if curl --fail --silent --show-error --max-time "$TIMEOUT" "http://${HOST}:${PORT}${ENDPOINT}" >/dev/null; then
        exit 0
    fi
    attempt=$((attempt + 1))
    sleep 1
done

exit 1
