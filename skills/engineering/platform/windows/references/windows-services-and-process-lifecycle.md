# Windows Services & Process Lifecycle Engineering

A senior engineering guide to authoring, deploying, and managing Windows Services, recovery policies, and background automation under the Service Control Manager (SCM).

---

## 1. Windows Service Architecture

Windows Services operate under the Service Control Manager (`services.exe`). Key architectural constraints:
1. **Interactive Session Isolation**: Since Windows Vista (Session 0 Isolation), Windows Services run in Session 0 and cannot display GUI elements or interact directly with the user's desktop.
2. **Heartbeat & Status Signals**: Services must respond to SCM control messages (`SERVICE_CONTROL_STOP`, `SERVICE_CONTROL_SHUTDOWN`) within the timeout period (default: 30 seconds), or the SCM will terminate the process.

---

## 2. Hardened Service Registration with `sc.exe`

When registering a service via CLI, always specify binary paths with strict quoting and configure automatic recovery actions:

```cmd
:: Create service with properly escaped binary path and arguments
sc.exe create EnterpriseSyncService ^
    binPath= "\"C:\Program Files\Enterprise\bin\service.exe\" --config \"C:\ProgramData\Enterprise\config.json\"" ^
    start= delayed-auto ^
    obj= "NT AUTHORITY\LocalService"

:: Configure failure recovery: restart after 60 seconds on 1st & 2nd crash
sc.exe failure EnterpriseSyncService reset= 86400 actions= restart/60000/restart/60000//

:: Set service description
sc.exe description EnterpriseSyncService "Enterprise background synchronization agent."
```

---

## 3. Graceful Shutdown & Event Signal Handling

A senior Windows Service must intercept stop requests, close network listeners, flush buffers to disk, and notify the SCM:

- **State Transition Flow**:
  $$\text{SERVICE\_RUNNING} \longrightarrow \text{SERVICE\_STOP\_PENDING} \longrightarrow \text{SERVICE\_STOPPED}$$
- In .NET applications, use `Microsoft.Extensions.Hosting.WindowsServiceLifetime` to automatically bind SCM stop signals to `IHostApplicationLifetime.ApplicationStopping`.

---

## 4. Auditing SCM Errors in Windows Event Log

Diagnose service startup failures and unexpected crashes via PowerShell querying the System Event Log:

```powershell
Get-WinEvent -FilterHashtable @{
    LogName      = 'System'
    ProviderName = 'Service Control Manager'
    Level        = 2 # Error
} -MaxEvents 5 | Format-List TimeCreated, Id, Message
```
