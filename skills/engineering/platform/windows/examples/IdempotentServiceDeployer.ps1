<#
.SYNOPSIS
    Idempotent Windows Service Deployment Script
.DESCRIPTION
    Installs or updates a Windows Service, configures failure recovery,
    and validates service status using the Service Control Manager.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ServiceName,

    [Parameter(Mandatory = $true)]
    [string]$BinaryPath,

    [Parameter(Mandatory = $false)]
    [string]$DisplayName = $ServiceName,

    [Parameter(Mandatory = $false)]
    [string]$ServiceAccount = "NT AUTHORITY\LocalService"
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -Path $BinaryPath)) {
    throw "Target binary path '$BinaryPath' does not exist."
}

$resolvedBinary = (Resolve-Path -Path $BinaryPath).Path
$quotedBinPath = "`"$resolvedBinary`""

Write-Verbose "Checking existing service status for '$ServiceName'..."
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

if ($existingService) {
    if ($existingService.Status -eq 'Running') {
        Write-Verbose "Stopping running service '$ServiceName'..."
        Stop-Service -Name $ServiceName -Force
        $existingService.WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))
    }

    Write-Verbose "Updating existing service configuration..."
    & sc.exe config $ServiceName "binPath=" $quotedBinPath "DisplayName=" $DisplayName "obj=" $ServiceAccount | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to configure service '$ServiceName'. Exit code: $LASTEXITCODE"
    }
} else {
    Write-Verbose "Creating new Windows Service '$ServiceName'..."
    & sc.exe create $ServiceName "binPath=" $quotedBinPath "DisplayName=" $DisplayName "start=" "delayed-auto" "obj=" $ServiceAccount | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create service '$ServiceName'. Exit code: $LASTEXITCODE"
    }
}

Write-Verbose "Configuring automatic service recovery policy..."
& sc.exe failure $ServiceName "reset=" "86400" "actions=" "restart/60000/restart/60000//" | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Failed to set recovery policy on '$ServiceName'. Exit code: $LASTEXITCODE"
}

Write-Verbose "Starting service '$ServiceName'..."
Start-Service -Name $ServiceName
$runningService = Get-Service -Name $ServiceName
$runningService.WaitForStatus('Running', [TimeSpan]::FromSeconds(30))

# Return structured object directly (omitting unparenthesized Write-Output [PSCustomObject] trap)
[PSCustomObject]@{
    ServiceName = $runningService.Name
    DisplayName = $runningService.DisplayName
    Status      = $runningService.Status.ToString()
    StartType   = $runningService.StartType.ToString()
}
