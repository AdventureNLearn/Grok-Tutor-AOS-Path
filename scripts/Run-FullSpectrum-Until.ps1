# Continuous balanced soak + corpus until wall-clock stop (default 07:00).
# Writes public/soak/LIVE.json for observe-log; rotates modes/shapes/orch/skills.
# Repair soft issues; do not abort the overnight loop.
#
#   powershell -File scripts/Run-FullSpectrum-Until.ps1 -StopAt "2026-08-08T07:00:00"

param(
  [string]$StopAt = "",
  [int]$Minutes = 0
)

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$logDir = "C:\AOS\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir "full-spectrum-overnight.log"

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content -Path $log -Value $line -Encoding UTF8
  Write-Host $line
}

$deadline = $null
if ($StopAt) {
  $deadline = [datetime]::Parse($StopAt)
} elseif ($Minutes -gt 0) {
  $deadline = (Get-Date).AddMinutes($Minutes)
} else {
  $deadline = Get-Date -Hour 7 -Minute 0 -Second 0
  if ((Get-Date) -ge $deadline) { $deadline = $deadline.AddDays(1) }
}

$stopIso = $deadline.ToString("o")
Log "Balanced continuous START deadline=$deadline"

# Kill prior LIVE.json writers (not this shell)
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
  $_.ProcessId -ne $PID -and $_.CommandLine -and (
    $_.CommandLine -match "continuous-balanced-soak" -or
    $_.CommandLine -match "sim-observable-1h\.mjs"
  )
} | ForEach-Object {
  Log "stop prior pid=$($_.ProcessId)"
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

# Single long-running balanced soak (owns LIVE.json until deadline)
$outLog = Join-Path $logDir "balanced-soak-console.log"
$errLog = Join-Path $logDir "balanced-soak-console.err.log"
$tsx = Join-Path $root "node_modules\.bin\tsx.cmd"
if (-not (Test-Path $tsx)) { $tsx = "npm.cmd" }
Log "launch continuous-balanced-soak via $tsx --stop-at $stopIso"
if ($tsx -like "*tsx.cmd") {
  $p = Start-Process -FilePath $tsx -ArgumentList @(
    "scripts/continuous-balanced-soak.mts", "--stop-at", $stopIso
  ) -WorkingDirectory $root -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog
} else {
  $p = Start-Process -FilePath "npm.cmd" -ArgumentList @(
    "exec", "--", "tsx", "scripts/continuous-balanced-soak.mts",
    "--stop-at", $stopIso
  ) -WorkingDirectory $root -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog
}

if (-not $p) {
  Log "FAIL launch soak"
  exit 1
}
Log "balanced-soak pid=$($p.Id)"
Set-Content (Join-Path $logDir "balanced-soak.pid") $p.Id -Encoding ascii

# Wait until process exits or deadline
while (-not $p.HasExited -and (Get-Date) -lt $deadline.AddMinutes(2)) {
  Start-Sleep -Seconds 30
  $alive = Get-Process -Id $p.Id -ErrorAction SilentlyContinue
  if (-not $alive) { break }
  # heartbeat into overnight log
  if (Test-Path (Join-Path $root "public\soak\LIVE.json")) {
    try {
      $j = Get-Content (Join-Path $root "public\soak\LIVE.json") -Raw | ConvertFrom-Json
      Log "heartbeat cycles=$($j.cycles) lessons=$($j.lessonsWritten) phase=$($j.currentPhase) pass=$($j.pass) soft=$($j.soft)"
    } catch {
      Log "heartbeat LIVE parse soft"
    }
  }
}

if (-not $p.HasExited) {
  Log "deadline reached - stopping balanced-soak pid=$($p.Id)"
  Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
}

$status = @{
  stoppedAt = (Get-Date).ToString("o")
  deadline = $deadline.ToString("o")
  corpus = "public/corpus/balanced-soak"
  fullSpectrum = "public/corpus/full-spectrum"
  live = "public/soak/LIVE.json"
  log = $log
  note = "Balanced soak finished. Operator review 07:00-09:00 before morning E2E."
} | ConvertTo-Json
Set-Content (Join-Path $logDir "full-spectrum-overnight-done.json") $status -Encoding UTF8
Log "Balanced continuous DONE"
exit 0
