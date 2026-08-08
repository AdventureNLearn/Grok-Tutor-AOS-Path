# Keep four Grok Tutor observe panes alive on secondary monitor.
# Restarts any missing Edge profile window and re-applies WorkingArea 2x2.
# Fully automated. Product URLs only (http://127.0.0.1:8085).
#
#   powershell -File Watch-Quad-Observe.ps1 [-Minutes 60] [-IntervalSec 20]

param(
  [int]$Minutes = 60,
  [int]$IntervalSec = 20
)

$ErrorActionPreference = "SilentlyContinue"
$base = "http://127.0.0.1:8085"
$log = "C:\AOS\logs\quad-watchdog.log"
New-Item -ItemType Directory -Force -Path "C:\AOS\logs" | Out-Null

function Log($m) {
  $line = "{0} {1}" -f (Get-Date -Format "HH:mm:ss"), $m
  Add-Content -Path $log -Value $line -Encoding UTF8
  Write-Host $line
}

$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe" }
if (-not (Test-Path $edge)) { Log "Edge not found"; exit 1 }

$panes = @(
  @{ Marker = "edge-quad-q1-log";       Profile = "C:\AOS\logs\edge-quad-q1-log";       Url = "$base/soak/observe-log.html";     Name = "TL-Log" },
  @{ Marker = "edge-quad-q2-spine";     Profile = "C:\AOS\logs\edge-quad-q2-spine";     Url = "$base/soak/pane-spine.html";      Name = "TR-Spine" },
  @{ Marker = "edge-quad-q3-integrity"; Profile = "C:\AOS\logs\edge-quad-q3-integrity"; Url = "$base/soak/pane-integrity.html";  Name = "BL-Integrity" },
  @{ Marker = "edge-quad-q4-four";      Profile = "C:\AOS\logs\edge-quad-q4-four";      Url = "$base/soak/pane-four.html";       Name = "BR-Four" }
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WQWatch {
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h, int x, int y, int w, int h2, bool r);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int L, T, R, B; }
  public const int SW_RESTORE = 9;
  public static readonly IntPtr TOP = IntPtr.Zero;
  public const uint SWP_SHOWWINDOW = 0x0040;
}
"@

function Get-TargetQuads {
  $screens = [System.Windows.Forms.Screen]::AllScreens
  $target = $screens | Where-Object { -not $_.Primary } | Select-Object -First 1
  if (-not $target) { $target = [System.Windows.Forms.Screen]::PrimaryScreen }
  $a = $target.WorkingArea
  $ox = [int]$a.X; $oy = [int]$a.Y
  $fw = [int]$a.Width; $fh = [int]$a.Height
  $qw = [int][Math]::Floor($fw / 2)
  $qh = [int][Math]::Floor($fh / 2)
  return @(
    @{ X = $ox; Y = $oy; W = $qw; H = $qh },
    @{ X = $ox + $qw; Y = $oy; W = $fw - $qw; H = $qh },
    @{ X = $ox; Y = $oy + $qh; W = $qw; H = $fh - $qh },
    @{ X = $ox + $qw; Y = $oy + $qh; W = $fw - $qw; H = $fh - $qh }
  ), $target.DeviceName, $ox, $oy, $fw, $fh
}

function Get-BrowserPid([string]$Marker) {
  $p = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -eq "msedge.exe" -and $_.CommandLine -and $_.CommandLine.Contains($Marker) -and $_.CommandLine -notmatch "--type="
  } | Select-Object -First 1
  if ($p) { return [int]$p.ProcessId }
  return 0
}

function Get-HwndForMarker([string]$Marker) {
  $pids = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -eq "msedge.exe" -and $_.CommandLine -and $_.CommandLine.Contains($Marker)
  } | ForEach-Object { [int]$_.ProcessId })
  if ($pids.Count -eq 0) { return [IntPtr]::Zero }
  $proc = Get-Process -Id $pids -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } |
    Select-Object -First 1
  if (-not $proc) { return [IntPtr]::Zero }
  return $proc.MainWindowHandle
}

