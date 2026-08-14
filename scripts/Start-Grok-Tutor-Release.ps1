# Start Grok Tutor (release) — durable server + Edge on SECONDARY display only.
# Does not steal focus on primary workspace monitor.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/Start-Grok-Tutor-Release.ps1
#   powershell -File scripts/Start-Grok-Tutor-Release.ps1 -Url http://127.0.0.1:8085/library

param(
  [string]$Url = "http://127.0.0.1:8085/",
  [int]$Port = 8085,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
if (-not (Test-Path (Join-Path $root "package.json"))) {
  $root = Split-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) -Parent
}
$logDir = "C:\AOS\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Test-Up {
  # curl with hard timeout — WebClient can hang forever on wedged Vite
  try {
    $code = & curl.exe -s -o NUL -w "%{http_code}" --max-time 5 "http://127.0.0.1:$Port/" 2>$null
    return ($code -eq "200")
  } catch { return $false }
}

function Start-Server {
  Write-Host "Starting Tutor on :$Port ..."
  Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -and ($_.CommandLine -match "vite\.js|npm\.cmd run dev")
  } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 1
  # Direct node path — avoids npm.ps1 execution-policy and job-object death.
  $node = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
  if (-not $node) { $node = "C:\Program Files\nodejs\node.exe" }
  $vite = Join-Path $root "node_modules\vite\bin\vite.js"
  $cmd = "cmd.exe /c `"cd /d $root && `"$node`" --max-old-space-size=8192 `"$vite`" dev --host 127.0.0.1 --port $Port > $logDir\tutor-vite-out.log 2> $logDir\tutor-vite-err.log`""
  $r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = $cmd
    CurrentDirectory = $root
  }
  if ($r.ProcessId) {
    Set-Content (Join-Path $logDir "tutor-server.pid") $r.ProcessId -Encoding ascii
    Write-Host "Server launcher PID=$($r.ProcessId)"
  }
  for ($i = 1; $i -le 20; $i++) {
    Start-Sleep -Seconds 2
    if (Test-Up) {
      Write-Host "READY after $($i * 2)s"
      return $true
    }
  }
  Write-Host "WARN: server not ready — check $logDir\tutor-vite-out.log"
  return $false
}

function Open-Secondary([string]$TargetUrl) {
  Add-Type -AssemblyName System.Windows.Forms
  $secondary = [System.Windows.Forms.Screen]::AllScreens | Where-Object { -not $_.Primary } | Select-Object -First 1
  if (-not $secondary) {
    Write-Host "No secondary monitor — opening default Edge (may use primary)."
    $edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($edge) { Start-Process $edge -ArgumentList @("--new-window", $TargetUrl) }
    return
  }
  $b = $secondary.WorkingArea
  $x = $b.X + 40
  $y = $b.Y + 40
  $w = [Math]::Min(1400, $b.Width - 80)
  $h = [Math]::Min(900, $b.Height - 80)
  $edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
  $profile = Join-Path $logDir "edge-tutor-monitor-profile"
  New-Item -ItemType Directory -Force -Path $profile | Out-Null
  $args = @(
    "--new-window",
    "--window-position=$x,$y",
    "--window-size=$w,$h",
    "--user-data-dir=$profile",
    "--no-first-run",
    "--no-default-browser-check",
    $TargetUrl
  )
  Start-Process -FilePath $edge -ArgumentList $args
  Write-Host "Edge on secondary ($x,$y) $TargetUrl"
}

# Keep watchdog if missing
$keep = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match "Keep-Tutor-Server" } | Select-Object -First 1
if (-not $keep) {
  $null = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\scripts\Keep-Tutor-Server.ps1`" -Minutes 480 -Port $Port -IntervalSec 45"
    CurrentDirectory = $root
  }
  Write-Host "Keep-Tutor-Server started"
}

if (-not (Test-Up)) {
  [void](Start-Server)
} else {
  Write-Host "Server already UP on :$Port"
}

if (-not $NoBrowser) {
  Open-Secondary $Url
}

Write-Host ""
Write-Host "Grok Tutor release"
Write-Host "  Hive:     http://127.0.0.1:$Port/"
Write-Host "  Library:  http://127.0.0.1:$Port/library"
Write-Host "  Plan Lab: http://127.0.0.1:$Port/labs/cad"
Write-Host "  Credits:  http://127.0.0.1:$Port/credits"

