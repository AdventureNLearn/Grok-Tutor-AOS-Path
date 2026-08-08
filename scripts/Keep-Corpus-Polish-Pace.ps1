# Paced overnight polish - one limited batch per run, stop at 07:00.
# Every batch: full-corpus dupe index + report clean vs dupes.
#
#   powershell -File scripts/Keep-Corpus-Polish-Pace.ps1
#   powershell -File scripts/Keep-Corpus-Polish-Pace.ps1 -BatchSize 2000 -StopAt 2026-08-08T07:00:00

param(
  [int]$BatchSize = 2000,
  [string]$StopAt = "2026-08-08T07:00:00",
  [string]$Roots = "perfect-overnight",
  [string]$Tier = "public"
)

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$tsx = Join-Path $root "node_modules\tsx\dist\cli.mjs"
$logDir = "C:\AOS\logs\corpus-polish-pace"
$statePath = Join-Path $logDir "pace-state.json"
$logPath = Join-Path $logDir "pace.log"
$countsPath = Join-Path $logDir "LATEST-COUNTS.json"
$countsMd = Join-Path $logDir "LATEST-COUNTS.md"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content -Path $logPath -Value $line -Encoding UTF8
  Write-Host $line
}

try {
  $deadline = [datetime]::Parse($StopAt)
} catch {
  Log "bad StopAt=$StopAt"
  exit 0
}

if ((Get-Date) -ge $deadline) {
  Log "past deadline $deadline - polish pace idle"
  exit 0
}

$lockPath = Join-Path $logDir "pace.lock"
if (Test-Path $lockPath) {
  try {
    $lockAge = ((Get-Date) - (Get-Item $lockPath).LastWriteTime).TotalMinutes
    if ($lockAge -lt 30) {
      Log "lock present ageMin=$([math]::Round($lockAge,1)) - skip"
      exit 0
    }
    Log "stale lock ageMin=$([math]::Round($lockAge,1)) - taking over"
  } catch {}
}
Set-Content $lockPath (Get-Date -Format "o") -Encoding ascii

