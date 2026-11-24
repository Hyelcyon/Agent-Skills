set -e

HOST="127.0.0.1"
PORT="${PORT:-3000}"
ENDPOINT="${HEALTH_ENDPOINT:-/healthz}"
TIMEOUT=3
MAX_RETRIES=3

attempt=1
until [ "$attempt" -gt "$MAX_RETRIES" ]; do
    response=$(curl --fail --silent --show-error --max-time "$TIMEOUT" "http://${HOST}:${PORT}${ENDPOINT}" 2>&1)
    status=$?
    if [ $status -eq 0 ]; then
        exit 0
    fi
    attempt=$((attempt + 1))
    sleep 1
done

exit 1