function Start-PaneDetached($Pane, $SeedX, $SeedY) {
  New-Item -ItemType Directory -Force -Path $Pane.Profile | Out-Null
  # Stable flags: no background kill, no session restore thrash, dedicated window
  $args = @(
    "--user-data-dir=$($Pane.Profile)",
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
    $Pane.Url
  ) -join " "

  # WMI Create = outside agent job object (survives launcher exit)
  $cmd = "`"$edge`" $args"
  $r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = $cmd
    CurrentDirectory = "C:\Windows\System32"
  } -ErrorAction SilentlyContinue
  return [int]$r.ProcessId
}

function Place-Hwnd([IntPtr]$Hwnd, $Q) {
  if ($Hwnd -eq [IntPtr]::Zero) { return $false }
  if ([WQWatch]::IsIconic($Hwnd)) { [void][WQWatch]::ShowWindow($Hwnd, 9) }
  [void][WQWatch]::ShowWindow($Hwnd, 9)
  [void][WQWatch]::SetWindowPos($Hwnd, [WQWatch]::TOP, $Q.X, $Q.Y, $Q.W, $Q.H, 0x0040)
  [void][WQWatch]::MoveWindow($Hwnd, $Q.X, $Q.Y, $Q.W, $Q.H, $true)
  return $true
}

function Test-InQuad([IntPtr]$Hwnd, $Q) {
  $r = New-Object WQWatch+RECT
  if (-not [WQWatch]::GetWindowRect($Hwnd, [ref]$r)) { return $false }
  $w = $r.R - $r.L; $h = $r.B - $r.T
  return ([Math]::Abs($w - $Q.W) -lt 160) -and ([Math]::Abs($h - $Q.H) -lt 160) -and
         ([Math]::Abs($r.L - $Q.X) -lt 120) -and ([Math]::Abs($r.T - $Q.Y) -lt 120)
}

function Ensure-AllPanes {
  $pack = Get-TargetQuads
  $quads = $pack[0]
  $seedX = $pack[2] + [int]($pack[4] * 0.25)
  $seedY = $pack[3] + [int]($pack[5] * 0.25)
  $fixed = 0
  $ok = 0

  for ($i = 0; $i -lt 4; $i++) {
    $pane = $panes[$i]
    $q = $quads[$i]
    $hwnd = Get-HwndForMarker $pane.Marker
    $browserPid = Get-BrowserPid $pane.Marker

    if ($browserPid -eq 0 -or $hwnd -eq [IntPtr]::Zero) {
      Log "RELAUNCH $($pane.Name) ($($pane.Marker))"
      # kill orphans for this profile first
      Get-CimInstance Win32_Process | Where-Object {
        $_.Name -eq "msedge.exe" -and $_.CommandLine -and $_.CommandLine.Contains($pane.Marker)
      } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
      Start-Sleep -Milliseconds 400
      $newPid = Start-PaneDetached $pane $seedX $seedY
      Log "  started claimedPid=$newPid"
      for ($t = 0; $t -lt 25; $t++) {
        Start-Sleep -Milliseconds 400
        $hwnd = Get-HwndForMarker $pane.Marker
        if ($hwnd -ne [IntPtr]::Zero) { break }
      }
      $fixed++
    }

    if ($hwnd -ne [IntPtr]::Zero) {
      if (-not (Test-InQuad $hwnd $q)) {
        [void](Place-Hwnd $hwnd $q)
        $fixed++
      }
      if (Test-InQuad $hwnd $q) { $ok++ }
      else {
        [void](Place-Hwnd $hwnd $q)
        if (Test-InQuad $hwnd $q) { $ok++ }
      }
    } else {
      Log "FAIL no hwnd $($pane.Name)"
    }
  }
  return @{ Ok = $ok; Fixed = $fixed }
}

# --- main ---
Log "Watch-Quad-Observe start minutes=$Minutes interval=${IntervalSec}s"
$deadline = (Get-Date).AddMinutes($Minutes)
$r0 = Ensure-AllPanes
Log "initial ok=$($r0.Ok)/4 fixed=$($r0.Fixed)"

while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds $IntervalSec
  # stop early if soak gone for a while AND all panes ok? keep watching full window
  $r = Ensure-AllPanes
  if ($r.Fixed -gt 0) {
    Log "repair ok=$($r.Ok)/4 fixed=$($r.Fixed)"
  }
}

Log "Watch-Quad-Observe done"
exit 0
