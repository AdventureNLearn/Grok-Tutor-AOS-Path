# Stop Tutor pre-sprint automation at 7am (or on demand).
# Leaves Vite :8085 running if healthy so operator can check the product.
# Does NOT stop morning E2E (that starts later by operator).

$ErrorActionPreference = "SilentlyContinue"
$log = "C:\AOS\logs\tutor-prep-stop.log"
function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content -Path $log -Value $line -Encoding UTF8
  Write-Host $line
}

Log "Stop-Tutor-Prep begin"

Get-CimInstance Win32_Process | Where-Object {
  $_.CommandLine -and (
    $_.CommandLine -match "Keep-Tutor-Server\.ps1" -or
    $_.CommandLine -match "Watch-Quad-Observe\.ps1" -or
    $_.CommandLine -match "Open-Quad-Observe\.ps1" -or
    $_.CommandLine -match "Run-FullSpectrum-Until\.ps1" -or
    $_.CommandLine -match "full-spectrum-reasoning-pipeline" -or
    $_.CommandLine -match "reasoning-track-corpus" -or
    $_.CommandLine -match "continuous-balanced-soak" -or
    $_.CommandLine -match "Keep-Balanced-Soak\.ps1" -or
    $_.CommandLine -match "Keep-Corpus-Dedupe\.ps1" -or
    $_.CommandLine -match "Ensure-Tutor-Prep\.ps1" -or
    $_.CommandLine -match "Keep-Corpus-Polish-Pace\.ps1" -or
    $_.CommandLine -match "corpus-polish-clean" -or
    $_.CommandLine -match "corpus-polish-audit" -or
    $_.CommandLine -match "compile-perfect-overnight" -or
    $_.CommandLine -match "dedupe-corpus" -or
    $_.CommandLine -match "sim-observable-1h"
  )
} | ForEach-Object {
  Log "kill pid=$($_.ProcessId) prep-watcher"
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

# Optional: close only edge-quad observe panes (quiet desktop) — leave personal Edge alone
Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "msedge.exe" -and $_.CommandLine -and (
    $_.CommandLine.Contains("edge-quad-q1-log") -or
    $_.CommandLine.Contains("edge-quad-q2-spine") -or
    $_.CommandLine.Contains("edge-quad-q3-integrity") -or
    $_.CommandLine.Contains("edge-quad-q4-four")
  )
} | ForEach-Object {
  Log "kill edge-quad pid=$($_.ProcessId)"
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

# Unregister prep scheduled tasks (stop + durable ensure tasks)
@(
  "AOS-Tutor-Prep-Stop-7am",
  "AOS-Tutor-Keep-Server",
  "AOS-Tutor-Soak-Watchdog",
  "AOS-Tutor-Corpus-Dedupe",
  "AOS-Tutor-Ensure",
  "AOS-Tutor-Dedupe-30m",
  "AOS-Tutor-Perfect-5M",
  "AOS-Tutor-Polish-Pace"
) | ForEach-Object {
  Unregister-ScheduledTask -TaskName $_ -Confirm:$false -ErrorAction SilentlyContinue
  Log "unregistered $_ (if existed)"
}

$viteUp = $false
try {
  $r = Invoke-WebRequest "http://127.0.0.1:8085/" -UseBasicParsing -TimeoutSec 3
  $viteUp = ($r.StatusCode -eq 200)
} catch {}

$status = @{
  stoppedAt = (Get-Date).ToString("o")
  prepWatchersKilled = $true
  observePanesKilled = $true
  viteLeftRunning = $viteUp
  note = "Operator check window. Restart keep:server / open:observe before 9am sprint if needed."
  next = "09:00 npm run test:morning (see MORNING-E2E-RUNBOOK.md)"
} | ConvertTo-Json
Set-Content "C:\AOS\logs\tutor-prep-stopped.json" $status -Encoding UTF8
Log "vite_up=$viteUp status=C:\AOS\logs\tutor-prep-stopped.json"
Log "Stop-Tutor-Prep done"
exit 0
