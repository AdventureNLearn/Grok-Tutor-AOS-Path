$ErrorActionPreference = "Continue"
$root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$tsx = Join-Path $root "node_modules\tsx\dist\cli.mjs"
$pidFile = "C:\AOS\logs\perfect-overnight-5m.pid"
$progress = "C:\AOS\logs\perfect-overnight-progress.json"
$log = "C:\AOS\logs\perfect-overnight-5m-ensure.log"
$out = "C:\AOS\logs\perfect-overnight-5m-console.log"
$err = "C:\AOS\logs\perfect-overnight-5m-console.err.log"
function Log($m) { Add-Content $log ("{0} {1}" -f (Get-Date -Format "o"), $m) -Encoding UTF8 }
$lessons = 0
if (Test-Path $progress) {
  try { $lessons = [int]((Get-Content $progress -Raw | ConvertFrom-Json).lessonsWritten) } catch {}
}
if ($lessons -ge 5000000) { Log "complete lessons=$lessons"; exit 0 }
$n = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -and $_.CommandLine -match "compile-perfect-overnight" } |
  Select-Object -First 1
if ($n) {
  Set-Content $pidFile $n.ProcessId -Encoding ascii
  Log "ok pid=$($n.ProcessId) lessons=$lessons"
  exit 0
}
Log "RESTART lessons=$lessons"
$inner = "node --max-old-space-size=8192 `"$tsx`" scripts/compile-perfect-overnight.mts --target 5000000 >> `"$out`" 2>> `"$err`""
$arg = "/c start `"AOS-Perfect-5M`" /MIN cmd /c `"$inner`""
Start-Process -FilePath "cmd.exe" -ArgumentList $arg -WorkingDirectory $root -WindowStyle Hidden | Out-Null
Start-Sleep -Seconds 8
$n2 = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -and $_.CommandLine -match "compile-perfect-overnight" } |
  Select-Object -First 1
if ($n2) {
  Set-Content $pidFile $n2.ProcessId -Encoding ascii
  Log "started pid=$($n2.ProcessId)"
} else {
  Log "start failed"
}
