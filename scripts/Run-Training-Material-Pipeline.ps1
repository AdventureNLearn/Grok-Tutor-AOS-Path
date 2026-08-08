# Full training-material pipeline after live runs stop.
# Sort (tiered queue) -> export -> polish -> final counts.
# Logs: C:\AOS\logs\corpus-post7\

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$tsx = Join-Path $root "node_modules\tsx\dist\cli.mjs"
$logRoot = "C:\AOS\logs\corpus-post7"
New-Item -ItemType Directory -Force -Path $logRoot, "$logRoot\steps" | Out-Null

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content "$logRoot\pipeline.log" $line -Encoding UTF8
  Write-Host $line
}

function Run-Step([string]$name, [string[]]$args) {
  Log "STEP start $name"
  $out = Join-Path $logRoot "steps\$name.out.log"
  $err = Join-Path $logRoot "steps\$name.err.log"
  $p = Start-Process -FilePath "node.exe" -ArgumentList (@($tsx) + $args) `
    -WorkingDirectory $root -Wait -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $out -RedirectStandardError $err
  Log "STEP end $name exit=$($p.ExitCode)"
  if (Test-Path $err) {
    $e = Get-Content $err -Raw -ErrorAction SilentlyContinue
    if ($e) { Log "STEP err $name : $($e.Substring(0, [Math]::Min(500, $e.Length)))" }
  }
  return $p.ExitCode
}

Log "=== TRAINING MATERIAL PIPELINE BEGIN ==="

# Soft freeze (best effort)
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -and (
    $_.CommandLine -match "continuous-balanced-soak" -or
    $_.CommandLine -match "Keep-Corpus-Polish-Pace" -or
    $_.CommandLine -match "compile-perfect-overnight"
  )
} | ForEach-Object {
  Log "freeze pid=$($_.ProcessId)"
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}
foreach ($t in @("AOS-Tutor-Polish-Pace", "AOS-Tutor-Ensure", "AOS-Tutor-Dedupe-30m", "AOS-Tutor-Perfect-5M")) {
  Unregister-ScheduledTask -TaskName $t -Confirm:$false -ErrorAction SilentlyContinue
}

# Baseline
$base = @{
  at = (Get-Date).ToString("o")
  freeGB = [math]::Round((Get-PSDrive C).Free / 1GB, 1)
}
if (Test-Path "C:\AOS\logs\perfect-overnight-progress.json") {
  $p = Get-Content "C:\AOS\logs\perfect-overnight-progress.json" -Raw | ConvertFrom-Json
  $base.perfect5m = $p.lessonsWritten
}
if (Test-Path "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path\public\soak\LIVE.json") {
  $j = Get-Content "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path\public\soak\LIVE.json" -Raw | ConvertFrom-Json
  $base.soak = $j.lessonsWritten
}
$base | ConvertTo-Json | Set-Content "$logRoot\BASELINE.json" -Encoding UTF8
Log "baseline $($base | ConvertTo-Json -Compress)"

# 1) Build + export queue
$code = Run-Step "01-build-export-queue" @(
  "scripts/build-training-queue.mts", "--export"
)
if ($code -ne 0) { Log "FATAL queue build"; exit 1 }

# 2) Polish training queue
$code = Run-Step "02-polish-training" @("scripts/polish-training-queue.mts")
if ($code -ne 0) { Log "FATAL polish"; exit 1 }

# 3) Copy final counts to portable
if (Test-Path "$logRoot\FINAL-COUNTS.md") {
  Copy-Item "$logRoot\FINAL-COUNTS.md" "$logRoot\TRAINING-MATERIAL-COUNTS.md" -Force
  New-Item -ItemType Directory -Force -Path "C:\AOS\logs\tutor-corpus-portable" | Out-Null
  Copy-Item "$logRoot\FINAL-COUNTS.md" "C:\AOS\logs\tutor-corpus-portable\TRAINING-MATERIAL-COUNTS.md" -Force
  Copy-Item "$logRoot\QUEUE-MANIFEST.md" "C:\AOS\logs\tutor-corpus-portable\QUEUE-MANIFEST.md" -Force -ErrorAction SilentlyContinue
  Copy-Item "$logRoot\QUEUE-SUMMARY.json" "C:\AOS\logs\tutor-corpus-portable\QUEUE-SUMMARY.json" -Force -ErrorAction SilentlyContinue
  Copy-Item "$logRoot\POLISH-SUMMARY.json" "C:\AOS\logs\tutor-corpus-portable\POLISH-SUMMARY.json" -Force -ErrorAction SilentlyContinue
}

Log "=== TRAINING MATERIAL PIPELINE COMPLETE ==="
if (Test-Path "$logRoot\FINAL-COUNTS.md") { Get-Content "$logRoot\FINAL-COUNTS.md" }
if (Test-Path "$logRoot\QUEUE-SUMMARY.json") { Get-Content "$logRoot\QUEUE-SUMMARY.json" -Raw }
if (Test-Path "$logRoot\POLISH-SUMMARY.json") { Get-Content "$logRoot\POLISH-SUMMARY.json" -Raw }
exit 0
