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

Write-Verbose "Disabling inheritance on '$TargetDirectory' and stripping existing ACEs..."
& icacls.exe $TargetDirectory /inheritance:r
if ($LASTEXITCODE -ne 0) {
    throw "Failed to disable inheritance on '$TargetDirectory'. Exit code: $LASTEXITCODE"
}

Write-Verbose "Applying least-privilege permissions to SYSTEM and Administrators..."
& icacls.exe $TargetDirectory /grant:r "NT AUTHORITY\SYSTEM:(OI)(CI)F"
& icacls.exe $TargetDirectory /grant:r "BUILTIN\Administrators:(OI)(CI)F"

if ($ServiceAccount -ne "NT AUTHORITY\SYSTEM") {
    Write-Verbose "Granting Modify rights to service account '$ServiceAccount'..."
    & icacls.exe $TargetDirectory /grant:r "${ServiceAccount}:(OI)(CI)M"
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
