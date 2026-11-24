# Linux Systems Performance & Diagnostics Guide

A senior engineering guide to diagnosing CPU saturation, memory pressure, I/O bottlenecks, and network exhaustion on Linux using Brendan Gregg's **USE Method** (Utilization, Saturation, Errors).

---

## 1. The USE Method Architecture

For every system resource (CPU, Memory, Storage I/O, Network), inspect:
1. **Utilization**: Percentage of time the resource is busy handling work.
2. **Saturation**: Degree to which work is queued waiting for the resource.
3. **Errors**: Count of error events or dropped packets.

---

## 2. Resource Diagnostic Matrix

| Resource | Utilization Metric & CLI | Saturation Metric & CLI | Error Metric & CLI |
| :--- | :--- | :--- | :--- |
| **CPU** | `mpstat -P ALL 1` (`%usr`, `%sys`) | `uptime` (Load Avg), `vmstat 1` (`r` runqueue) | `dmesg -T \| grep -i "mce"` |
| **Memory** | `free -h`, `vmstat 1` (`free`, `buff/cache`) | `vmstat 1` (`si`, `so` swap I/O), `/proc/pressure/memory` | `dmesg -T \| grep -i "oom-killer"` |
| **Disk I/O** | `iostat -xz 1` (`%util`) | `iostat -xz 1` (`aqu-sz` queue length, `await`) | `dmesg -T \| grep -i "I/O error"` |
| **Network** | `sar -n DEV 1` (`rxkB/s`, `txkB/s`) | `ss -s`, `netstat -s \| grep overflowed` | `ip -s link`, `ethtool -S <eth>` |

---

## 3. Pressure Stall Information (PSI)

Linux kernels 4.20+ provide Pressure Stall Information at `/proc/pressure/`:
- `/proc/pressure/cpu`: Time percentage tasks were stalled waiting for CPU.
- `/proc/pressure/memory`: Time percentage tasks were stalled on page reclaiming/swapping.
- `/proc/pressure/io`: Time percentage tasks were stalled waiting for block I/O.

Example reading `/proc/pressure/memory`:
```text
some avg10=2.34 avg60=1.12 avg300=0.55 total=8372819
full avg10=0.00 avg60=0.00 avg300=0.00 total=0
```
- `some`: At least one task was stalled.
- `full`: All non-idle tasks were stalled simultaneously (complete system thrashing).

---

## 4. Socket Inspection with `ss`

Never use deprecated `netstat`. Use modern `ss` (Socket Statistics):

```bash
# List all listening TCP sockets with process names and numerical ports
ss -tulpn

# Inspect socket memory buffer allocation and connection state
ss -t -i -e state established

# Summary of open, established, and timewait sockets
ss -s
```

### Diagnosing Backlog Queue Drops:
If `Send-Q` exceeds `Recv-Q` on a listening socket, the application is failing to accept connections fast enough, causing kernel TCP backlog drops. Check `net.core.somaxconn` and application `listen(backlog)` parameter.
