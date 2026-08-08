# Master: continuous sim-only soak + logging + 30m dedupe until 07:00.
# Durable soak = node + tsx/cli.mjs.
# Watchdogs may die under agent job objects; recurring Ensure task every 2 min
# restarts soak if LIVE stalls. Dedupe every 30 min via scheduled task.
#
#   powershell -File scripts/Start-Continuous-Until-7am.ps1
#   powershell -File scripts/Start-Continuous-Until-7am.ps1 -StopAt "2026-08-08T07:00:00"

param([string]$StopAt = "")

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$logDir = "C:\AOS\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$masterLog = Join-Path $logDir "continuous-until-7am-master.log"
$tsxCli = Join-Path $root "node_modules\tsx\dist\cli.mjs"
$portableDir = Join-Path $logDir "tutor-corpus-portable"
New-Item -ItemType Directory -Force -Path $portableDir | Out-Null

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content -Path $masterLog -Value $line -Encoding UTF8
  Write-Host $line
}

function Start-DetachedPowerShell {
  param([string]$ArgumentList)
  # UseShellExecute detaches from agent job objects so overnight loops survive
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "powershell.exe"
  $psi.Arguments = $ArgumentList
  $psi.UseShellExecute = $true
  $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
  $p = [System.Diagnostics.Process]::Start($psi)
  return $p
}

function Register-RecurringTask {
  param(
    [string]$Name,
    [string]$Argument,
    [datetime]$StartAt,
    [datetime]$EndAt,
    [timespan]$Interval,
    [timespan]$ExecLimit = (New-TimeSpan -Minutes 10)
  )
  Unregister-ScheduledTask -TaskName $Name -Confirm:$false -ErrorAction SilentlyContinue
  $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $Argument
  $duration = $EndAt - $StartAt
  if ($duration.TotalMinutes -lt 5) { $duration = New-TimeSpan -Minutes 5 }
  $trigger = New-ScheduledTaskTrigger -Once -At $StartAt -RepetitionInterval $Interval -RepetitionDuration $duration
  $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
  $settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit $ExecLimit `
    -MultipleInstances IgnoreNew
  Register-ScheduledTask -TaskName $Name -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
  Start-ScheduledTask -TaskName $Name -ErrorAction SilentlyContinue
  Log "recurring-task $Name interval=$($Interval.TotalMinutes)m until=$($EndAt.ToString('s'))"
}

if (-not $StopAt) {
  $d = Get-Date -Hour 7 -Minute 0 -Second 0
  if ((Get-Date) -ge $d) { $d = $d.AddDays(1) }
  $StopAt = $d.ToString("o")
}
$deadline = [datetime]::Parse($StopAt)
$mins = [math]::Max(15, [math]::Ceiling(($deadline - (Get-Date)).TotalMinutes))
$stopIso = $deadline.ToString("yyyy-MM-ddTHH:mm:ss")
$now = Get-Date

Log "=== MASTER RESCHEDULE until $deadline (mins=$mins) ==="

# Stop prior stack
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | ForEach-Object {
  $cl = $_.CommandLine
  if (-not $cl -or $_.ProcessId -eq $PID) { return }
  if ($cl -match "continuous-balanced-soak|Keep-Balanced-Soak|Keep-Corpus-Dedupe|Keep-Tutor-Server|Ensure-Tutor-Prep|Run-FullSpectrum|dedupe-corpus|sim-observable-1h") {
    Log "stop prior pid=$($_.ProcessId)"
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
}
@(
  "AOS-Tutor-Keep-Server",
  "AOS-Tutor-Soak-Watchdog",
  "AOS-Tutor-Corpus-Dedupe",
  "AOS-Tutor-Ensure",
  "AOS-Tutor-Dedupe-30m",
  "AOS-Tutor-Prep-Stop-7am"
) | ForEach-Object {
  Unregister-ScheduledTask -TaskName $_ -Confirm:$false -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

if (-not (Test-Path $tsxCli)) {
  Log "FATAL missing $tsxCli"
  exit 1
}

# 1) Vite keep-alive (detached)
$ks = Start-DetachedPowerShell -ArgumentList (
  "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\scripts\Keep-Tutor-Server.ps1`" -Minutes $mins -IntervalSec 30"
)
Log "keep-server pid=$($ks.Id) (detached)"

# Wait vite
$up = $false
for ($i = 1; $i -le 30; $i++) {
  try {
    if ((Invoke-WebRequest "http://127.0.0.1:8085/" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200) {
      $up = $true; break
    }
  } catch {}
  Start-Sleep -Seconds 1
}
Log "vite_up=$up"

# 2) Primary soak: node + tsx cli (durable PID)
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outLog = Join-Path $logDir "balanced-soak-console.log"
$errLog = Join-Path $logDir "balanced-soak-console.err.log"
if (Test-Path $outLog) {
  Move-Item $outLog (Join-Path $logDir "balanced-soak-console.$stamp.log") -Force -ErrorAction SilentlyContinue
}
if (Test-Path $errLog) {
  Move-Item $errLog (Join-Path $logDir "balanced-soak-console.$stamp.err.log") -Force -ErrorAction SilentlyContinue
}

$soak = Start-Process -FilePath "node.exe" -ArgumentList @(
  $tsxCli,
  "scripts/continuous-balanced-soak.mts",
  "--sim-only",
  "--stop-at", $stopIso
) -WorkingDirectory $root -WindowStyle Hidden -PassThru `
  -RedirectStandardOutput $outLog -RedirectStandardError $errLog
Set-Content (Join-Path $logDir "balanced-soak.pid") $soak.Id -Encoding ascii
Log "soak node-pid=$($soak.Id) stop=$stopIso"

# 3) Detached stall watchdog (best-effort long loop)
$watch = Start-DetachedPowerShell -ArgumentList (
  "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\scripts\Keep-Balanced-Soak.ps1`" -StopAt $stopIso -StallSec 45 -PollSec 15"
)
Log "soak-watchdog pid=$($watch.Id) (detached)"
Set-Content (Join-Path $logDir "balanced-soak-watchdog.pid") $watch.Id -Encoding ascii

