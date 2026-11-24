# Security ACLs & Registry Hardening Guide

A senior engineering guide to configuring least-privilege NTFS Access Control Lists (ACLs), Security Descriptor Definition Language (SDDL), and Windows Registry governance.

---

## 1. NTFS Access Control Lists Architecture

Windows uses discretionary access control lists (DACLs) consisting of Access Control Entries (ACEs).
- **Inheritance Traps**: Folders created under system roots (`C:\`) inherit default broad permissions granting non-admin users write access (`BUILTIN\Users:(OI)(CI)WD`).
- **Standard Least-Privilege DACL**:
  - `NT AUTHORITY\SYSTEM`: Full Control (`F`)
  - `BUILTIN\Administrators`: Full Control (`F`)
  - Service Account (e.g. `NT SERVICE\MyService`): Read & Execute (`RX`) or Modify (`M`)

---

## 2. Hardening Directory DACLs with `icacls`

To harden a sensitive directory containing credentials, keys, or binaries:

```powershell
$dirPath = "C:\ProgramData\EnterpriseApp"

# 1. Disable inheritance and remove inherited ACEs (/inheritance:r)
# 2. Grant SYSTEM full control for subfolders and files (OI)(CI)F
# 3. Grant local Administrators full control (OI)(CI)F
# 4. Grant specific service user modify rights
icacls $dirPath /inheritance:r `
    /grant:r "NT AUTHORITY\SYSTEM:(OI)(CI)F" `
    /grant:r "BUILTIN\Administrators:(OI)(CI)F" `
    /grant:r "NT SERVICE\EnterpriseApp:(OI)(CI)M"
```

---

## 3. Windows Registry Governance

The Windows Registry (`HKLM`, `HKCU`) houses core system and application state.

### Rules of Senior Registry Management:
1. **Never write without prior export**: Always capture a backup `.reg` file before altering production registry keys.
2. **Use Native .NET / PowerShell Providers**:
   ```powershell
   $regPath = 'HKLM:\SOFTWARE\Enterprise\App'
   if (-not (Test-Path $regPath)) {
       New-Item -Path $regPath -Force | Out-Null
   }
   Set-ItemProperty -Path $regPath -Name 'TelemetryEnabled' -Value 0 -Type DWord
   ```
3. **Atomic Rollback Planning**: Ensure every configuration change provides an explicit reversible removal or restoration script.
