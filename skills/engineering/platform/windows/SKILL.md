---
name: windows
description: Use when authoring production PowerShell 7.4+ automation, managing Windows Services, hardening NTFS ACLs and Registry keys, or orchestrating WSL2 interoperability.
---

# Enterprise Windows Systems & PowerShell Engineering

Senior systems engineering standards and operational runbooks for modern Windows environments: cross-platform PowerShell 7.4+ (`pwsh`), Windows Service lifecycle management, least-privilege NTFS Access Control Lists (ACLs), Registry governance, and WSL2 interoperability.

## When to Use
- Authoring production PowerShell scripts with strict error handling (`$ErrorActionPreference = 'Stop'`).
- Deploying, configuring, and monitoring Windows Services (`sc.exe`, NSSM, `New-Service`).
- Hardening file and directory security using NTFS ACLs (`icacls`, `Set-Acl`).
- Auditing or updating Windows Registry keys with atomic rollback safeguards.
- Orchestrating automated tasks via Windows Task Scheduler (`schtasks.exe`, XML definitions).
- Bridging networking, environment variables, and filesystem paths between Windows and WSL2.

## When NOT to Use
- Linux systemd units or kernel tuning (use `linux`).
- macOS Darwin daemons or launchd plists (use `macos`).
- Managing cloud VMs or Kubernetes clusters outside the local OS (use `ci-cd` or `docker`).

---

## 1. 5-Phase Agent Operational Protocol

```
[Phase 1: Environment Profiling] ──> [Phase 2: Security & ACLs] ──> [Phase 3: Defensive PowerShell] ──> [Phase 4: Service & Task Lifecycle] ──> [Phase 5: Verification Gate]
   Inspect $PSVersionTable, Arch        Audit NTFS permissions & UAC        Implement [CmdletBinding()]         Manage services & tasks              PSScriptAnalyzer & Events
```

### Phase 1: Environment & Architecture Profiling
1. Check PowerShell runtime version (`$PSVersionTable.PSVersion >= 7.4`). Avoid Windows PowerShell 5.1 legacy behaviors where possible.
2. Verify process architecture (`[System.Environment]::Is64BitProcess`) and privilege elevation status:
   ```powershell
   $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
   ```

### Phase 2: Security & NTFS ACL Boundaries
1. Remove inherited permissive permissions on application and credential directories:
   ```powershell
   icacls "C:\App\Config" /inheritance:r /grant "SYSTEM:(OI)(CI)F" /grant "Administrators:(OI)(CI)F"
   ```
2. Forbid granting broad `Everyone` or `Authenticated Users` write permissions.

### Phase 3: Defensive PowerShell Scripting
1. Enforce strict error action preferences at script entry:
   ```powershell
   [CmdletBinding()]
   param()
   Set-StrictMode -Version 3.0
   $ErrorActionPreference = 'Stop'
   ```
2. Handle exceptions deterministically using `try / catch [SpecificException]`.
3. Avoid backtick line continuations (`` ` ``) which fail silently if trailing whitespace is introduced; use splatting (`@params`) instead.

### Phase 4: Service & Scheduled Task Lifecycle
1. Configure Windows Services with automatic recovery:
   ```cmd
   sc.exe failure ServiceName reset= 86400 actions= restart/60000/restart/60000//
   ```
2. Schedule automated jobs using Task Scheduler with Least Privilege Principals.

### Phase 5: Verification & Quality Gate
1. Validate scripts with PSScriptAnalyzer:
   ```powershell
   Invoke-ScriptAnalyzer -Path ./script.ps1 -Severity Error,Warning
   ```
2. Inspect Windows Event Logs for service failures:
   ```powershell
   Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Service Control Manager'; Level=2} -MaxEvents 10
   ```

---

## 2. Prohibited Anti-Patterns

- ❌ Using backtick line continuations (`` ` ``) in scripts (fragile against invisible trailing whitespace).
- ❌ Using `Write-Host` for data output (destroys pipeline reusability; use `Write-Output` or return objects).
- ❌ Leaving `$ErrorActionPreference = 'Continue'` in mission-critical automation.
- ❌ Granting `Everyone:F` or `Users:W` on sensitive service folders or secrets.
- ❌ Parsing `dir` or `Get-ChildItem` string representations instead of accessing object properties.
- ❌ Modifying Registry keys without prior backup or transactional guards.

---

## 3. References & Documentation
- Modern PowerShell Scripting Architecture: [references/modern-powershell-scripting.md](./references/modern-powershell-scripting.md)
- Windows Services & Process Lifecycle: [references/windows-services-and-process-lifecycle.md](./references/windows-services-and-process-lifecycle.md)
- Security ACLs & Registry Hardening: [references/security-acls-and-registry-hardening.md](./references/security-acls-and-registry-hardening.md)

## 4. Resources & Examples
- Strict PowerShell Profile: [resources/profile.strict.ps1](./resources/profile.strict.ps1)
- Scheduled Task XML Definition: [resources/scheduled-task.xml](./resources/scheduled-task.xml)
- Windows Security Baseline Config: [resources/windows-security-baseline.json](./resources/windows-security-baseline.json)
- Idempotent Service Deployer: [examples/IdempotentServiceDeployer.ps1](./examples/IdempotentServiceDeployer.ps1)
- NTFS ACL Permission Hardener: [examples/NtfsAclPermissionHardener.ps1](./examples/NtfsAclPermissionHardener.ps1)
- WSL2 Bridge Synchronizer: [examples/Wsl2BridgeSynchronizer.ps1](./examples/Wsl2BridgeSynchronizer.ps1)
