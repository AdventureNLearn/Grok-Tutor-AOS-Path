# Keep Grok Tutor Vite alive on :8085 (does not stop soak or other tests).
# Fully detached-friendly. Logs: C:\AOS\logs\tutor-server-watchdog.log
#
#   powershell -File scripts/Keep-Tutor-Server.ps1 [-Minutes 120] [-Port 8085]

param(
  [int]$Minutes = 120,
  [int]$Port = 8085,
  [int]$IntervalSec = 15
)

$ErrorActionPreference = "SilentlyContinue"
$root = Split-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) -Parent
if (-not (Test-Path (Join-Path $root "package.json"))) {
  $root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
}
$logDir = "C:\AOS\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir "tutor-server-watchdog.log"
$pidFile = Join-Path $logDir "tutor-server.pid"

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content -Path $log -Value $line -Encoding UTF8
  Write-Host $line
}

function Test-TutorUp {
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 3
    return ($r.StatusCode -eq 200)
  } catch {
    return $false
  }
}

function Start-TutorVite {
  # Direct node + vite.js (not npm.ps1) + file redirects. Must use Win32_Process
  # Create so the server outlives agent job objects. CSS hangs if Tailwind scans
  # public/corpus — fixed via styles.css @source (src only).
  $node = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
  if (-not $node) { $node = "C:\Program Files\nodejs\node.exe" }
  $vite = Join-Path $root "node_modules\vite\bin\vite.js"
  $outLog = Join-Path $logDir "tutor-vite-out.log"
  $errLog = Join-Path $logDir "tutor-vite-err.log"
  $cmd = "cmd.exe /c `"cd /d $root && `"$node`" --max-old-space-size=8192 `"$vite`" dev --host 127.0.0.1 --port $Port > `"$outLog`" 2> `"$errLog`"`""
  $r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = $cmd
    CurrentDirectory = $root
  }
  if ($r.ProcessId) {
    Set-Content -Path $pidFile -Value $r.ProcessId -Encoding ascii
    Log "STARTED vite launcher pid=$($r.ProcessId) port=$Port"
  } else {
    Log "FAIL start vite return=$($r.ReturnValue)"
  }
  # Wait for ready
  for ($i = 1; $i -le 45; $i++) {
    Start-Sleep -Seconds 1
    if (Test-TutorUp) {
      Log "READY after ${i}s"
      return $true
    }
  }
  Log "WARN not ready after 45s"
  return $false
}

Log "Keep-Tutor-Server start minutes=$Minutes port=$Port interval=${IntervalSec}s root=$root"
if (-not (Test-TutorUp)) {
  [void](Start-TutorVite)
} else {
  Log "already UP"
}

$deadline = (Get-Date).AddMinutes($Minutes)
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds $IntervalSec
  if (-not (Test-TutorUp)) {
    Log "DOWN — restarting (soak/tests left alone)"
    [void](Start-TutorVite)
  }
}
Log "Keep-Tutor-Server done"
exit 0
