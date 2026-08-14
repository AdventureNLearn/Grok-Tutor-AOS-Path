# Complete pipeline: clean all sources in batches, then polish-audit _polished until done.
#
#   powershell -File scripts/Run-Corpus-Clean-And-Audit-Complete.ps1

param(
  [int]$CleanBatch = 3000,
  [int]$AuditBatch = 2000,
  [string]$Tier = "public"
)

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$tsx = Join-Path $root "node_modules\tsx\dist\cli.mjs"
$logDir = "C:\AOS\logs\corpus-complete"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$master = Join-Path $logDir "complete-runner.log"

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content $master $line -Encoding UTF8
  Write-Host $line
}

function Invoke-NodeTsx([string[]]$Args) {
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
  $out = Join-Path $logDir "step-$stamp.out.log"
  $err = Join-Path $logDir "step-$stamp.err.log"
  $p = Start-Process -FilePath "node.exe" -ArgumentList (@($tsx) + $Args) `
    -WorkingDirectory $root -Wait -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $out -RedirectStandardError $err
  return @{ code = $p.ExitCode; out = $out; err = $err }
}

Log "=== COMPLETE CLEAN+AUDIT START ==="

# Phase 1: small high-value sources fully
Log "PHASE1 clean balanced-soak + full-spectrum + reasoning-tracks"
$r1 = Invoke-NodeTsx @(
  "scripts/corpus-polish-clean.mts",
  "--roots", "balanced-soak,full-spectrum,reasoning-tracks"
)
Log "phase1 exit=$($r1.code)"
Get-Content $r1.out -Tail 8 -EA SilentlyContinue | ForEach-Object { Log "  $_" }

# Phase 2: perfect-overnight in batches
Log "PHASE2 clean perfect-overnight batches size=$CleanBatch"
$offset = 0
$batch = 0
while ($batch -lt 5000) {
  $batch++
  Log "clean-perfect batch=$batch offset=$offset"
  $r = Invoke-NodeTsx @(
    "scripts/corpus-polish-clean.mts",
    "--roots", "perfect-overnight",
    "--batch-size", "$CleanBatch",
    "--offset", "$offset"
  )
  Log "  exit=$($r.code)"
  $latest = "C:\AOS\logs\corpus-polish-clean\LATEST-CLEAN.json"
  if (-not (Test-Path $latest)) { Log "FATAL no LATEST-CLEAN"; break }
  $sum = Get-Content $latest -Raw | ConvertFrom-Json
  Log ("  written={0} dups={1} next={2} total={3} done={4}" -f `
    $sum.stats.written, $sum.stats.dupSkip, $sum.nextOffset, $sum.total, $sum.done)
  if ($sum.done -eq $true -or $null -eq $sum.nextOffset) { break }
  $offset = [int]$sum.nextOffset
}

# Phase 3: audit polished tree completely
Log "PHASE3 audit public/corpus/_polished tier=$Tier"
# Reset polish audit global hashes for polished tree by using offset 0 (script resets when offset 0)
$aoff = 0
$ab = 0
while ($ab -lt 5000) {
  $ab++
  Log "audit-polished batch=$ab offset=$aoff"
  $r = Invoke-NodeTsx @(
    "scripts/corpus-polish-audit.mts",
    "--root", (Join-Path $root "public\corpus\_polished"),
    "--tier", $Tier,
    "--batch-size", "$AuditBatch",
    "--offset", "$aoff"
  )
  Log "  exit=$($r.code)"
  $al = "C:\AOS\logs\corpus-polish-audit\LATEST.json"
  if (-not (Test-Path $al)) { Log "FATAL no audit LATEST"; break }
  $sum = Get-Content $al -Raw | ConvertFrom-Json
  Log ("  audited={0} clean={1} soft={2} hard={3} pct={4} next={5} done={6}" -f `
    $sum.audited, $sum.clean, $sum.softFail, $sum.hardFail, $sum.cleanPct, $sum.nextOffset, $sum.done)
  if ($sum.done -eq $true -or $null -eq $sum.nextOffset) { break }
  $aoff = [int]$sum.nextOffset
}

# Final report
$final = @{
  completedAt = (Get-Date).ToString("o")
  cleanLatest = if (Test-Path "C:\AOS\logs\corpus-polish-clean\LATEST-CLEAN.json") {
    Get-Content "C:\AOS\logs\corpus-polish-clean\LATEST-CLEAN.json" -Raw | ConvertFrom-Json
  } else { $null }
  auditLatest = if (Test-Path "C:\AOS\logs\corpus-polish-audit\LATEST.json") {
    Get-Content "C:\AOS\logs\corpus-polish-audit\LATEST.json" -Raw | ConvertFrom-Json
  } else { $null }
  polishedRoot = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path\public\corpus\_polished"
} | ConvertTo-Json -Depth 8
Set-Content (Join-Path $logDir "COMPLETE.json") $final -Encoding UTF8
Log "=== COMPLETE ==="
Log $final
exit 0
