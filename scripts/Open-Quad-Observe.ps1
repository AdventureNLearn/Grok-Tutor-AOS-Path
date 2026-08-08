# Open FOUR separate Edge windows on secondary monitor - equal quadrants.
# Fully automated. No operator clicks.
# TL=log  TR=spine  BL=integrity  BR=four-agent
#
# Durable design:
#  - Launch each pane via WMI (outside agent job — survives launcher exit)
#  - WorkingArea 2x2 placement (Windows Snap-equivalent bounds)
#  - Start Watch-Quad-Observe watchdog (reopens any pane that dies)
#  - Snap Assist is OPTIONAL (-UseSnap) — default off (key thrash was unstable)

param(
  [switch]$UseSnap,
  [int]$WatchMinutes = 60,
  [switch]$NoWatchdog
)

$ErrorActionPreference = "SilentlyContinue"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$watchHelper = Join-Path $here "Watch-Quad-Observe.ps1"
$snapHelper = Join-Path $here "Snap-Quad-Windows.ps1"

$base = "http://127.0.0.1:8085"
$urls = @(
  "$base/soak/observe-log.html",
  "$base/soak/pane-spine.html",
  "$base/soak/pane-integrity.html",
  "$base/soak/pane-four.html"
)
$names = @("Q1-Log", "Q2-Spine", "Q3-Integrity", "Q4-FourAgent")
$markers = @("edge-quad-q1-log", "edge-quad-q2-spine", "edge-quad-q3-integrity", "edge-quad-q4-four")
$profileRoots = @(
  "C:\AOS\logs\edge-quad-q1-log",
  "C:\AOS\logs\edge-quad-q2-spine",
  "C:\AOS\logs\edge-quad-q3-integrity",
  "C:\AOS\logs\edge-quad-q4-four"
)

$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) {
  $edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
}
if (-not (Test-Path $edge)) { Write-Host "Edge not found"; exit 1 }

Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinPlace {
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  public const int SW_RESTORE = 9;
  public static readonly IntPtr HWND_TOP = new IntPtr(0);
  public const uint SWP_SHOWWINDOW = 0x0040;
}
"@

$screens = [System.Windows.Forms.Screen]::AllScreens
$target = $screens | Where-Object { -not $_.Primary } | Select-Object -First 1
if (-not $target) { $target = [System.Windows.Forms.Screen]::PrimaryScreen }

$area = $target.WorkingArea
$ox = [int]$area.X
$oy = [int]$area.Y
$fullW = [int]$area.Width
$fullH = [int]$area.Height
$qw = [int][Math]::Floor($fullW / 2)
$qh = [int][Math]::Floor($fullH / 2)
$quads = @(
  @{ X = $ox;       Y = $oy;       W = $qw;            H = $qh },
  @{ X = $ox + $qw; Y = $oy;       W = ($fullW - $qw); H = $qh },
  @{ X = $ox;       Y = $oy + $qh; W = $qw;            H = ($fullH - $qh) },
  @{ X = $ox + $qw; Y = $oy + $qh; W = ($fullW - $qw); H = ($fullH - $qh) }
)

Write-Host ("Target monitor: {0} WorkingArea={1},{2} {3}x{4}" -f $target.DeviceName, $ox, $oy, $fullW, $fullH)
Write-Host "Layout: WorkingArea 2x2 + durable WMI launch + watchdog"

