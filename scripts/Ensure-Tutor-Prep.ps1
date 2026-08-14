# Lightweight ensure: restart soak / vite if stalled. Safe to run every 1-2 min.
# Designed for scheduled-task recurrence (not a long loop).

param(
  [string]$StopAt = "2026-08-08T07:00:00",
  [int]$StallSec = 90
)

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$logDir = "C:\AOS\logs"
$log = Join-Path $logDir "ensure-tutor-prep.log"
$live = Join-Path $root "public\soak\LIVE.json"
$pidFile = Join-Path $logDir "balanced-soak.pid"
$tsxCli = Join-Path $root "node_modules\tsx\dist\cli.mjs"
$outLog = Join-Path $logDir "balanced-soak-console.log"
$errLog = Join-Path $logDir "balanced-soak-console.err.log"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content -Path $log -Value $line -Encoding UTF8
}

try {
  $deadline = [datetime]::Parse($StopAt)
} catch {
  Log "bad StopAt=$StopAt"
  exit 0
}

if ((Get-Date) -ge $deadline) {
  Log "past deadline - ensure idle"
  exit 0
}

# Vite
$viteUp = $false
try {
  $viteUp = ((Invoke-WebRequest "http://127.0.0.1:8085/" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200)
} catch {}
if (-not $viteUp) {
  Log "vite down - start Keep-Tutor-Server once"
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "powershell.exe"
  $psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\scripts\Keep-Tutor-Server.ps1`" -Minutes 30 -IntervalSec 30"
  $psi.UseShellExecute = $true
  $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
  [void][System.Diagnostics.Process]::Start($psi)
  Start-Sleep -Seconds 3
}

# Soak alive?
$soakPid = 0
if (Test-Path $pidFile) {
  try { $soakPid = [int](Get-Content $pidFile | Select-Object -First 1) } catch {}
}
$alive = $soakPid -and (Get-Process -Id $soakPid -ErrorAction SilentlyContinue)

$stale = $true
$age = -1
if (Test-Path $live) {
  $age = ((Get-Date) - (Get-Item $live).LastWriteTime).TotalSeconds
  $stale = $age -gt $StallSec
}

if ($alive -and -not $stale) {
  Log "ok soakPid=$soakPid liveAgeSec=$([math]::Round($age,1))"
  exit 0
}

Log "RESTART soak (alive=$alive stale=$stale liveAgeSec=$([math]::Round($age,1)))"
if ($alive) {
  Stop-Process -Id $soakPid -Force -ErrorAction SilentlyContinue
}
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -and $_.CommandLine -match "continuous-balanced-soak"
} | ForEach-Object {
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

if (-not (Test-Path $tsxCli)) {
  Log "FATAL missing $tsxCli"
  exit 1
}

# Rotate logs so redirect does not lock
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
if (Test-Path $outLog) {
  Move-Item $outLog (Join-Path $logDir "balanced-soak-console.$stamp.log") -Force -ErrorAction SilentlyContinue
}
if (Test-Path $errLog) {
  Move-Item $errLog (Join-Path $logDir "balanced-soak-console.$stamp.err.log") -Force -ErrorAction SilentlyContinue
}

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "node.exe"
$psi.Arguments = "`"$tsxCli`" scripts/continuous-balanced-soak.mts --sim-only --stop-at $StopAt"
$psi.WorkingDirectory = $root
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$p = New-Object System.Diagnostics.Process
$p.StartInfo = $psi
# Redirect via files after start is awkward; use Start-Process detached instead
$p = Start-Process -FilePath "node.exe" -ArgumentList @(
  $tsxCli,
  "scripts/continuous-balanced-soak.mts",
  "--sim-only",
  "--stop-at", $StopAt
) -WorkingDirectory $root -WindowStyle Hidden -PassThru `
  -RedirectStandardOutput $outLog -RedirectStandardError $errLog
if ($p) {
  Set-Content $pidFile $p.Id -Encoding ascii
  Log "started soak node-pid=$($p.Id)"
} else {
  Log "start failed"
  exit 1
}
exit 0
