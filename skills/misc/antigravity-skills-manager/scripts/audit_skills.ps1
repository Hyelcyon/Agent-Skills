param(
    [string]$SkillsRoot = "$HOME\.gemini\config\skills",
    [string]$ConfigPath = "$HOME\.gemini\config\skills.json"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Antigravity Skills Health Audit Tool    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Target Skills Root: $SkillsRoot"
Write-Host "Target Config JSON: $ConfigPath`n"

if (-not (Test-Path $SkillsRoot)) {
    Write-Error "Skills root directory not found: $SkillsRoot"
    exit 1
}

$frameworkSkills = @('react', 'vue', 'angular', 'svelte', 'nodejs', 'nextjs')

$registeredPaths = @()
if (Test-Path $ConfigPath) {
    try {
        $json = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        $registeredPaths = $json.entries | ForEach-Object {
            $p = $_.path.Replace("~", $HOME)
            if (-not [System.IO.Path]::IsPathRooted($p)) {
                $configDir = [System.IO.Path]::GetDirectoryName([System.IO.Path]::GetFullPath($ConfigPath))
                $baseDir = if ($configDir.EndsWith(".agents") -or $configDir.EndsWith(".agent")) { [System.IO.Path]::GetDirectoryName($configDir) } else { $configDir }
                $p = [System.IO.Path]::Combine($baseDir, $p)
            }
            [System.IO.Path]::GetFullPath($p)
        }
    } catch {
        Write-Warning "Could not parse skills.json: $_"
    }
}

$allSkills = Get-ChildItem -Path $SkillsRoot -Recurse -Filter "SKILL.md"

Write-Host "Found $($allSkills.Count) active skills.`n" -ForegroundColor Green

$results = foreach ($skillFile in $allSkills) {
    $skillDir = $skillFile.Directory
    $parentDir = [System.IO.Path]::GetFullPath($skillDir.Parent.FullName)
    
    $isRootChild = ($parentDir -eq [System.IO.Path]::GetFullPath($SkillsRoot))
    $isRegistered = ($registeredPaths -contains $parentDir)
    $discoveryStatus = if ($isRootChild -or $isRegistered) { "OK" } else { "MISSING_JSON_REGISTRATION" }
    
    $content = Get-Content $skillFile.FullName
    $lineCount = $content.Count
    
    $hasFrontmatter = ($content[0] -eq "---")
    $hasName = $false
    $descStartsWithUseWhen = $false
    $has5PhaseProtocol = $false
    
    foreach ($line in $content) {
        if ($line -match "^name:\s*\S+") { $hasName = $true }
        if ($line -match '^description:\s*"?Use when\b') { $descStartsWithUseWhen = $true }
        if ($line -match "5-Phase" -or $line -match "Operational Protocol") { $has5PhaseProtocol = $true }
    }
    
    $fmStatus = if ($hasFrontmatter -and $hasName -and $descStartsWithUseWhen) { "VALID" } else { "INVALID" }
    
    $exDir = Join-Path $skillDir.FullName "examples"
    $resDir = Join-Path $skillDir.FullName "resources"
    $refDir = Join-Path $skillDir.FullName "references"

    $exCount = if (Test-Path $exDir) { (Get-ChildItem -Path $exDir -File).Count } else { 0 }
    $resCount = if (Test-Path $resDir) { (Get-ChildItem -Path $resDir -File).Count } else { 0 }
    $refCount = if (Test-Path $refDir) { (Get-ChildItem -Path $refDir -File).Count } else { 0 }

    $targetRefCount = if ($frameworkSkills -contains $skillDir.Name) { 7 } else { 3 }
    $refPass = ($refCount -ge $targetRefCount)
    $exPass = ($exCount -ge 3)
    $resPass = ($resCount -ge 3)

    $triadStatus = if ($refPass -and $exPass -and $resPass) { "PASS" } else { "FAIL" }

    $brokenLinks = 0
    $inCodeBlock = $false
    foreach ($line in $content) {
        if ($line -match '^```') {
            $inCodeBlock = -not $inCodeBlock
            continue
        }
        if (-not $inCodeBlock) {
            $matches = [regex]::Matches($line, '\[([^\]]+)\]\(([^)]+)\)')
            foreach ($m in $matches) {
                $url = $m.Groups[2].Value
                if ($url -match '^https?://' -or $url -match '^mailto:' -or $url -match '^#') { continue }
                $cleanUrl = $url.Split('#')[0]
                if ([string]::IsNullOrWhiteSpace($cleanUrl)) { continue }
                $resolved = Join-Path $skillDir.FullName $cleanUrl
                if (-not (Test-Path $resolved)) {
                    $brokenLinks++
                }
            }
        }
    }

    [PSCustomObject]@{
        SkillName = $skillDir.Name
        Lines = $lineCount
        Discovery = $discoveryStatus
        Frontmatter = $fmStatus
        Protocol5P = if ($has5PhaseProtocol) { "OK" } else { "MISSING" }
        Refs = "$refCount/$targetRefCount"
        Examples = $exCount
        Resources = $resCount
        Triad = $triadStatus
        BrokenLinks = $brokenLinks
        Path = $skillDir.FullName.Replace($SkillsRoot, "")
    }
}

$results | Format-Table -AutoSize

$failedSkills = $results | Where-Object { 
    $_.Discovery -ne "OK" -or 
    $_.Frontmatter -ne "VALID" -or 
    $_.Protocol5P -ne "OK" -or 
    $_.Triad -ne "PASS" -or 
    $_.BrokenLinks -gt 0 
}

if ($failedSkills.Count -gt 0) {
    Write-Host "`n[FAIL] Found $($failedSkills.Count) skills requiring reinforcement:" -ForegroundColor Red
    $failedSkills | ForEach-Object {
        Write-Host " - $($_.SkillName): FM=$($_.Frontmatter), 5P=$($_.Protocol5P), Triad=$($_.Triad), BrokenLinks=$($_.BrokenLinks)" -ForegroundColor Yellow
    }
    exit 1
} else {
    Write-Host "`n[SUCCESS] All $($allSkills.Count) skills passed structural verification!" -ForegroundColor Green
}

$truthScript = Join-Path $PSScriptRoot "verify_skill_truth.py"
if (Test-Path $truthScript) {
    Write-Host "`nExecuting Deep Truth & Code Hallucination Audit..." -ForegroundColor Cyan
    & python $truthScript
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Truth and hallucination verification detected issues."
        exit 1
    }
}

Write-Host "`nAudit complete." -ForegroundColor Cyan
