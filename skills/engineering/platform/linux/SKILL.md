---
name: linux
description: Use when authoring defensive Bash scripts, configuring systemd services, tuning Linux kernel parameters (sysctl), managing cgroups v2 resource limits, or diagnosing system performance with ss, iostat, and eBPF.
---

# Enterprise Linux Systems & Shell Engineering

Senior systems engineering standards and operational runbooks for Linux environments: defensive Bash programming (Google Shell Style Guide), hardened `systemd` service architectures, `cgroups` v2 resource governance, kernel tuning (`sysctl`), and Brendan Gregg's USE performance diagnostics.

## When to Use
- Authoring production shell automation scripts with strict error handling (`set -euo pipefail`).
- Designing hardened `systemd` unit files with security sandboxing (`ProtectSystem`, `NoNewPrivileges`).
- Enforcing CPU, memory, and I/O quotas via Linux Control Groups (`cgroups` v2).
- Tuning kernel network buffers, file descriptor ceilings, and virtual memory behavior via `sysctl`.
- Diagnosing CPU saturation, disk I/O bottlenecks, and network socket exhaustion (`ss`, `vmstat`, `iostat`).
- Tracing kernel and user-space latency using eBPF tools (`bpftrace`, `bcc`).

## When NOT to Use
- Managing Windows PowerShell scripts or Win32 APIs (use `windows`).
- Configuring macOS Darwin daemons or launchd property lists (use `macos`).
- Managing containerized Docker daemon layers directly (use `docker`).

---

## 1. 5-Phase Agent Operational Protocol

```
[Phase 1: Environment Profiling] ──> [Phase 2: Sandboxing & ACLs] ──> [Phase 3: Defensive Automation] ──> [Phase 4: Resource Quotas] ──> [Phase 5: Diagnostics Gate]
   Inspect kernel, OS, cgroups v2      Define service sandbox limits       Implement set -euo pipefail        Configure cgroups & sysctl        Audit with shellcheck & USE
```

### Phase 1: Environment & Kernel Profiling
1. Identify the active Linux distribution, kernel release (`uname -r`), and init system (`systemd --version`).
2. Verify cgroups version: check `/sys/fs/cgroup/cgroup.controllers` to confirm cgroups v2 unified hierarchy.
3. Inspect available file descriptors (`ulimit -n`) and memory pressure (`/proc/pressure/memory`).

### Phase 2: Security & Sandboxing Boundaries
1. Run services under dedicated non-root service accounts (`DynamicUser=yes` or `User=appuser`).
2. Lock down filesystem access in systemd unit definitions:
   - `ProtectSystem=strict` (mounts `/usr`, `/boot`, `/etc` as read-only).
   - `ProtectHome=yes` (hides `/home`, `/root`).
   - `PrivateTmp=yes` (allocates an isolated `/tmp` namespace).
   - `NoNewPrivileges=yes` (prevents privilege escalation via setuid binaries).

### Phase 3: Defensive Shell Scripting Standard
1. Every production shell script must start with the defensive preamble:
   ```bash
   #!/usr/bin/env bash
   set -euo pipefail
   IFS=$'\n\t'
   ```
2. Trap signals deterministically: handle `EXIT`, `ERR`, and `INT` to remove temporary scratch files cleanly, **without unlinking active `flock` lockfiles** (deleting an open `flock` file lets concurrent invocations create a second inode and bypass mutual exclusion).
3. Always quote parameter expansions (`"$var"`) to prevent word splitting and globbing hazards, and assign command substitutions before marking `readonly` (`val=$(cmd); readonly val`) so `set -e` captures subcommand failures.

### Phase 4: Resource Governance & Kernel Tuning
1. Bound process memory and CPU consumption via systemd or cgroups v2:
   - `MemoryMax=2G`
   - `CPUQuota=200%` (allocates at most 2 CPU cores).
2. Apply high-throughput kernel network parameters (`net.core.somaxconn`, `net.ipv4.tcp_max_syn_backlog`) in `/etc/sysctl.d/99-server.conf`.

### Phase 5: Verification & Performance Audit
1. Lint shell scripts with ShellCheck:
   ```bash
   shellcheck -x script.sh
   ```
2. Audit system health following the USE method (Utilization, Saturation, Errors):
   - CPU: `vmstat 1 5`
   - Disk I/O: `iostat -xz 1 5`
   - Sockets: `ss -s` and `ss -tulpn`

---

## 2. Prohibited Anti-Patterns

- ❌ Omitting `set -euo pipefail` in non-trivial shell automation.
- ❌ Using unquoted variables (`$var`) in shell command arguments.
- ❌ Parsing `ls` output in scripts (use glob arrays: `for f in *.txt; do ... done`).
- ❌ Running background service daemons directly as root without sandboxing directives.
- ❌ Using `kill -9` (`SIGKILL`) as the default process termination (prevents clean shutdown handlers; use `SIGTERM`).
- ❌ Writing arbitrary sleeps in loops instead of event-driven polling (`inotifywait`, systemd socket activation).

---

## 3. References & Documentation
- Defensive Shell Scripting Architecture: [references/defensive-shell-scripting.md](./references/defensive-shell-scripting.md)
- Systemd Service & Cgroups v2 Hardening: [references/systemd-service-and-cgroups.md](./references/systemd-service-and-cgroups.md)
- Systems Performance & Diagnostics Guide: [references/system-performance-and-diagnostics.md](./references/system-performance-and-diagnostics.md)

## 4. Resources & Examples
- Hardened Systemd Service Template: [resources/systemd.service.template](./resources/systemd.service.template)
- High-Throughput Sysctl Configuration: [resources/sysctl.hardened.conf](./resources/sysctl.hardened.conf)
- Strict ShellCheck Configuration: [resources/.shellcheckrc](./resources/.shellcheckrc)
- Defensive Service Runner Script: [examples/defensive_service_runner.sh](./examples/defensive_service_runner.sh)
- System Health USE Inspector: [examples/system_health_inspector.sh](./examples/system_health_inspector.sh)
- Cgroup v2 Resource Limiter: [examples/cgroup_resource_limiter.sh](./examples/cgroup_resource_limiter.sh)
