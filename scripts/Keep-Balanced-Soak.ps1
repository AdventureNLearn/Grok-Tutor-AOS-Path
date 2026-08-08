# Watchdog: restart continuous-balanced-soak if LIVE.json stalls.
# Does not fail the overnight mission — soft restart only.
#
#   powershell -File scripts/Keep-Balanced-Soak.ps1 -StopAt "2026-08-08T07:00:00"

param(
  [string]$StopAt = "2026-08-08T07:00:00",
  [int]$StallSec = 45,
  [int]$PollSec = 15
)

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$logDir = "C:\AOS\logs"
$live = Join-Path $root "public\soak\LIVE.json"
$tsx = Join-Path $root "node_modules\.bin\tsx.cmd"
$log = Join-Path $logDir "balanced-soak-watchdog.log"
$pidFile = Join-Path $logDir "balanced-soak.pid"
$outLog = Join-Path $logDir "balanced-soak-console.log"
$errLog = Join-Path $logDir "balanced-soak-console.err.log"

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content -Path $log -Value $line -Encoding UTF8
  Write-Host $line
}

function Get-SoakPid {
  if (Test-Path $pidFile) {
    $id = [int](Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
    if ($id -and (Get-Process -Id $id -ErrorAction SilentlyContinue)) { return $id }
  }
  return 0
}

function Start-Soak {
  $tsxCli = Join-Path $root "node_modules\tsx\dist\cli.mjs"
  if (-not (Test-Path $tsxCli)) {
    Log "tsx cli missing at $tsxCli"
    return 0
  }
  # kill stale soak (and any orphan continuous-balanced node)
  $old = Get-SoakPid
  if ($old) {
    Stop-Process -Id $old -Force -ErrorAction SilentlyContinue
    Log "killed stale soak $old"
  }
  Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -and $_.CommandLine -match "continuous-balanced-soak"
  } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    Log "killed orphan $($_.ProcessId)"
  }
  Start-Sleep -Seconds 1
  # Launch node directly so PID stays alive (tsx.cmd can exit early)
  $p = Start-Process -FilePath "node.exe" -ArgumentList @(
    $tsxCli,
    "scripts/continuous-balanced-soak.mts",
    "--sim-only",
    "--stop-at", $StopAt
  ) -WorkingDirectory $root -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput $outLog -RedirectStandardError $errLog
  if ($p) {
    Set-Content $pidFile $p.Id -Encoding ascii
    Log "started soak node-pid=$($p.Id) stopAt=$StopAt"
    return $p.Id
  }
  Log "start failed"
  return 0
}

# Single-instance: process + scheduled-task dual launch must not thrash
$mutex = $null
try {
  $created = $false
  $mutex = New-Object System.Threading.Mutex($false, "Global\AOS-Tutor-Keep-Balanced-Soak", [ref]$created)
  if (-not $mutex.WaitOne(0)) {
    Log "another Keep-Balanced-Soak instance running — exit"
    exit 0
  }
} catch {
  Log "mutex soft-fail (continuing): $($_.Exception.Message)"
}

$deadline = [datetime]::Parse($StopAt)
Log "Keep-Balanced-Soak START deadline=$deadline stallSec=$StallSec"

if (-not (Get-SoakPid)) { [void](Start-Soak) }

while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds $PollSec
  $pid = Get-SoakPid
  $alive = $pid -and (Get-Process -Id $pid -ErrorAction SilentlyContinue)
  $stale = $true
  if (Test-Path $live) {
    $age = ((Get-Date) - (Get-Item $live).LastWriteTime).TotalSeconds
    $stale = $age -gt $StallSec
    if (-not $stale -and $alive) {
      # healthy
      continue
    }
    Log "check alive=$alive liveAgeSec=$([math]::Round($age,1)) stale=$stale"
  } else {
    Log "LIVE missing"
  }

  if (-not $alive -or $stale) {
    Log "RESTART soak (alive=$alive stale=$stale)"
    [void](Start-Soak)
  }
}

# stop soak at deadline
$pid = Get-SoakPid
if ($pid) {
  Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
  Log "deadline stop pid=$pid"
}
if ($mutex) {
  try { $mutex.ReleaseMutex() | Out-Null } catch {}
  try { $mutex.Dispose() } catch {}
}
Log "Keep-Balanced-Soak DONE"
exit 0
