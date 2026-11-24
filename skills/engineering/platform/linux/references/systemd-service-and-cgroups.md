# Systemd Service Hardening & Cgroups v2 Architecture

A senior guide to architecting secure Linux service units under `systemd` and controlling resource consumption via unified Control Groups (`cgroups` v2).

---

## 1. Principles of Hardened Systemd Services

1. **Principle of Least Privilege**:
   - Daemons must never run as `root` unless explicitly binding to privileged low ports (<1024) or managing kernel modules.
   - Use `DynamicUser=yes` for transient, unprivileged microservices or `User=svc_app` for persistent services.
2. **Filesystem Sandbox Isolation**:
   - Limit the service's view of the filesystem to only what it strictly needs to read and write.
3. **Capabilities & Privilege Escalation Lockdown**:
   - Strip all Linux capabilities by default (`CapabilityBoundingSet=`) and grant only minimal necessary capabilities (e.g. `CAP_NET_BIND_SERVICE`).
   - Forbid obtaining new privileges via `NoNewPrivileges=yes`.

---

## 2. Security Directives Reference

| Directive | Recommended Value | Security Impact |
| :--- | :--- | :--- |
| `ProtectSystem` | `strict` | Mounts `/usr`, `/boot`, `/etc` as read-only for the service process. |
| `ProtectHome` | `yes` | Hides `/home`, `/root`, and `/run/user` from the service. |
| `PrivateTmp` | `yes` | Allocates a dedicated `/tmp` and `/var/tmp` directory isolated from other processes. |
| `ProtectKernelTunables` | `yes` | Denies modification of `/proc/sys`, `/sys`, `/proc/sysrq-trigger`. |
| `ProtectControlGroups` | `yes` | Mounts `/sys/fs/cgroup` as read-only. |
| `RestrictAddressFamilies` | `AF_UNIX AF_INET AF_INET6` | Restricts socket types, blocking raw packet creation or uncommon protocols. |
| `LockPersonality` | `yes` | Prevents changing execution domain or emulating other architectures. |
| `MemoryDenyWriteExecute` | `yes` | Prevents creating executable memory mappings (mitigates JIT code injection). |

---

## 3. Cgroups v2 Resource Governance

In modern Linux distributions (Fedora, Debian 11+, Ubuntu 22.04+, RHEL 9+), cgroups v2 provides a unified hierarchy at `/sys/fs/cgroup/`.

### Systemd Cgroups Configuration
Configure hard resource boundaries directly inside the `[Service]` section:

```ini
[Service]
# CPU Quotas: 150% equals 1.5 CPU cores
CPUQuota=150%

# Memory Boundaries
MemoryMin=512M
MemoryLow=1G
MemoryHigh=3500M
MemoryMax=4G

# IO Limits: Throttle read/write bandwidth on NVMe drive
IOReadBandwidthMax=/dev/nvme0n1 100M
IOWriteBandwidthMax=/dev/nvme0n1 50M

# Task Count Limit: Mitigate fork bombs
TasksMax=1024
```

### Direct Cgroups v2 Manipulation
Outside systemd, resource limits are configured by writing directly to cgroup controllers:
```bash
# Create a dedicated cgroup slice
mkdir -p /sys/fs/cgroup/production.slice/worker_group

# Set hard memory ceiling to 2GB
echo "2147483648" > /sys/fs/cgroup/production.slice/worker_group/memory.max

# Attach active process PID
echo "$PID" > /sys/fs/cgroup/production.slice/worker_group/cgroup.procs
```