# 4) Detached 30m dedupe loop (best-effort)
$dedupe = Start-DetachedPowerShell -ArgumentList (
  "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\scripts\Keep-Corpus-Dedupe.ps1`" -StopAt $stopIso -IntervalMin 30"
)
Log "dedupe-watchdog pid=$($dedupe.Id) (detached)"
Set-Content (Join-Path $logDir "corpus-dedupe-watchdog.pid") $dedupe.Id -Encoding ascii

# 5) Recurring Ensure every 2 min (survives process death)
Register-RecurringTask -Name "AOS-Tutor-Ensure" -StartAt $now.AddSeconds(30) -EndAt $deadline `
  -Interval (New-TimeSpan -Minutes 2) -ExecLimit (New-TimeSpan -Minutes 5) -Argument (
  "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\scripts\Ensure-Tutor-Prep.ps1`" -StopAt $stopIso -StallSec 90"
)

# 6) Recurring dedupe every 30 min
Register-RecurringTask -Name "AOS-Tutor-Dedupe-30m" -StartAt $now.AddMinutes(1) -EndAt $deadline `
  -Interval (New-TimeSpan -Minutes 30) -ExecLimit (New-TimeSpan -Minutes 15) -Argument (
  "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command `"& { Set-Location '$root'; node.exe '$tsxCli' scripts/dedupe-corpus.mts *>> 'C:\AOS\logs\corpus-dedupe-scheduled.log' }`""
)

# Immediate dedupe
$d0 = Start-Process -FilePath "node.exe" -ArgumentList @($tsxCli, "scripts/dedupe-corpus.mts") `
  -WorkingDirectory $root -Wait -PassThru -WindowStyle Hidden `
  -RedirectStandardOutput (Join-Path $logDir "corpus-dedupe-last.out.log") `
  -RedirectStandardError (Join-Path $logDir "corpus-dedupe-last.err.log")
Log "initial dedupe exit=$($d0.ExitCode)"

# 7) 7am stop task
$task = "AOS-Tutor-Prep-Stop-7am"
Unregister-ScheduledTask -TaskName $task -Confirm:$false -ErrorAction SilentlyContinue
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument (
  "-NoProfile -ExecutionPolicy Bypass -File `"$root\scripts\Stop-Tutor-Prep.ps1`""
)
$trigger = New-ScheduledTaskTrigger -Once -At $deadline
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName $task -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Log "stop-task next=$((Get-ScheduledTaskInfo -TaskName $task).NextRunTime)"

$schedule = @{
  rescheduledAt = (Get-Date).ToString("o")
  stopAt = $deadline.ToString("o")
  minutes = $mins
  mode = "sim-only continuous balanced soak + detached watchdogs + 2m ensure + 30m dedupe + 7am stop"
  pids = @{
    keepServer = $ks.Id
    soak = $soak.Id
    soakWatchdog = $watch.Id
    dedupeWatchdog = $dedupe.Id
  }
  tasks = @(
    "AOS-Tutor-Ensure",
    "AOS-Tutor-Dedupe-30m",
    "AOS-Tutor-Prep-Stop-7am"
  )
  logs = @{
    master = $masterLog
    soakOut = $outLog
    soakErr = $errLog
    live = "$root\public\soak\LIVE.json"
    systemCounts = "$root\public\corpus\SYSTEM_COUNTS.json"
    portable = $portableDir
    schedule = "$logDir\continuous-until-7am-schedule.json"
    ensure = "$logDir\ensure-tutor-prep.log"
    watchdog = "$logDir\balanced-soak-watchdog.log"
    dedupeWatchdog = "$logDir\corpus-dedupe-watchdog.log"
  }
} | ConvertTo-Json -Depth 5
Set-Content (Join-Path $logDir "continuous-until-7am-schedule.json") $schedule -Encoding UTF8
Copy-Item (Join-Path $logDir "continuous-until-7am-schedule.json") $portableDir -Force

Start-Sleep -Seconds 10
$soakAlive = $false
try { $soakAlive = [bool](Get-Process -Id $soak.Id -ErrorAction SilentlyContinue) } catch {}
$liveAge = -1
$cycles = 0
if (Test-Path "$root\public\soak\LIVE.json") {
  $liveAge = [math]::Round(((Get-Date) - (Get-Item "$root\public\soak\LIVE.json").LastWriteTime).TotalSeconds, 1)
  try { $cycles = (Get-Content "$root\public\soak\LIVE.json" -Raw | ConvertFrom-Json).cycles } catch {}
}
Log "health soakAlive=$soakAlive liveAgeSec=$liveAge cycles=$cycles"
if (-not $soakAlive) {
  Log "WARN soak dead early - Ensure task will restart within 2 min"
}

Log "=== RUNNING until $deadline ==="
Write-Host $schedule
exit 0