try {
  $offset = 0
  $cumWritten = 0
  $cumDupes = 0
  if (Test-Path $statePath) {
    try {
      $st = Get-Content $statePath -Raw | ConvertFrom-Json
      if ($null -ne $st.offset) { $offset = [int]$st.offset }
      if ($null -ne $st.cumulativeWritten) { $cumWritten = [int]$st.cumulativeWritten }
      if ($null -ne $st.cumulativeDupes) { $cumDupes = [int]$st.cumulativeDupes }
    } catch {}
  }
  $latestClean = "C:\AOS\logs\corpus-polish-clean\LATEST-CLEAN.json"
  if (Test-Path $latestClean) {
    try {
      $lc = Get-Content $latestClean -Raw | ConvertFrom-Json
      if ($null -ne $lc.nextOffset -and [int]$lc.nextOffset -gt $offset) {
        $offset = [int]$lc.nextOffset
      }
    } catch {}
  }

  $minsLeft = [math]::Max(1, ($deadline - (Get-Date)).TotalMinutes)
  Log "PACE batch start offset=$offset size=$BatchSize minsLeft=$([math]::Round($minsLeft,0)) roots=$Roots"
  Log "dupe-check=ENTIRE corpus index + full _polished library every batch"

  $out = Join-Path $logDir "batch-out.log"
  $err = Join-Path $logDir "batch-err.log"
  # --full-corpus-index is default in cleaner
  $p = Start-Process -FilePath "node.exe" -ArgumentList @(
    $tsx,
    "scripts/corpus-polish-clean.mts",
    "--roots", $Roots,
    "--batch-size", "$BatchSize",
    "--offset", "$offset",
    "--full-corpus-index"
  ) -WorkingDirectory $root -Wait -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $out `
    -RedirectStandardError $err

  Log "clean exit=$($p.ExitCode)"
  if (Test-Path $err) {
    $errTail = Get-Content $err -Tail 5 -ErrorAction SilentlyContinue
    if ($errTail) { Log "clean-err: $($errTail -join ' | ')" }
  }

  $written = 0
  $dups = 0
  $next = $offset + $BatchSize
  $total = 0
  $done = $false
  $uniqueClean = 0
  $polishedOnDisk = 0
  $uniqueBefore = 0
  if (Test-Path $latestClean) {
    try {
      $lc = Get-Content $latestClean -Raw | ConvertFrom-Json
      $written = [int]$lc.stats.written
      $dups = [int]$lc.stats.dupSkip
      $total = [int]$lc.total
      $done = [bool]$lc.done
      if ($lc.counts) {
        $uniqueClean = [int]$lc.counts.uniqueClean
        $polishedOnDisk = [int]$lc.counts.polishedFilesOnDisk
        $uniqueBefore = [int]$lc.counts.uniqueBefore
      }
      if ($null -ne $lc.nextOffset) {
        $next = [int]$lc.nextOffset
      } elseif ($done) {
        $next = $total
      }
    } catch {}
  }

  $cumWritten += $written
  $cumDupes += $dups

  Log "BATCH written(new)=$written dupes(vs full corpus)=$dups"
  Log "CUMULATIVE written=$cumWritten dupes=$cumDupes uniqueCleanIndex=$uniqueClean polishedOnDisk=$polishedOnDisk"

  # Full polished audit every batch so CLEAN count is against entire polished set
  $pol = Join-Path $root "public\corpus\_polished"
  $auditClean = $null
  $auditSoft = $null
  $auditHard = $null
  $auditN = $null
  $auditPct = $null
  if (Test-Path $pol) {
    Log "FULL audit of entire _polished library (public tier)"
    # Reset audit global hashes so A10 is within full polished tree this run
    $auditHash = "C:\AOS\logs\corpus-polish-audit\global-body-hashes.jsonl"
    Set-Content $auditHash "" -Encoding utf8
    $ap = Start-Process -FilePath "node.exe" -ArgumentList @(
      $tsx,
      "scripts/corpus-polish-audit.mts",
      "--root", $pol,
      "--tier", $Tier
    ) -WorkingDirectory $root -Wait -PassThru -WindowStyle Hidden `
      -RedirectStandardOutput (Join-Path $logDir "audit-full.out.log") `
      -RedirectStandardError (Join-Path $logDir "audit-full.err.log")
    Log "audit exit=$($ap.ExitCode)"
    if (Test-Path "C:\AOS\logs\corpus-polish-audit\LATEST.json") {
      try {
        $a = Get-Content "C:\AOS\logs\corpus-polish-audit\LATEST.json" -Raw | ConvertFrom-Json
        $auditClean = [int]$a.clean
        $auditSoft = [int]$a.softFail
        $auditHard = [int]$a.hardFail
        $auditN = [int]$a.audited
        $auditPct = $a.cleanPct
        Log "CLEAN (12/12 pass)=$auditClean / $auditN ($auditPct%) | softFail=$auditSoft hardFail=$auditHard"
        if ($a.byFail) {
          Log "failGates=$($a.byFail | ConvertTo-Json -Compress)"
        }
      } catch {
        Log "audit parse soft-fail"
      }
    }
  }

  $counts = @{
    at = (Get-Date).ToString("o")
    batch = @{
      writtenNew = $written
      dupesVsFullCorpus = $dups
      offset = $offset
      nextOffset = $next
      sourceTotal = $total
    }
    cumulative = @{
      writtenNew = $cumWritten
      dupes = $cumDupes
    }
    corpusWide = @{
      uniqueCleanIndex = $uniqueClean
      uniqueBeforeBatch = $uniqueBefore
      polishedFilesOnDisk = $polishedOnDisk
    }
    cleanAudit = @{
      cleanPass = $auditClean
      audited = $auditN
      softFail = $auditSoft
      hardFail = $auditHard
      cleanPct = $auditPct
      note = "cleanPass = lessons in _polished that pass all public gates A1-A12 after full-library audit"
    }
  }
  $counts | ConvertTo-Json -Depth 6 | Set-Content $countsPath -Encoding UTF8
  # also mirror next to cleaner counts
  Copy-Item $countsPath "C:\AOS\logs\corpus-polish-clean\PACE-COUNTS.json" -Force -ErrorAction SilentlyContinue

  $md = @"
# Polish pace counts (full-corpus check every batch)

**At:** $($counts.at)

## This batch
| Metric | Count |
|--------|------:|
| **New unique written** | **$written** |
| **Dupes (matched entire corpus index)** | **$dups** |
| Source offset | $offset -> $next of $total |

## Cumulative (session pace)
| Metric | Count |
|--------|------:|
| **New unique written** | **$cumWritten** |
| **Dupes skipped** | **$cumDupes** |

## Corpus-wide
| Metric | Count |
|--------|------:|
| **Unique clean index** | **$uniqueClean** |
| Polished files on disk | $polishedOnDisk |

## Clean audit (entire _polished)
| Metric | Count |
|--------|------:|
| **CLEAN pass (12/12)** | **$auditClean** |
| Audited | $auditN |
| Soft fail | $auditSoft |
| Hard fail | $auditHard |
| Clean % | $auditPct

"@
  Set-Content $countsMd $md -Encoding UTF8
  Copy-Item $countsMd "C:\AOS\logs\corpus-polish-clean\PACE-COUNTS.md" -Force -ErrorAction SilentlyContinue
  Log "COUNTS written -> $countsPath"

  $state = @{
    updatedAt = (Get-Date).ToString("o")
    offset = $next
    lastWritten = $written
    lastDups = $dups
    cumulativeWritten = $cumWritten
    cumulativeDupes = $cumDupes
    uniqueClean = $uniqueClean
    polishedOnDisk = $polishedOnDisk
    auditClean = $auditClean
    auditSoft = $auditSoft
    auditHard = $auditHard
    total = $total
    done = $done
    batchSize = $BatchSize
    stopAt = $deadline.ToString("o")
    roots = $Roots
  } | ConvertTo-Json
  Set-Content $statePath $state -Encoding UTF8

  if ($done) {
    Log "SOURCE PASS COMPLETE for $Roots at offset=$next"
  }
} finally {
  Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
}

Log "PACE batch end"
exit 0
