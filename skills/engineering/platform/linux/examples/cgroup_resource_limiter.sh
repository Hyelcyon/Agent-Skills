#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

readonly CGROUP_ROOT="/sys/fs/cgroup"
readonly SLICE_NAME="enterprise-worker.slice"
readonly TARGET_GROUP="${CGROUP_ROOT}/${SLICE_NAME}"

verify_cgroups_v2() {
  if [[ ! -f "${CGROUP_ROOT}/cgroup.controllers" ]]; then
    printf 'Error: Unified cgroups v2 hierarchy is not mounted at %s\n' "${CGROUP_ROOT}" >&2
    exit 1
  fi
}

configure_resource_limits() {
  local mem_bytes="$1"
  local cpu_max_quota="$2"

  printf 'Creating cgroup slice at %s\n' "${TARGET_GROUP}"
  mkdir -p "${TARGET_GROUP}"

  printf 'Setting memory.max to %s bytes\n' "${mem_bytes}"
  printf '%s\n' "${mem_bytes}" > "${TARGET_GROUP}/memory.max"

  printf 'Setting cpu.max to %s\n' "${cpu_max_quota}"
  printf '%s\n' "${cpu_max_quota}" > "${TARGET_GROUP}/cpu.max"
}

attach_pid() {
  local target_pid="$1"
  if [[ ! -d "/proc/${target_pid}" ]]; then
    printf 'Error: PID %s does not exist.\n' "${target_pid}" >&2
    exit 2
  fi

  printf 'Attaching PID %s to cgroup %s\n' "${target_pid}" "${TARGET_GROUP}"
  printf '%s\n' "${target_pid}" > "${TARGET_GROUP}/cgroup.procs"
  printf 'Successfully scoped PID %s into cgroup slice.\n' "${target_pid}"
}

main() {
  verify_cgroups_v2

  local memory_limit="${1:-2147483648}"
  local cpu_quota="${2:-200000 100000}"
  local pid="${3:-$$}"

  configure_resource_limits "${memory_limit}" "${cpu_quota}"
  attach_pid "${pid}"
}

main "$@"
