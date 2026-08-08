# Run corpus dedupe every 30 minutes until StopAt (default 07:00).
# Portable offline archive + SYSTEM_COUNTS (system + active run).
#
#   powershell -File scripts/Keep-Corpus-Dedupe.ps1 -StopAt 2026-08-08T07:00:00

param(
  [string]$StopAt = "2026-08-08T07:00:00",
  [int]$IntervalMin = 30
)

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$tsxCli = Join-Path $root "node_modules\tsx\dist\cli.mjs"
$log = "C:\AOS\logs\corpus-dedupe-watchdog.log"
New-Item -ItemType Directory -Force -Path "C:\AOS\logs" | Out-Null

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content -Path $log -Value $line -Encoding UTF8
  Write-Host $line
}

# Single-instance guard (process + scheduled-task dual launch)
$mutex = $null
try {
  $created = $false
  $mutex = New-Object System.Threading.Mutex($false, "Global\AOS-Tutor-Keep-Corpus-Dedupe", [ref]$created)
  if (-not $mutex.WaitOne(0)) {
    Log "another Keep-Corpus-Dedupe instance running — exit"
    exit 0
  }
} catch {
  Log "mutex soft-fail (continuing): $($_.Exception.Message)"
}

$deadline = [datetime]::Parse($StopAt)
Log "Keep-Corpus-Dedupe START interval=${IntervalMin}m deadline=$deadline"

function Invoke-Dedupe {
  if (-not (Test-Path $tsxCli)) {
    Log "tsx cli missing at $tsxCli"
    return
  }
  # Durable: node + tsx/cli.mjs (tsx.cmd can exit early)
  $p = Start-Process -FilePath "node.exe" -ArgumentList @(
    $tsxCli,
    "scripts/dedupe-corpus.mts"
  ) -WorkingDirectory $root -Wait -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput "C:\AOS\logs\corpus-dedupe-last.out.log" `
    -RedirectStandardError "C:\AOS\logs\corpus-dedupe-last.err.log"
  Log "dedupe exit=$($p.ExitCode)"
  if (Test-Path (Join-Path $root "public\corpus\SYSTEM_COUNTS.json")) {
    try {
      $c = Get-Content (Join-Path $root "public\corpus\SYSTEM_COUNTS.json") -Raw | ConvertFrom-Json
      Log "counts unique=$($c.system.unique) scanned=$($c.system.scanned) dupesArchived=$($c.system.duplicatesArchived) activeLessons=$($c.activeRun.lessonsWritten)"
    } catch {
      Log "counts parse soft"
    }
  }
}

# immediate cycle
Invoke-Dedupe

while ((Get-Date) -lt $deadline) {
  $next = (Get-Date).AddMinutes($IntervalMin)
  if ($next -gt $deadline) { break }
  Log "sleep until $next"
  while ((Get-Date) -lt $next -and (Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 30
  }
  if ((Get-Date) -ge $deadline) { break }
  Invoke-Dedupe
}

# final dedupe at end of window
Invoke-Dedupe
if ($mutex) {
  try { $mutex.ReleaseMutex() | Out-Null } catch {}
  try { $mutex.Dispose() } catch {}
}
Log "Keep-Corpus-Dedupe DONE"
exit 0
