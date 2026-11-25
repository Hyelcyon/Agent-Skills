---
name: macos
description: Use when authoring launchd daemon property lists, configuring codesigning and Gatekeeper compliance on Apple Silicon, managing Homebrew dependencies, or scripting Darwin/zsh environments.
---

# Enterprise macOS Darwin Systems & Platform Engineering

Senior systems engineering standards and operational runbooks for Apple macOS (Sonoma / Sequoia+): Darwin BSD userland, `launchd` background daemons and agents, Apple Silicon (arm64) codesigning, Gatekeeper compliance, Homebrew governance, and macOS memory pressure diagnostics.

## When to Use
- Authoring `launchd` service property lists (`.plist`) for background daemons and user agents.
- Managing services via modern `launchctl` subcommands (`bootstrap`, `bootout`, `print`).
- Signing Mach-O native binaries and dylibs using `codesign` and validating Gatekeeper policies.
- Resolving macOS quarantine flags (`com.apple.quarantine`) and hardened runtime entitlements.
- Structuring declarative package dependencies with `Brewfile` (`brew bundle`).
- Handling Darwin / BSD command differences vs GNU coreutils in `zsh` automation.

## When NOT to Use
- Managing Linux systemd services or sysctl networking (use `linux`).
- Managing Windows Services or PowerShell 7 automation (use `windows`).
- Developing iOS/macOS SwiftUI frontend components (use `figma-swiftui`).

---

## 1. 5-Phase Agent Operational Protocol

```
[Phase 1: Architecture Profiling] ──> [Phase 2: Security & Gatekeeper] ──> [Phase 3: Launchd Service Mapping] ──> [Phase 4: Toolchain & Brewfile] ──> [Phase 5: Diagnostics Gate]
   Check arm64, sw_vers, SIP            Codesign binaries & entitlements       Author plist & launchctl bootstrap      Manage brew bundle & zsh         Audit memory & launchctl
```

### Phase 1: Darwin & Architecture Profiling
1. Identify Apple Silicon vs Intel architecture:
   ```bash
   uname -m # arm64 vs x86_64
   ```
2. Verify macOS version (`sw_vers`) and System Integrity Protection (SIP) status (`csrutil status`).
3. Note Homebrew prefix: `/opt/homebrew` on Apple Silicon (arm64), `/usr/local` on Intel (x86_64).

### Phase 2: Security, Codesigning & Gatekeeper Boundaries
1. Sign compiled binaries with Hardened Runtime enabled:
   ```bash
   codesign --force --options runtime --timestamp --sign "Developer ID Application: Company" ./bin/app
   ```
2. Verify signature and entitlements:
   ```bash
   codesign -dvvv --entitlements :- ./bin/app
   spctl --assess --type execute --verbose ./bin/app
   ```
3. Strip quarantine attributes from downloaded trusted tools: `xattr -d com.apple.quarantine <file>`.

### Phase 3: Launchd Service & Agent Formulation
1. Determine service scope:
   - **LaunchDaemon** (`/Library/LaunchDaemons/`): Runs as `root` or dedicated daemon user, independent of logged-in GUI users.
   - **LaunchAgent** (`~/Library/LaunchAgents/`): Runs in the context of the active graphical user session.
2. Manage services via modern syntax:
   ```bash
   launchctl bootstrap system /Library/LaunchDaemons/com.enterprise.service.plist
   launchctl bootout system/com.enterprise.service
   ```

### Phase 4: Declarative Toolchain & Brewfile Governance
1. Manage system CLI dependencies via a declarative `Brewfile`.
2. Verify active Xcode command-line tools path: `xcode-select -p`.

### Phase 5: Verification & System Diagnostics
1. Audit service execution state:
   ```bash
   launchctl print system/com.enterprise.service
   ```
2. Inspect macOS memory pressure and compression:
   ```bash
   memory_pressure
   ```

---

## 2. Prohibited Anti-Patterns & Fatal Mistakes

- ❌ Using deprecated `launchctl load` or `launchctl unload` (use modern `bootstrap` / `bootout`).
- ❌ Relying on Apple-deprecated `sandbox-exec` for App Store / new production distributions instead of Hardened Runtime & App Sandbox entitlements.
- ❌ Tapping removed legacy Homebrew taps (`homebrew/bundle`, `homebrew/core`) in `Brewfile` on modern Homebrew 4.x+.
- ❌ Hardcoding `/usr/local/bin` paths on Apple Silicon systems (Homebrew installs to `/opt/homebrew/bin`).
- ❌ Distributing native arm64 Mach-O binaries without ad-hoc or developer code signing (causes immediate SIGKILL).
- ❌ Modifying SIP-protected root paths (`/System`, `/usr/bin`).
- ❌ Assuming GNU extensions (e.g. `sed -i "..."`) work identically on BSD `sed` (BSD requires `sed -i '' "..."`).

---

## 3. References & Documentation
- Launchd & Daemon Architecture Guide: [references/launchd-and-daemon-architecture.md](./references/launchd-and-daemon-architecture.md)
- macOS Security & Codesigning Invariants: [references/macos-security-and-codesigning.md](./references/macos-security-and-codesigning.md)
- Darwin Userland & Zsh Scripting: [references/darwin-userland-and-zsh.md](./references/darwin-userland-and-zsh.md)

## 4. Resources & Examples
- Hardened LaunchDaemon Property List: [resources/launchd.daemon.plist](./resources/launchd.daemon.plist)
- Declarative Brewfile Template: [resources/Brewfile.template](./resources/Brewfile.template)
- Darwin Sandbox Execution Profile: [resources/sandbox-profile.sb](./resources/sandbox-profile.sb)
- Modern Daemon Service Manager: [examples/daemon_service_manager.sh](./examples/daemon_service_manager.sh)
- Mach-O Codesign & Gatekeeper Verifier: [examples/codesign_and_verify.sh](./examples/codesign_and_verify.sh)
- Darwin System Health Inspector: [examples/macos_system_inspector.sh](./examples/macos_system_inspector.sh)
