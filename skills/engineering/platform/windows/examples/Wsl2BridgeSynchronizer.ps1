<#
.SYNOPSIS
    WSL2 Interoperability & Path Translation Helper
.DESCRIPTION
    Translates Windows file system paths to WSL2 mount points (/mnt/c/...)
    and verifies active distribution status cleanly.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$DistributionName = '',

    [Parameter(Mandatory = $false)]
    [string]$WindowsPath = $PWD.Path
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

function ConvertTo-WslPath {
    param([string]$Path)
    $normalized = [System.IO.Path]::GetFullPath($Path)
    if ($normalized -match '^([A-Za-z]):\\(.*)$') {
        $drive = $Matches[1].ToLowerInvariant()
        $rest = $Matches[2].Replace('\', '/')
        return "/mnt/$drive/$rest"
    }
    return $Path.Replace('\', '/')
}

$wslCmd = Get-Command wsl.exe -ErrorAction SilentlyContinue
if (-not $wslCmd) {
    throw 'wsl.exe not found on this Windows host.'
}

$prevEncoding = [Console]::OutputEncoding
[Console]::OutputEncoding = [System.Text.Encoding]::Unicode
try {
    $wslDistros = if ($DistributionName) {
        & $wslCmd.Source -d $DistributionName -- echo ok 2>&1 | Out-String
    } else {
        & $wslCmd.Source --list --verbose 2>&1 | Out-String
    }
    if ($LASTEXITCODE -ne 0) {
        throw "wsl.exe check failed (exit code $LASTEXITCODE): $wslDistros"
    }
} finally {
    [Console]::OutputEncoding = $prevEncoding
}

[PSCustomObject]@{
    InputWindowsPath = $WindowsPath
    TranslatedWsl    = ConvertTo-WslPath -Path $WindowsPath
    ActiveDistros    = $wslDistros.Trim()
}
