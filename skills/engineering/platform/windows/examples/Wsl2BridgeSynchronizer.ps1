<#
.SYNOPSIS
    WSL2 Interoperability & Path Translation Helper
.DESCRIPTION
    Translates Windows file system paths to WSL2 mount points (/mnt/c/...)
    and verifies active distribution status.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$DistributionName,

    [Parameter(Mandatory = $false)]
    [string]$WindowsPath = $PWD.Path
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

function ConvertTo-WslPath {
    param([string]$Path)
    $normalized = [System.IO.Path]::GetFullPath($Path)
    if ($normalized -match '^([A-Za-z]):\\(.*)$') {
        $drive = $Matches[1].ToLower()
        $rest = $Matches[2].Replace('\', '/')
        return "/mnt/$drive/$rest"
    }
    return $Path.Replace('\', '/')
}

$wslDistros = wsl.exe --list --verbose | Out-String

$translatedPath = ConvertTo-WslPath -Path $WindowsPath

Write-Output [PSCustomObject]@{
    InputWindowsPath = $WindowsPath
    TranslatedWsl    = $translatedPath
    ActiveDistros    = $wslDistros.Trim()
}
