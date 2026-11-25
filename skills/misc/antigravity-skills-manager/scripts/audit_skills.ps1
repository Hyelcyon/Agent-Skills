param(
    [string]$SkillsRoot = "$HOME\.gemini\config\skills",
    [string]$ConfigPath = "$HOME\.gemini\config\skills.json",
    [switch]$StrictUseWhenPrefix
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
        $configDir = [System.IO.Path]::GetDirectoryName([System.IO.Path]::GetFullPath($ConfigPath))
        $baseDir = if ($configDir.EndsWith(".agents") -or $configDir.EndsWith(".agent")) {
            [System.IO.Path]::GetDirectoryName($configDir)
        } else {
            $configDir
        }
        foreach ($entry in ($json.entries | Where-Object { $_ -ne $null })) {
            $p = $entry.path.Replace("~", $HOME)
            if (-not [System.IO.Path]::IsPathRooted($p)) {
                $p = [System.IO.Path]::Combine($baseDir, $p)
            }
            $registeredPaths += [System.IO.Path]::GetFullPath($p)
        }
    } catch {
        Write-Error "Could not parse manifest ${ConfigPath}: $_"
        exit 1
    }
}

$allSkills = Get-ChildItem -Path $SkillsRoot -Recurse -Filter "SKILL.md" |
    Where-Object { $_.FullName -notmatch '\\(\.git|node_modules|__pycache__)\\' }

Write-Host "Found $($allSkills.Count) active skills.`n" -ForegroundColor Green

$results = foreach ($skillFile in $allSkills) {
    $skillDir = $skillFile.Directory
    $dirName = $skillDir.Name
    $parentDir = [System.IO.Path]::GetFullPath($skillDir.Parent.FullName)

    $isRootChild = ($parentDir -eq [System.IO.Path]::GetFullPath($SkillsRoot))
    $isRegistered = ($registeredPaths -contains $parentDir)
    $discoveryStatus = if ($isRootChild -or $isRegistered) { "OK" } else { "MISSING_JSON_REGISTRATION" }

    $rawText = Get-Content $skillFile.FullName -Raw -Encoding UTF8
    $content = $rawText -split "\r?\n"
    $lineCount = $content.Count

    $fmMatch = [regex]::Match($rawText, '(?s)^---\r?\n(.*?)\r?\n---(?:\r?\n|$)')
    $hasFrontmatter = $fmMatch.Success
    $fmErrors = @()

    if (-not $hasFrontmatter) {
        $fmErrors += "MissingYAML"
    } else {
        $fmBody = $fmMatch.Groups[1].Value
        $nameMatch = [regex]::Match($fmBody, '(?m)^name:\s*["'']?([^"''\r\n]+?)["'']?\s*$')
        if (-not $nameMatch.Success) {
            $fmErrors += "NoName"
        } else {
            $parsedName = $nameMatch.Groups[1].Value.Trim()
            if ($parsedName -ne $dirName) { $fmErrors += "NameMismatch" }
            if ($parsedName.Length -gt 64 -or $parsedName -notmatch '^[a-z0-9]+(-[a-z0-9]+)*$') {
                $fmErrors += "BadNameFormat"
            }
        }

        $descText = $null
        $descSingle = [regex]::Match($fmBody, '(?m)^description:\s*(?!\||>)(.+)$')
        if ($descSingle.Success) {
            $descText = $descSingle.Groups[1].Value.Trim().Trim('"').Trim("'")
        } else {
            $descMulti = [regex]::Match($fmBody, '(?ms)^description:\s*[|>]-?\s*\r?\n((?:\s+.+\r?\n?)+)')
            if ($descMulti.Success) {
                $descText = ($descMulti.Groups[1].Value -replace '\r?\n\s+', ' ').Trim()
            }
        }

        if ([string]::IsNullOrWhiteSpace($descText) -or $descText.Length -lt 10 -or $descText.Length -gt 1024) {
            $fmErrors += "BadDescLength"
        } elseif ($StrictUseWhenPrefix -and $descText -notmatch '^Use when\b') {
            $fmErrors += "MissingUseWhenPrefix"
        } elseif ($descText -notmatch '(?i)\b(use when|trigger|when asking|when working)\b') {
            $fmErrors += "NoTriggerPhrase"
        }
    }

    $fmStatus = if ($fmErrors.Count -eq 0) { "VALID" } else { ($fmErrors -join ",") }
    $has5PhaseProtocol = ($rawText -match '5-Phase|Operational Protocol')

    $exDir = Join-Path $skillDir.FullName "examples"
    $resDir = Join-Path $skillDir.FullName "resources"
    $refDir = Join-Path $skillDir.FullName "references"

    $exFiles = if (Test-Path $exDir) { Get-ChildItem -Path $exDir -File } else { @() }
    $resFiles = if (Test-Path $resDir) { Get-ChildItem -Path $resDir -File } else { @() }
    $refFiles = if (Test-Path $refDir) { Get-ChildItem -Path $refDir -File } else { @() }

    $exCount = @($exFiles).Count
    $resCount = @($resFiles).Count
    $refCount = @($refFiles).Count

    $stubCount = @($exFiles + $resFiles + $refFiles | Where-Object { $_.Length -lt 40 }).Count

    $targetRefCount = if ($frameworkSkills -contains $dirName) { 7 } else { 3 }
    $triadStatus = if ($refCount -ge $targetRefCount -and $exCount -ge 3 -and $resCount -ge 3) { "PASS" } else { "FAIL" }

    $brokenLinks = 0
    $inCodeBlock = $false
    foreach ($line in $content) {
        if ($line -match '^\s*```') {
            $inCodeBlock = -not $inCodeBlock
            continue
        }
        if (-not $inCodeBlock) {
            $lineNoInlineCode = [regex]::Replace($line, '`[^`]*`', '')
            $matches = [regex]::Matches($lineNoInlineCode, '(?<!!)\[([^\]]+)\]\(([^)]+)\)')
            foreach ($m in $matches) {
                $url = $m.Groups[2].Value
                if ($url -match '^(https?://|mailto:|#|file://|conversation://)') { continue }
                $cleanUrl = $url.Split('#')[0].Trim()
                if ([string]::IsNullOrWhiteSpace($cleanUrl)) { continue }
                $resolved = Join-Path $skillDir.FullName $cleanUrl
                if (-not (Test-Path $resolved)) {
                    $brokenLinks++
                }
            }
        }
    }

    [PSCustomObject]@{
        SkillName = $dirName
        Lines = $lineCount
        Discovery = $discoveryStatus
        Frontmatter = $fmStatus
        Protocol5P = if ($has5PhaseProtocol) { "OK" } else { "MISSING" }
        Refs = "$refCount/$targetRefCount"
        Examples = $exCount
        Resources = $resCount
        Stubs = $stubCount
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
    $_.Stubs -gt 0 -or
    $_.BrokenLinks -gt 0
}

if ($failedSkills.Count -gt 0) {
    Write-Host "`n[FAIL] Found $($failedSkills.Count) skills requiring reinforcement:" -ForegroundColor Red
    $failedSkills | ForEach-Object {
        Write-Host " - $($_.SkillName): Disc=$($_.Discovery), FM=$($_.Frontmatter), 5P=$($_.Protocol5P), Triad=$($_.Triad), Stubs=$($_.Stubs), BrokenLinks=$($_.BrokenLinks)" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host "`n[SUCCESS] All $($allSkills.Count) skills passed structural verification!" -ForegroundColor Green

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
