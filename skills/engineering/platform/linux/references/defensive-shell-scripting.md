# Defensive Shell Scripting Architecture

A senior systems engineering guide to writing robust, maintainable, and deterministic Bash automation scripts based on the **Google Shell Style Guide** and enterprise production standards.

---

## 1. The Defensive Preamble

Every production shell script must begin with the standard defensive header:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

### Explanation of Flags:
- **`set -e`**: Exit immediately if any command exits with a non-zero status. Prevents silent partial failures.
- **`set -u`**: Treat unset or uninitialized variables as errors and exit immediately. Prevents bugs like `rm -rf "$UNSET_VAR/*"` wiping root.
- **`set -o pipefail`**: The return value of a pipeline is the status of the last command to exit with a non-zero status, or zero if all commands exit successfully. By default, `false | true` returns `0`; with `pipefail`, it returns `1`.
- **`IFS=$'\n\t'`**: Internal Field Separator. Setting IFS to newline and tab prevents word splitting on spaces within filenames.

---

## 2. Signal Traps & Cleanup Invariants

Always register deterministic cleanup handlers for temporary files, sockets, and lockfiles using `trap`:

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRATCH_DIR=$(mktemp -d "/tmp/app_worker.XXXXXX")
readonly SCRATCH_DIR

cleanup() {
  local exit_code=$?
  if [[ -d "${SCRATCH_DIR}" ]]; then
    rm -rf "${SCRATCH_DIR}"
  fi
  exit "${exit_code}"
}

trap cleanup EXIT INT TERM
```

### Process Mutual Exclusion via `flock`:
To guarantee that only one instance of a background script or cron job runs at any time, acquire an exclusive non-blocking file descriptor lock:

```bash
LOCK_FILE="/var/run/worker.lock"
exec 200>"${LOCK_FILE}"

if ! flock -n 200; then
  echo "Error: Another instance of this worker is already executing." >&2
  exit 1
fi
```

---

## 3. Strict Quoting & Parameter Expansion

- **Always Quote Variables**: Never write `$var`. Always write `"${var}"` when passing arguments.
- **Default Fallbacks**: Use `${var:-default}` when a variable may be optional.
- **Required Variable Assertion**: Use `${var:?Error: var must be set}` to fail with an explicit message if a parameter is empty:
  ```bash
  DATABASE_URL="${DATABASE_URL:?Database connection string must be defined}"
  ```

---

## 4. Arrays over String Concatenation

Never concatenate arguments into a single string to execute via `eval`. Always use indexed arrays:

```bash
# ❌ FRAGILE: Vulnerable to argument splitting and spaces in filenames
ARGS="-v -f path with spaces/file.txt"
run_command $ARGS

# ✅ ROBUST: Array preserves element boundaries
declare -a CMD_ARGS=(
  "--verbose"
  "--config" "config/production.json"
  "--input" "path with spaces/file.txt"
)

exec /opt/app/bin/worker "${CMD_ARGS[@]}"
```
