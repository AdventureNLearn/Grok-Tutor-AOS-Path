# Full simulation instance: durable complete-suite soak + LIVE.json + secondary 4-pane observe
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/Start-Full-Sim-Instance.ps1
#   powershell -File scripts/Start-Full-Sim-Instance.ps1 -Minutes 120
param(
  [string]$BaseUrl = "http://127.0.0.1:8085",
  [int]$Minutes = 120,
  [switch]$NoObserve
)
$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$logDir = "C:\AOS\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
function Log($m) {
  $l = "{0} {1}" -f (Get-Date -Format o), $m
  Add-Content "$logDir\full-sim-instance.log" $l -Encoding UTF8
  Write-Host $l
}
function TutorUp {
  try {
    $wc = New-Object Net.WebClient
    $wc.Headers.Add("User-Agent","FullSim")
    $null = $wc.DownloadString(($BaseUrl.TrimEnd('/') + "/"))
    return $true
  } catch { return $false }
}
if (-not (TutorUp)) {
  Log "Starting Tutor server..."
  $null = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = "cmd.exe /c `"cd /d $root && set NODE_OPTIONS=--max-old-space-size=4096 && npm.cmd run dev -- --host 127.0.0.1 --port 8085 > $logDir\tutor-vite-out.log 2> $logDir\tutor-vite-err.log`""
    CurrentDirectory = $root
  }
  for ($i=1; $i -le 20; $i++) {
    Start-Sleep -Seconds 2
    if (TutorUp) { Log "Tutor ready"; break }
  }
}
if (-not (TutorUp)) { Log "FATAL tutor down"; exit 1 }

# Detached complete-suite soak (writes public/soak/LIVE.json)
Log "Starting complete-suite soak minutes=$Minutes"
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root "scripts\Start-Soak-1h.ps1") -BaseUrl $BaseUrl -Minutes $Minutes

# Secondary 4-pane observe (does not touch primary)
if (-not $NoObserve) {
  Log "Opening quad observe on secondary"
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root "scripts\Open-Quad-Observe.ps1") -WatchMinutes $Minutes
}

Log "FULL SIM INSTANCE LIVE"
Log "  Observe board: $BaseUrl/soak/observe.html"
Log "  LIVE feed:     $BaseUrl/soak/LIVE.json  (also public/soak/LIVE.json)"
Log "  Engine:        sim-observable-1h complete-suite soak"
Log "  Logs:          $logDir\soak-1h-stdout.log  $logDir\full-sim-instance.log"
