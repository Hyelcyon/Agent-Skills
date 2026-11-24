#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

report_header() {
  printf '\n=== %s ===\n' "$1"
}

check_cpu_saturation() {
  report_header "CPU Utilization & Run Queue Saturation"
  uptime
  if command -v vmstat >/dev/null 2>&1; then
    vmstat 1 3
  fi
}

check_memory_pressure() {
  report_header "Memory Allocation & Pressure Stall (PSI)"
  free -h
  if [[ -f "/proc/pressure/memory" ]]; then
    printf 'PSI Memory Pressure:\n'
    cat /proc/pressure/memory
  fi
}

check_io_saturation() {
  report_header "Block Device I/O Saturation"
  if command -v iostat >/dev/null 2>&1; then
    iostat -xz 1 2
  else
    printf 'iostat not installed; inspecting /proc/diskstats\n'
    head -n 10 /proc/diskstats
  fi
}

check_socket_exhaustion() {
  report_header "Network Sockets & Connection States"
  if command -v ss >/dev/null 2>&1; then
    ss -s
    printf '\nListening Sockets:\n'
    ss -tulpn
  fi
}

main() {
  printf 'Linux Systems Performance Inspector (USE Method)\n'
  printf 'Host: %s | Kernel: %s\n' "$(hostname)" "$(uname -r)"

  check_cpu_saturation
  check_memory_pressure
  check_io_saturation
  check_socket_exhaustion

  printf '\nHealth inspection finished with exit code 0.\n'
}

main "$@"