# Kill prior quad + old watchdog only
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
  ($_.Name -match "msedge" -and $_.CommandLine -and (
    $_.CommandLine.Contains("edge-quad-q1-log") -or
    $_.CommandLine.Contains("edge-quad-q2-spine") -or
    $_.CommandLine.Contains("edge-quad-q3-integrity") -or
    $_.CommandLine.Contains("edge-quad-q4-four") -or
    $_.CommandLine.Contains("edge-quad-hold") -or
    $_.CommandLine.Contains("edge-tutor-quad")
  )) -or (
    $_.CommandLine -and $_.CommandLine -match "Watch-Quad-Observe"
  )
} | ForEach-Object {
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 1200

foreach ($p in $profileRoots) {
  New-Item -ItemType Directory -Force -Path $p | Out-Null
}

function Start-PaneWmi {
  param([string]$Profile, [string]$Url, [int]$SeedX, [int]$SeedY)
  $args = @(
    "--user-data-dir=$Profile",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-session-crashed-bubble",
    "--disable-features=TranslateUI,MediaRouter",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-component-update",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--new-window",
    "--window-position=$SeedX,$SeedY",
    "--window-size=900,600",
    $Url
  ) -join " "
  $cmd = "`"$edge`" $args"
  $r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = $cmd
    CurrentDirectory = "C:\Windows\System32"
  }
  return [int]$r.ProcessId
}

function Get-QuadHwnd {
  param([string]$Marker)
  $pids = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -match "msedge" -and $_.CommandLine -and $_.CommandLine.Contains($Marker)
  } | ForEach-Object { [int]$_.ProcessId })
  if ($pids.Count -eq 0) { return $null }
  $proc = Get-Process -Id $pids -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } |
    Select-Object -First 1
  if (-not $proc) { return $null }
  return $proc.MainWindowHandle
}

function Place-Hwnd {
  param([IntPtr]$Hwnd, [hashtable]$Q)
  if ($Hwnd -eq [IntPtr]::Zero) { return $false }
  [void][WinPlace]::ShowWindow($Hwnd, [WinPlace]::SW_RESTORE)
  [void][WinPlace]::SetWindowPos($Hwnd, [WinPlace]::HWND_TOP, $Q.X, $Q.Y, $Q.W, $Q.H, [WinPlace]::SWP_SHOWWINDOW)
  [void][WinPlace]::MoveWindow($Hwnd, $Q.X, $Q.Y, $Q.W, $Q.H, $true)
  return $true
}

function Test-LooksPlaced {
  param([IntPtr]$Hwnd, [hashtable]$Expected)
  $r = New-Object WinPlace+RECT
  if (-not [WinPlace]::GetWindowRect($Hwnd, [ref]$r)) { return $false }
  $w = $r.Right - $r.Left
  $h = $r.Bottom - $r.Top
  return ([Math]::Abs($w - $Expected.W) -lt 140) -and
         ([Math]::Abs($h - $Expected.H) -lt 140) -and
         ([Math]::Abs($r.Left - $Expected.X) -lt 100) -and
         ([Math]::Abs($r.Top - $Expected.Y) -lt 100)
}

$seedX = $ox + [int]($fullW * 0.25)
$seedY = $oy + [int]($fullH * 0.25)

for ($i = 0; $i -lt 4; $i++) {
  $pidLaunch = Start-PaneWmi -Profile $profileRoots[$i] -Url $urls[$i] -SeedX $seedX -SeedY $seedY
  Write-Host ("Launched {0} wmiPid={1} -> {2}" -f $names[$i], $pidLaunch, $urls[$i])
  Start-Sleep -Milliseconds 1400
}

Start-Sleep -Seconds 2
$have = 0
for ($i = 0; $i -lt 4; $i++) {
  for ($t = 0; $t -lt 20; $t++) {
    if (Get-QuadHwnd -Marker $markers[$i]) { $have++; break }
    Start-Sleep -Milliseconds 400
  }
}
Write-Host ("Windows ready: {0}/4" -f $have)

if ($UseSnap -and (Test-Path $snapHelper)) {
  Write-Host "=== Optional Snap Assist ==="
  try {
    $task = "AOS-GrokTutor-SnapQuad"
    Unregister-ScheduledTask -TaskName $task -Confirm:$false -ErrorAction SilentlyContinue
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$snapHelper`""
    $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
    Register-ScheduledTask -TaskName $task -Action $action -Principal $principal -Force | Out-Null
    Start-ScheduledTask -TaskName $task
    Start-Sleep -Seconds 20
  } catch {
    Write-Host "Snap skipped: $($_.Exception.Message)"
  }
}

Write-Host "=== WorkingArea 2x2 placement ==="
$ok = 0
for ($i = 0; $i -lt 4; $i++) {
  $q = $quads[$i]
  $hwnd = Get-QuadHwnd -Marker $markers[$i]
  if (-not $hwnd) {
    Write-Host ("RELAUNCH {0}" -f $names[$i])
    [void](Start-PaneWmi -Profile $profileRoots[$i] -Url $urls[$i] -SeedX $seedX -SeedY $seedY)
    Start-Sleep -Seconds 2
    $hwnd = Get-QuadHwnd -Marker $markers[$i]
  }
  if ($hwnd -and (Place-Hwnd -Hwnd $hwnd -Q $q)) {
    Start-Sleep -Milliseconds 100
    if (Test-LooksPlaced -Hwnd $hwnd -Expected $q) {
      $r = New-Object WinPlace+RECT
      [void][WinPlace]::GetWindowRect($hwnd, [ref]$r)
      Write-Host ("OK {0} rect={1},{2}-{3},{4}" -f $names[$i], $r.Left, $r.Top, $r.Right, $r.Bottom)
      $ok++
    } else {
      [void](Place-Hwnd -Hwnd $hwnd -Q $q)
      Write-Host ("OK {0} placed (retry)" -f $names[$i])
      $ok++
    }
  } else {
    Write-Host ("FAIL {0}" -f $names[$i])
  }
}

# Start durable watchdog outside agent job
if (-not $NoWatchdog -and (Test-Path $watchHelper)) {
  $wmiCmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$watchHelper`" -Minutes $WatchMinutes -IntervalSec 15"
  $wr = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = $wmiCmd
    CurrentDirectory = $here
  }
  Write-Host ("Watchdog started wmiPid={0} minutes={1}" -f $wr.ProcessId, $WatchMinutes)
  Set-Content -Path "C:\AOS\logs\quad-watchdog.pid" -Value $wr.ProcessId -Encoding ascii
}

Write-Host ""
Write-Host ("Placed {0}/4 on {1}" -f $ok, $target.DeviceName)
Write-Host "TL Log:       $($urls[0])"
Write-Host "TR Spine:     $($urls[1])"
Write-Host "BL Integrity: $($urls[2])"
Write-Host "BR FourAgent: $($urls[3])"
Write-Host "Watchdog log: C:\AOS\logs\quad-watchdog.log"
if ($ok -lt 4) { exit 2 }
