# Launchd & Daemon Architecture Guide

A senior systems engineering guide to authoring, deploying, and managing background daemons and user agents on macOS using `launchd` and modern `launchctl`.

---

## 1. LaunchDaemons vs LaunchAgents

macOS uses `launchd` as process ID 1, combining the responsibilities of `init`, `cron`, `inetd`, and watchdog.

| Category | Storage Path | Security Domain | GUI Context |
| :--- | :--- | :--- | :--- |
| **System LaunchDaemon** | `/Library/LaunchDaemons/` | `system` (Runs as root or specified daemon user) | Headless (No WindowServer access) |
| **Global LaunchAgent** | `/Library/LaunchAgents/` | `gui/<uid>` (Runs for all logged-in GUI users) | Active GUI Session |
| **User LaunchAgent** | `~/Library/LaunchAgents/` | `gui/<uid>` (Runs only for target user) | Active User Session |

---

## 2. Modern `launchctl` vs Legacy Syntax

Apple deprecated the legacy `load` and `unload` commands in OS X 10.10. Production runbooks must use the modern subcommands:

```bash
# ❌ LEGACY (Deprecated):
launchctl load -w /Library/LaunchDaemons/com.example.service.plist
launchctl unload /Library/LaunchDaemons/com.example.service.plist

# ✅ MODERN IDIOM (Required):
# 1. Bootstrap service into target domain
launchctl bootstrap system /Library/LaunchDaemons/com.example.service.plist

# 2. Kickstart / restart service immediately
launchctl kickstart -k system/com.example.service

# 3. Inspect live runtime state, exit codes, and resource limits
launchctl print system/com.example.service

# 4. Tear down and remove service from domain
launchctl bootout system/com.example.service
```

---

## 3. Property List (`plist`) Anatomy

`launchd` service definitions are XML property lists adhering to the Apple DTD schema. Key keys:
- `Label`: Globally unique reverse-DNS identifier (e.g. `com.enterprise.syncservice`).
- `ProgramArguments`: Array of strings representing executable path and arguments.
- `KeepAlive`: Boolean or dictionary defining automatic restart conditions (e.g. restart on failure or network availability).
- `ThrottleInterval`: Minimum seconds between restarts (prevents CPU-saturating crash loops).
- `StandardOutPath` / `StandardErrorPath`: Absolute file paths for logging.
- `ProcessType`: Scheduling priority: `Standard`, `Background`, or `Adaptive`.
