# Enterprise Hardened PowerShell 7.4 Profile
# Place at $PROFILE or $PROFILE.CurrentUserAllHosts

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

# Configure strict PSReadLine options
if (Get-Module -ListAvailable -Name PSReadLine) {
    Set-PSReadLineOption -EditMode Windows
    Set-PSReadLineOption -PredictionSource HistoryAndPlugin
    Set-PSReadLineOption -BellStyle None
}

# Enforce UTF-8 default encoding across pipes and standard output
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)

# Helper function: elevated administrator assertion
function Assert-Administrator {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]$currentIdentity
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "Access Denied: Current session does not possess elevated Administrator privileges."
    }
}
