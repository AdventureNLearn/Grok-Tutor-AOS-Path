# Register paced polish through 07:00 (one batch every IntervalMin).
# Does NOT thrash CPU — leaves headroom for soak + 5M compile.
#
#   powershell -File scripts/Start-Polish-Pace-Until-7am.ps1
#   powershell -File scripts/Start-Polish-Pace-Until-7am.ps1 -BatchSize 2000 -IntervalMin 15

param(
  [int]$BatchSize = 2000,
  [double]$IntervalMin = 3.5,
  [string]$StopAt = "2026-08-08T07:00:00",
  [string]$Roots = "perfect-overnight"
)

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$logDir = "C:\AOS\logs\corpus-polish-pace"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir "schedule.log"

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content $log $line -Encoding UTF8
  Write-Host $line
}

# Stop only thrashing full-pipeline runners (never kill soak/5M/pace/index rebuild)
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -and (
    $_.CommandLine -match "Resume-Complete\.ps1" -or
    $_.CommandLine -match "Run-Corpus-Clean-And-Audit-Complete"
  )
} | ForEach-Object {
  Log "stop thrash pid=$($_.ProcessId)"
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

$deadline = [datetime]::Parse($StopAt)
$mins = [math]::Max(5, [math]::Ceiling(($deadline - (Get-Date)).TotalMinutes))
$batchesLeft = [math]::Max(1, [math]::Floor($mins / [math]::Max(0.5, $IntervalMin)))
$estFiles = $batchesLeft * $BatchSize
# Windows Task Scheduler TimeSpan: support fractional minutes (e.g. 3.5 -> 3m30s)
$intervalTs = [TimeSpan]::FromMinutes($IntervalMin)
if ($intervalTs.TotalSeconds -lt 60) {
  # Scheduler minimum practical repeat is 1 minute on some hosts; keep requested floor at 60s
  $intervalTs = [TimeSpan]::FromSeconds(60)
  Log "interval raised to 60s (scheduler floor)"
}

Log "=== PACE SCHEDULE until $deadline ==="
Log "interval=${IntervalMin}m ($([math]::Round($intervalTs.TotalSeconds,0))s) batchSize=$BatchSize batches~$batchesLeft estFiles~$estFiles roots=$Roots"

$task = "AOS-Tutor-Polish-Pace"
Unregister-ScheduledTask -TaskName $task -Confirm:$false -ErrorAction SilentlyContinue

$arg = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\scripts\Keep-Corpus-Polish-Pace.ps1`" -BatchSize $BatchSize -StopAt $StopAt -Roots $Roots -AlsoAuditSample"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $arg
$start = (Get-Date).AddSeconds(15)
$duration = $deadline - $start
if ($duration.TotalMinutes -lt $IntervalMin) {
  $duration = $intervalTs.Add([TimeSpan]::FromMinutes(5))
}
$trigger = New-ScheduledTaskTrigger -Once -At $start -RepetitionInterval $intervalTs -RepetitionDuration $duration
$prin = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
$set = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 25) `
  -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $task -Action $action -Trigger $trigger -Principal $prin -Settings $set -Force | Out-Null
Start-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue

# Also ensure Stop-Tutor-Prep unregisters this task — patch if needed via schedule note
$schedule = @{
  rescheduledAt = (Get-Date).ToString("o")
  stopAt = $deadline.ToString("o")
  intervalMin = $IntervalMin
  batchSize = $BatchSize
  batchesApprox = $batchesLeft
  estFilesThrough7am = $estFiles
  roots = $Roots
  task = $task
  paceScript = "$root\scripts\Keep-Corpus-Polish-Pace.ps1"
  state = "$logDir\pace-state.json"
  log = $logPath = "$logDir\pace.log"
  note = "Steady polish pace only - not full-corpus thrash. Stops at 7am. Unique _polished accumulates."
} | ConvertTo-Json -Depth 4
Set-Content (Join-Path $logDir "schedule.json") $schedule -Encoding UTF8
Copy-Item (Join-Path $logDir "schedule.json") "C:\AOS\logs\tutor-corpus-portable\polish-pace-schedule.json" -Force -ErrorAction SilentlyContinue

Log "task $task registered; first fire ~$start"
Log "est through 7am: $batchesLeft batches x $BatchSize ~ $estFiles source files processed"
Write-Host $schedule
exit 0
