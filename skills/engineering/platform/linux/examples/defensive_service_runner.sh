#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_NAME="$(basename -- "$0")"
readonly SCRIPT_NAME
LOCK_DIR="${XDG_RUNTIME_DIR:-/tmp}"
readonly LOCK_FILE="${LOCK_DIR}/${SCRIPT_NAME}.lock"
readonly LOG_FILE="${LOCK_DIR}/${SCRIPT_NAME}.log"

log() {
  local level="$1"
  shift
  printf '[%s] [%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "${level}" "$*" | tee -a "${LOG_FILE}" >&2
}

cleanup() {
  local exit_code=$?
  log "INFO" "Finalizing runtime execution (exit code: ${exit_code})"
  # Keep the flock file intact so concurrent invocations lock the same inode
  exit "${exit_code}"
}

trap cleanup EXIT INT TERM

acquire_lock() {
  exec 200>"${LOCK_FILE}"
  if ! flock -n 200; then
    log "ERROR" "Process is already running under lock ${LOCK_FILE}."
    exit 1
  fi
}

main() {
  acquire_lock
  log "INFO" "Lock acquired. Executing service unit..."

  local target_dir="${1:-/tmp}"
  if [[ ! -d "${target_dir}" ]]; then
    log "ERROR" "Target directory '${target_dir}' does not exist."
    exit 2
  fi

  declare -a monitored_files=()
  while IFS= read -r -d '' file; do
    monitored_files+=("${file}")
  done < <(find "${target_dir}" -maxdepth 1 -type f -print0)

  log "INFO" "Discovered ${#monitored_files[@]} files in ${target_dir}."
  log "INFO" "Service run completed successfully."
}

main "$@"
