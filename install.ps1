<#
.SYNOPSIS
    Agent-Skills Multi-Agent Installer for Windows PowerShell
.DESCRIPTION
    Installs Agent-Skills into Claude Code, OpenAI Codex, and Google Antigravity
    using zero-copy directory junctions so `git pull` updates all skills in place.
.EXAMPLE
    .\install.ps1 -All
    .\install.ps1 -Claude -Antigravity
    .\install.ps1 -List
    .\install.ps1 -Uninstall -All
#>
[CmdletBinding()]
param (
    [switch]$Claude,
    [switch]$Codex,
    [switch]$Antigravity,
    [switch]$All,
    [switch]$List,
    [switch]$Uninstall,
    [string[]]$Skill
)

$ErrorActionPreference = "Stop"

$RepoRoot = $PSScriptRoot
$SkillsRoot = Join-Path $RepoRoot "skills"

if (-not (Test-Path $SkillsRoot)) {
    Write-Error "Cannot locate skills root at: $SkillsRoot"
    exit 1
}

# Discover all skills in repository
$skillMap = [ordered]@{}
Get-ChildItem -Path $SkillsRoot -Recurse -Filter "SKILL.md" | ForEach-Object {
    $dir = $_.Directory
    $skillName = $dir.Name
    $content = Get-Content $_.FullName -TotalCount 10
    foreach ($line in $content) {
        if ($line -match "^name:\s*['""]?([^'""\s]+)['""]?") {
            $skillName = $matches[1]
            break
        }
    }
    $skillMap[$skillName] = $dir.FullName
}

if ($List) {
    Write-Host "`n=== Available Agent Skills ($($skillMap.Count)) ===" -ForegroundColor Cyan
    foreach ($entry in $skillMap.GetEnumerator()) {
        $rel = $entry.Value.Replace($RepoRoot, "").TrimStart("\/")
        Write-Host " - $($entry.Key.PadRight(30)) -> $rel" -ForegroundColor Green
    }
    Write-Host ""
    exit 0
}

# Resolve targets
$targetDirs = @()

if ($All) {
    $Claude = $true
    $Codex = $true
    $Antigravity = $true
}

# Default to auto-detect if no agent flag is passed
if (-not $Claude -and -not $Codex -and -not $Antigravity) {
    Write-Host "No explicit target specified. Auto-detecting installed agents..." -ForegroundColor Yellow
    if (Test-Path (Join-Path $HOME ".claude")) { $Claude = $true }
    if (Test-Path (Join-Path $HOME ".codex")) { $Codex = $true }
    if (Test-Path (Join-Path $HOME ".gemini")) { $Antigravity = $true }
    
    if (-not $Claude -and -not $Codex -and -not $Antigravity) {
        Write-Host "No agent directories detected. Defaulting to Claude Code and Antigravity." -ForegroundColor Yellow
        $Claude = $true
        $Antigravity = $true
    }
}

if ($Claude) {
    $targetDirs += [PSCustomObject]@{
        Agent = "Claude Code"
        Path = Join-Path $HOME ".claude\skills"
        Type = "JunctionTree"
    }
}

if ($Codex) {
    $targetDirs += [PSCustomObject]@{
        Agent = "OpenAI Codex"
        Path = Join-Path $HOME ".codex\skills"
        Type = "JunctionTree"
    }
}

if ($Antigravity) {
    $targetDirs += [PSCustomObject]@{
        Agent = "Google Antigravity"
        Path = Join-Path $HOME ".gemini\config\skills"
        Type = "ManifestOrJunction"
    }
}

# Filter selected skills if specific names requested
$selectedSkills = $skillMap
if ($Skill -and $Skill.Count -gt 0) {
    $selectedSkills = [ordered]@{}
    foreach ($s in $Skill) {
        if ($skillMap.Contains($s)) {
            $selectedSkills[$s] = $skillMap[$s]
        } else {
            Write-Warning "Requested skill '$s' not found in repository."
        }
    }
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "         Agent-Skills Windows Installer          " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Source Repository : $RepoRoot"
Write-Host "Target Skills     : $($selectedSkills.Count) skills`n"

foreach ($target in $targetDirs) {
    Write-Host "Processing Target Agent: $($target.Agent) ($($target.Path))" -ForegroundColor Cyan

    if ($target.Agent -eq "Google Antigravity") {
        if ($Uninstall) {
            Write-Host "  Uninstalling Agent-Skills from $($target.Path)..." -ForegroundColor Yellow
            @("engineering", "misc", "research") | ForEach-Object {
                $p = Join-Path $target.Path $_
                if (Test-Path $p) {
                    $isReparse = [bool]((Get-Item $p -Force).Attributes -band [System.IO.FileAttributes]::ReparsePoint)
                    if ($isReparse) {
                        [System.IO.Directory]::Delete($p)
                        Write-Host "   - Unlinked category junction: $_" -ForegroundColor DarkGray
                    }
                }
            }
            Write-Host "  [OK] Uninstallation complete for $($target.Agent).`n" -ForegroundColor Green
            continue
        }

        if (-not (Test-Path $target.Path)) {
            New-Item -Path $target.Path -ItemType Directory -Force | Out-Null
        }

        Write-Host "  Synchronizing structured 9-category skill tree into $($target.Path)..." -ForegroundColor Cyan
        robocopy $SkillsRoot $target.Path /MIR /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
        Write-Host "  [OK] Successfully synchronized $($selectedSkills.Count) skills into Google Antigravity without flat duplicates.`n" -ForegroundColor Green
        continue
    }

    if ($Uninstall) {
        Write-Host "  Uninstalling Agent-Skills from $($target.Path)..." -ForegroundColor Yellow
        if (Test-Path $target.Path) {
            Get-ChildItem -Path $target.Path | ForEach-Object {
                $isReparse = [bool]($_.Attributes -band [System.IO.FileAttributes]::ReparsePoint)
                if ($isReparse -and $skillMap.Contains($_.Name)) {
                    Write-Host "   - Unlinking junction: $($_.Name)" -ForegroundColor DarkGray
                    [System.IO.Directory]::Delete($_.FullName)
                }
            }
        }
        Write-Host "  [OK] Uninstallation complete for $($target.Agent).`n" -ForegroundColor Green
        continue
    }

    if (-not (Test-Path $target.Path)) {
        New-Item -Path $target.Path -ItemType Directory -Force | Out-Null
    }

    $installed = 0
    foreach ($entry in $selectedSkills.GetEnumerator()) {
        $sName = $entry.Key
        $sSource = $entry.Value
        $destLink = Join-Path $target.Path $sName

        if (Test-Path $destLink) {
            $isReparse = [bool]((Get-Item $destLink -Force).Attributes -band [System.IO.FileAttributes]::ReparsePoint)
            if ($isReparse) {
                [System.IO.Directory]::Delete($destLink)
            } else {
                Write-Warning "Existing directory at '$destLink' is not a junction. Skipping to prevent data loss."
                continue
            }
        }

        # Create zero-copy Directory Junction
        $null = cmd /c mklink /J "$destLink" "$sSource"
        if (Test-Path $destLink) {
            $installed++
        }
    }

    Write-Host "  [OK] Successfully linked $installed skills into $($target.Agent).`n" -ForegroundColor Green
}

Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host "Run 'git pull' in '$RepoRoot' anytime to receive upstream updates automatically.`n"
