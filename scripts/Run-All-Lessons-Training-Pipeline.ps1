# Process ALL produced lessons: harvest uniques (full corpus) -> export -> polish all uniques.
# Logs: C:\AOS\logs\corpus-all-unique\
#
#   powershell -File scripts/Run-All-Lessons-Training-Pipeline.ps1

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$tsx = Join-Path $root "node_modules\tsx\dist\cli.mjs"
$logRoot = "C:\AOS\logs\corpus-all-unique"
New-Item -ItemType Directory -Force -Path $logRoot, "$logRoot\steps" | Out-Null

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content "$logRoot\pipeline.log" $line -Encoding UTF8
  Write-Host $line
}

function Run-Node([string]$name, [string[]]$Args) {
  Log "STEP $name start"
  $out = Join-Path $logRoot "steps\$name.out.log"
  $err = Join-Path $logRoot "steps\$name.err.log"
  $p = Start-Process -FilePath "node.exe" -ArgumentList (@($tsx) + $Args) `
    -WorkingDirectory $root -Wait -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $out -RedirectStandardError $err
  Log "STEP $name exit=$($p.ExitCode)"
  if (Test-Path $out) {
    Get-Content $out -Tail 15 -ErrorAction SilentlyContinue | ForEach-Object { Log "  $_" }
  }
  if ((Test-Path $err) -and (Get-Item $err).Length -gt 0) {
    Get-Content $err -Tail 10 -ErrorAction SilentlyContinue | ForEach-Object { Log "  ERR $_" }
  }
  return $p.ExitCode
}

Log "=== ALL-LESSONS TRAINING PIPELINE BEGIN ==="
Log "Scope: EVERY produced lesson file, dedupe by content hash, polish ALL uniques"

# Soft freeze generators if any
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -and (
    $_.CommandLine -match "continuous-balanced-soak" -or
    $_.CommandLine -match "compile-perfect-overnight" -or
    $_.CommandLine -match "Keep-Corpus-Polish-Pace"
  )
} | ForEach-Object {
  Log "freeze pid=$($_.ProcessId)"
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

# 1) Harvest + export all uniques
$code = Run-Node "01-harvest-export" @(
  "scripts/harvest-all-unique-lessons.mts", "--export"
)
if ($code -ne 0) { Log "FATAL harvest"; exit 1 }

# 2) Polish all uniques in continuous batches of 3000
$offset = 0
$batch = 0
$BatchSize = 3000
$totalWritten = 0
$totalClean = 0
while ($batch -lt 5000) {
  $batch++
  Log "polish batch=$batch offset=$offset size=$BatchSize"
  $code = Run-Node "02-polish-batch-$batch" @(
    "scripts/polish-all-uniques.mts",
    "--batch-size", "$BatchSize",
    "--offset", "$offset"
  )
  $sumPath = Join-Path $logRoot "POLISH-BATCH-SUMMARY.json"
  if (-not (Test-Path $sumPath)) { Log "FATAL no polish summary"; break }
  $sum = Get-Content $sumPath -Raw | ConvertFrom-Json
  $totalWritten += [int]$sum.written
  $totalClean += [int]$sum.cleanPass
  Log "batch written=$($sum.written) cleanPass=$($sum.cleanPass) next=$($sum.nextOffset) done=$($sum.done) totalUniques=$($sum.totalUniques)"
  Log "CUMULATIVE polished=$totalWritten cleanPassApprox=$totalClean"
  # running counts file
  @{
    at = (Get-Date).ToString("o")
    batch = $batch
    cumulativePolished = $totalWritten
    cumulativeCleanPassApprox = $totalClean
    harvest = if (Test-Path "$logRoot\HARVEST-SUMMARY.json") {
      Get-Content "$logRoot\HARVEST-SUMMARY.json" -Raw | ConvertFrom-Json
    } else { $null }
    lastPolish = $sum
  } | ConvertTo-Json -Depth 6 | Set-Content "$logRoot\LATEST-COUNTS.json" -Encoding UTF8

  if ($sum.done -eq $true -or $null -eq $sum.nextOffset) { break }
  $offset = [int]$sum.nextOffset
}

# 3) Final READY split + counts
Log "final package READY-PUBLIC / READY-INTERNAL"
$outRoot = Join-Path $root "public\corpus\_training_material_all"
$pub = Join-Path $outRoot "READY-PUBLIC"
$intern = Join-Path $outRoot "READY-INTERNAL"
New-Item -ItemType Directory -Force -Path $pub, $intern | Out-Null
# Use node one-liner via polish quick - count files
$allMd = @(Get-ChildItem $outRoot -Recurse -Filter "*.md" -ErrorAction SilentlyContinue | Where-Object {
  $_.FullName -notmatch "READY-PUBLIC|READY-INTERNAL|README"
})
$pubN = 0
$intN = 0
# Keep structure under READY
foreach ($f in $allMd) {
  $rel = $f.FullName.Substring($outRoot.Length).TrimStart("\", "/")
  # simple heuristic: if has claim hygiene + no skill ids in body -> public
  $raw = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
  $destRoot = $intern
  if ($raw -and $raw -match "Claim hygiene" -and $raw -notmatch "``evidence-gate``|``shatter-protocol``") {
    $destRoot = $pub
    $pubN++
  } else { $intN++ }
  $dest = Join-Path $destRoot $rel
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  Copy-Item $f.FullName $dest -Force -ErrorAction SilentlyContinue
}

$harvest = Get-Content "$logRoot\HARVEST-SUMMARY.json" -Raw | ConvertFrom-Json
$final = @"
# ALL lessons training material — FINAL COUNTS

**At:** $((Get-Date).ToString("o"))
**Purpose:** Grok Tutor training material from ALL produced lessons (deduped)

| Metric | Count |
| --- | ---: |
| **SCANNED** (all produced files visited) | **$($harvest.SCANNED)** |
| **UNIQUE** (distinct content) | **$($harvest.UNIQUE)** |
| **DUPES** (scanned - unique) | **$($harvest.DUPES)** |
| Unique % | $($harvest.uniquePct)% |
| **UNIQUE_POLISHED** | **$totalWritten** |
| **CLEAN_PASS (approx / batch sum)** | **$totalClean** |
| READY-PUBLIC copies | $pubN |
| READY-INTERNAL copies | $intN |

## Paths
- Unique harvest: ``public/corpus/_unique_all/``
- Training material (all uniques polished): ``public/corpus/_training_material_all/``
- Logs: ``C:\AOS\logs\corpus-all-unique\``

## Note
274-lesson set remains in ``_training_material`` (tiered coverage sample).
This run is the **full unique library** from entire overnight production.
"@
Set-Content "$logRoot\FINAL-COUNTS.md" $final -Encoding UTF8
Copy-Item "$logRoot\FINAL-COUNTS.md" "$logRoot\HARVEST-COUNTS.md" -Force -ErrorAction SilentlyContinue
Copy-Item "$logRoot\FINAL-COUNTS.md" "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path\docs\TRAINING-MATERIAL-ALL-COUNTS.md" -Force
New-Item -ItemType Directory -Force -Path "C:\AOS\logs\tutor-corpus-portable" | Out-Null
Copy-Item "$logRoot\FINAL-COUNTS.md" "C:\AOS\logs\tutor-corpus-portable\TRAINING-MATERIAL-ALL-COUNTS.md" -Force
Copy-Item "$logRoot\HARVEST-SUMMARY.json" "C:\AOS\logs\tutor-corpus-portable\HARVEST-SUMMARY.json" -Force -ErrorAction SilentlyContinue

Log "=== ALL-LESSONS PIPELINE COMPLETE ==="
Log $final
exit 0
