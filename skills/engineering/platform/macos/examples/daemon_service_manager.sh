#!/usr/bin/env bash
set -euo pipefail

readonly SERVICE_LABEL="com.enterprise.service"
readonly DOMAIN_TARGET="system"
readonly PLIST_SOURCE="${1:-/Library/LaunchDaemons/${SERVICE_LABEL}.plist}"

assert_root() {
  if [[ "$(id -u)" -ne 0 ]]; then
    printf 'Error: Root privileges required to bootstrap system LaunchDaemons.\n' >&2
    exit 1
  fi
}

service_bootstrap() {
  if [[ ! -f "${PLIST_SOURCE}" ]]; then
    printf 'Error: Plist definition not found at %s\n' "${PLIST_SOURCE}" >&2
    exit 2
  fi

  printf 'Booting out existing service instance if registered...\n'
  launchctl bootout "${DOMAIN_TARGET}/${SERVICE_LABEL}" 2>/dev/null || true

  printf 'Bootstrapping service from %s...\n' "${PLIST_SOURCE}"
  launchctl bootstrap "${DOMAIN_TARGET}" "${PLIST_SOURCE}"

  printf 'Kickstarting service with kill restart...\n'
  launchctl kickstart -k "${DOMAIN_TARGET}/${SERVICE_LABEL}"
}

service_inspect() {
  printf 'Inspecting live service state for %s:\n' "${SERVICE_LABEL}"
  launchctl print "${DOMAIN_TARGET}/${SERVICE_LABEL}"
}

main() {
  assert_root
  service_bootstrap
  service_inspect
  printf '\nService bootstrap cycle completed successfully.\n'
}

main "$@"
