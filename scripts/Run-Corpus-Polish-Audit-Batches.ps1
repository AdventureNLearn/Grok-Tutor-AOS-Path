# Run corpus polish audit in batches until complete.
#
#   powershell -File scripts/Run-Corpus-Polish-Audit-Batches.ps1
#   powershell -File scripts/Run-Corpus-Polish-Audit-Batches.ps1 -BatchSize 1000 -Tier public
#   powershell -File scripts/Run-Corpus-Polish-Audit-Batches.ps1 -Roots "balanced-soak,perfect-overnight"

param(
  [int]$BatchSize = 1000,
  [string]$Tier = "public",
  [string]$Roots = "balanced-soak,perfect-overnight,full-spectrum,reasoning-tracks",
  [int]$StartOffset = 0,
  [int]$MaxBatches = 500
)

$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$tsx = Join-Path $root "node_modules\tsx\dist\cli.mjs"
$logDir = "C:\AOS\logs\corpus-polish-audit"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$master = Join-Path $logDir "batch-runner.log"

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "o"), $m
  Add-Content -Path $master -Value $line -Encoding UTF8
  Write-Host $line
}

Log "START tier=$Tier batchSize=$BatchSize roots=$Roots offset=$StartOffset"
$offset = $StartOffset
$batch = 0

while ($batch -lt $MaxBatches) {
  $batch++
  Log "BATCH $batch offset=$offset size=$BatchSize"
  $out = Join-Path $logDir "runner-batch-$batch.out.log"
  $err = Join-Path $logDir "runner-batch-$batch.err.log"
  $p = Start-Process -FilePath "node.exe" -ArgumentList @(
    $tsx,
    "scripts/corpus-polish-audit.mts",
    "--roots", $Roots,
    "--tier", $Tier,
    "--batch-size", "$BatchSize",
    "--offset", "$offset"
  ) -WorkingDirectory $root -Wait -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $out -RedirectStandardError $err

  Log "batch $batch exit=$($p.ExitCode)"
  $latest = Join-Path $logDir "LATEST.json"
  if (-not (Test-Path $latest)) {
    Log "FATAL no LATEST.json"
    exit 1
  }
  $sum = Get-Content $latest -Raw | ConvertFrom-Json
  Log ("batch stats audited={0} clean={1} soft={2} hard={3} cleanPct={4} next={5}" -f `
    $sum.audited, $sum.clean, $sum.softFail, $sum.hardFail, $sum.cleanPct, $sum.nextOffset)

  if ($sum.done -eq $true -or $null -eq $sum.nextOffset) {
    Log "ALL BATCHES DONE totalInCorpus=$($sum.totalInCorpus)"
    break
  }
  $offset = [int]$sum.nextOffset
}

Log "RUNNER COMPLETE"
exit 0
