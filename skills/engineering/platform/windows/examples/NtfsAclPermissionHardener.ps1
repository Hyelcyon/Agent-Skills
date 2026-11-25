<#
.SYNOPSIS
    NTFS Access Control List (ACL) Hardening Script
.DESCRIPTION
    Strips inherited permissive DACLs and applies least-privilege security
    descriptors to application and secrets storage directories.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$TargetDirectory,

    [Parameter(Mandatory = $false)]
    [string]$ServiceAccount = "NT AUTHORITY\SYSTEM"
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -Path $TargetDirectory -PathType Container)) {
    throw "Target directory '$TargetDirectory' does not exist."
}

Write-Verbose "Atomically disabling inheritance and granting least-privilege ACEs on '$TargetDirectory'..."
& icacls.exe $TargetDirectory /inheritance:r /grant:r "NT AUTHORITY\SYSTEM:(OI)(CI)F" /grant:r "BUILTIN\Administrators:(OI)(CI)F"
if ($LASTEXITCODE -ne 0) {
    throw "Failed to harden base ACLs on '$TargetDirectory'. Exit code: $LASTEXITCODE"
}

if ($ServiceAccount -ne "NT AUTHORITY\SYSTEM") {
    Write-Verbose "Granting Modify rights to service account '$ServiceAccount'..."
    & icacls.exe $TargetDirectory /grant:r "${ServiceAccount}:(OI)(CI)M"
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to grant Modify ACL to '$ServiceAccount'. Exit code: $LASTEXITCODE"
    }
}

Write-Verbose "Retrieving verified ACL entries for reporting..."
$acl = Get-Acl -Path $TargetDirectory

$reportEntries = foreach ($access in $acl.Access) {
    [PSCustomObject]@{
        IdentityReference   = $access.IdentityReference.Value
        FileSystemRights    = $access.FileSystemRights.ToString()
        AccessControlType   = $access.AccessControlType.ToString()
        IsInherited         = $access.IsInherited
        InheritanceFlags    = $access.InheritanceFlags.ToString()
    }
}

Write-Output $reportEntries
