# Modern PowerShell Scripting Architecture

A senior systems engineering guide to writing robust, maintainable, and pipeline-friendly PowerShell 7.4+ automation scripts following the **Microsoft PowerShell Practice and Style Guide**.

---

## 1. Defensive Script Header & Strict Mode

Every production script or module function must declare advanced cmdlet bindings and strict error traps:

```powershell
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TargetDirectory,

    [Parameter(Mandatory = $false)]
    [int]$RetryCount = 3
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'
```

### Explanation of Settings:
- **`[CmdletBinding()]`**: Enables standard parameter attributes (`-Verbose`, `-Debug`, `-ErrorAction`).
- **`Set-StrictMode -Version 3.0`**: Throws terminating errors if uninitialized variables are read, non-existent properties are accessed on objects, or functions are invoked with invalid syntax.
- **`$ErrorActionPreference = 'Stop'`**: Converts non-terminating errors into terminating exceptions that trigger `catch` blocks immediately.

---

## 2. Splatting Over Backtick Line Continuations

The backtick character (`` ` ``) is invisible and fails silently if trailing whitespace or carriage return precedes it. Always pass multiple parameters using hash table splatting (`@params`):

```powershell
# ❌ FRAGILE: Trailing space after backtick causes syntax failure
Get-ChildItem -Path "C:\Logs" `
    -Filter "*.log" `
    -Recurse

# ✅ SENIOR IDIOM: Splatting is robust and readable
$searchParams = @{
    Path        = 'C:\Logs'
    Filter      = '*.log'
    Recurse     = $true
    File        = $true
    ErrorAction = 'SilentlyContinue'
}
$logFiles = Get-ChildItem @searchParams
```

---

## 3. Pipeline-First Output (`PSCustomObject`)

Never format data with `Write-Host` or string concatenation. Return structured `[PSCustomObject]` instances to allow downstream sorting, filtering, and export (`Export-Csv`, `ConvertTo-Json`):

```powershell
function Get-ProcessResourceMetric {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$ProcessName
    )

    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if (-not $processes) {
        Write-Warning "No active processes found matching '$ProcessName'."
        return
    }

    foreach ($proc in $processes) {
        [PSCustomObject]@{
            ProcessId       = $proc.Id
            ProcessName     = $proc.ProcessName
            WorkingSetMb    = [math]::Round($proc.WorkingSet64 / 1MB, 2)
            CpuSeconds      = [math]::Round($proc.CPU, 2)
            StartTimeUtc    = $proc.StartTime.ToUniversalTime().ToString('o')
        }
    }
}
```

---

## 4. Native Process Execution & Exit Code Checks

When executing native Win32 executables (`git.exe`, `sc.exe`, `robocopy.exe`), PowerShell does not automatically throw on non-zero exit codes. Always verify `$LASTEXITCODE`:

```powershell
& robocopy.exe "C:\Source" "C:\Dest" /MIR /NJH /NJS /nc /ns /np
# Note: Robocopy return codes 0 to 7 indicate successful file operations
if ($LASTEXITCODE -ge 8) {
    throw "Robocopy encountered a fatal error with exit code $LASTEXITCODE."
}
```
