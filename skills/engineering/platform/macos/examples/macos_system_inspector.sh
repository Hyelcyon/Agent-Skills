#!/usr/bin/env bash
set -euo pipefail

header() {
  printf '\n=== %s ===\n' "$1"
}

check_platform_architecture() {
  header "macOS Darwin Architecture & Kernel"
  printf 'macOS Version: %s\n' "$(sw_vers -productVersion)"
  printf 'Build Version: %s\n' "$(sw_vers -buildVersion)"
  printf 'Kernel Arch:   %s\n' "$(uname -m)"
  printf 'Kernel Info:   %s\n' "$(uname -v)"
}

check_memory_pressure() {
  header "macOS Memory Pressure & Compression"
  if command -v memory_pressure >/dev/null 2>&1; then
    memory_pressure
  else
    vm_stat
  fi
}

check_thermal_and_power() {
  header "Thermal Throttling & Power Management"
  if command -v pmset >/dev/null 2>&1; then
    pmset -g therm
    printf '\nActive Power Assertions:\n'
    pmset -g assertions | head -n 15
  fi
}

check_security_status() {
  header "macOS Security & SIP Status"
  if command -v csrutil >/dev/null 2>&1; then
    csrutil status
  fi
}

main() {
  printf 'macOS Darwin Platform Health Inspector\n'
  check_platform_architecture
  check_memory_pressure
  check_thermal_and_power
  check_security_status
  printf '\nPlatform inspection completed.\n'
}

main "$@"
