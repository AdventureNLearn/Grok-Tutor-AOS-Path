# Snap existing quad Edge windows using Windows Snap Assist (Win+Arrow).
# Multi-monitor safe sequence:
#   1) Park on secondary working area
#   2) Win+Up  -> maximize on THAT monitor (pins snap context)
#   3) Win+Left|Right -> half
#   4) Win+Up|Down    -> quarter
#
# Run interactively (or via Interactive scheduled task) so SendInput reaches the desktop.

$ErrorActionPreference = "SilentlyContinue"

Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Threading;

public class SnapAssist {
  public const int SW_RESTORE = 9;
  public const int SW_MAXIMIZE = 3;
  public static readonly IntPtr HWND_TOP = IntPtr.Zero;
  public const uint SWP_SHOWWINDOW = 0x0040;
  public const byte VK_LWIN = 0x5B;
  public const byte VK_LEFT = 0x25;
  public const byte VK_UP = 0x26;
  public const byte VK_RIGHT = 0x27;
  public const byte VK_DOWN = 0x28;
  public const byte VK_MENU = 0x12;
  public const uint KEYEVENTF_KEYUP = 0x0002;
  public const uint KEYEVENTF_EXTENDEDKEY = 0x0001;
  public const uint INPUT_KEYBOARD = 1;

  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr after, int X, int Y, int cx, int cy, uint flags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
  [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);
  [DllImport("user32.dll", SetLastError = true)]
  public static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);
  [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr extra);
  [DllImport("user32.dll")] public static extern bool IsZoomed(IntPtr hWnd);

  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int Left, Top, Right, Bottom; }

  [StructLayout(LayoutKind.Sequential)]
  public struct INPUT {
    public uint type;
    public INPUTUNION U;
  }

  [StructLayout(LayoutKind.Explicit)]
  public struct INPUTUNION {
    [FieldOffset(0)] public MOUSEINPUT mi;
    [FieldOffset(0)] public KEYBDINPUT ki;
  }

  [StructLayout(LayoutKind.Sequential)]
  public struct MOUSEINPUT {
    public int dx, dy; public uint mouseData, dwFlags, time; public IntPtr dwExtraInfo;
  }

  [StructLayout(LayoutKind.Sequential)]
  public struct KEYBDINPUT {
    public ushort wVk, wScan; public uint dwFlags, time; public IntPtr dwExtraInfo;
  }

  static INPUT Key(ushort vk, uint flags) {
    var i = new INPUT();
    i.type = INPUT_KEYBOARD;
    i.U.ki.wVk = vk;
    i.U.ki.dwFlags = flags;
    return i;
  }

  public static void WinPlus(byte arrowVk) {
    uint ext = KEYEVENTF_EXTENDEDKEY;
    INPUT[] seq = new INPUT[] {
      Key(VK_LWIN, 0),
      Key(arrowVk, ext),
      Key(arrowVk, ext | KEYEVENTF_KEYUP),
      Key(VK_LWIN, KEYEVENTF_KEYUP)
    };
    SendInput((uint)seq.Length, seq, Marshal.SizeOf(typeof(INPUT)));
    Thread.Sleep(220);
  }

  public static void Focus(IntPtr hWnd) {
    ShowWindow(hWnd, SW_RESTORE);
    BringWindowToTop(hWnd);
    keybd_event(VK_MENU, 0, 0, UIntPtr.Zero);
    keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);

    IntPtr fg = GetForegroundWindow();
    uint fgPid; uint fgTid = GetWindowThreadProcessId(fg, out fgPid);
    uint me = GetCurrentThreadId();
    uint tPid; uint tTid = GetWindowThreadProcessId(hWnd, out tPid);
    if (fgTid != 0 && fgTid != me) AttachThreadInput(me, fgTid, true);
    if (tTid != 0 && tTid != me && tTid != fgTid) AttachThreadInput(me, tTid, true);
    SetForegroundWindow(hWnd);
    if (fgTid != 0 && fgTid != me) AttachThreadInput(me, fgTid, false);
    if (tTid != 0 && tTid != me && tTid != fgTid) AttachThreadInput(me, tTid, false);
    Thread.Sleep(140);
  }

  public static void ParkOnMonitor(IntPtr hWnd, int mx, int my, int mw, int mh) {
    // Restore then place fully inside target work area so maximize/snap bind here
    ShowWindow(hWnd, SW_RESTORE);
    int w = Math.Max(800, mw / 2);
    int h = Math.Max(500, mh / 2);
    int x = mx + Math.Max(20, (mw - w) / 2);
    int y = my + Math.Max(20, (mh - h) / 2);
    SetWindowPos(hWnd, HWND_TOP, x, y, w, h, SWP_SHOWWINDOW);
    Thread.Sleep(180);
  }

  public static bool CenterOnMonitor(IntPtr hWnd, int mx, int my, int mw, int mh) {
    RECT r;
    if (!GetWindowRect(hWnd, out r)) return false;
    int cx = (r.Left + r.Right) / 2;
    int cy = (r.Top + r.Bottom) / 2;
    return cx >= mx - 20 && cx <= mx + mw + 20 && cy >= my - 20 && cy <= my + mh + 20;
  }

  /// <summary>
  /// Windows Snap quarter on a specific monitor (multi-monitor safe).
  /// Maximize first so Left/Right snap halves of THIS monitor instead of cycling displays.
  /// </summary>
  public static void SnapQuadrant(IntPtr hWnd, int mx, int my, int mw, int mh, string horiz, string vert) {
    ParkOnMonitor(hWnd, mx, my, mw, mh);
    Focus(hWnd);

    // Pin to this monitor via maximize (Win+Up from restored on this display)
    WinPlus(VK_UP);
    Thread.Sleep(200);
    Focus(hWnd);

    // If still not maximized, force SW_MAXIMIZE as belt-and-suspenders
    if (!IsZoomed(hWnd)) {
      ShowWindow(hWnd, SW_MAXIMIZE);
      Thread.Sleep(150);
      Focus(hWnd);
    }

    byte hVk = horiz.Equals("Right", StringComparison.OrdinalIgnoreCase) ? VK_RIGHT : VK_LEFT;
    byte vVk = vert.Equals("Down", StringComparison.OrdinalIgnoreCase) ? VK_DOWN : VK_UP;

    WinPlus(hVk);   // half of current monitor
    Focus(hWnd);
    WinPlus(vVk);   // quarter
    Thread.Sleep(180);
  }
}
"@

$screens = [System.Windows.Forms.Screen]::AllScreens
$target = $screens | Where-Object { -not $_.Primary } | Select-Object -First 1
if (-not $target) { $target = [System.Windows.Forms.Screen]::PrimaryScreen }
$a = $target.WorkingArea
$ox = [int]$a.X; $oy = [int]$a.Y; $fw = [int]$a.Width; $fh = [int]$a.Height

Write-Host "Windows Snap Assist on $($target.DeviceName) work-area $ox,$oy ${fw}x${fh}"
Write-Host "Sequence per pane: park -> Win+Up (maximize here) -> Win+H -> Win+V"

$plan = @(
  @{ Marker = "edge-quad-q1-log";       H = "Left";  V = "Up";   Name = "TL-Log" },
  @{ Marker = "edge-quad-q2-spine";     H = "Right"; V = "Up";   Name = "TR-Spine" },
  @{ Marker = "edge-quad-q3-integrity"; H = "Left";  V = "Down"; Name = "BL-Integrity" },
  @{ Marker = "edge-quad-q4-four";      H = "Right"; V = "Down"; Name = "BR-Four" }
)

function Get-MarkerHwnd([string]$Marker) {
  $pids = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -match "msedge" -and $_.CommandLine -and $_.CommandLine.Contains($Marker)
  } | ForEach-Object { [int]$_.ProcessId })
  if ($pids.Count -eq 0) { return [IntPtr]::Zero }
  $p = Get-Process -Id $pids -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } |
    Select-Object -First 1
  if (-not $p) { return [IntPtr]::Zero }
  return $p.MainWindowHandle
}

$ok = 0
foreach ($step in $plan) {
  $hwnd = Get-MarkerHwnd $step.Marker
  if ($hwnd -eq [IntPtr]::Zero) {
    Write-Host "SKIP $($step.Name) - no window"
    continue
  }
  Write-Host ("Snapping {0}: maximize + Win+{1} + Win+{2}" -f $step.Name, $step.H, $step.V)
  [SnapAssist]::SnapQuadrant($hwnd, $ox, $oy, $fw, $fh, $step.H, $step.V)
  $r = New-Object SnapAssist+RECT
  [void][SnapAssist]::GetWindowRect($hwnd, [ref]$r)
  $w = $r.Right - $r.Left
  $h = $r.Bottom - $r.Top
  Write-Host ("  -> rect {0},{1} size {2}x{3}" -f $r.Left, $r.Top, $w, $h)
  $ok++
  Start-Sleep -Milliseconds 350
}

Write-Host "Snapped $ok/4 via Windows Snap Assist"
if ($ok -lt 4) { exit 2 }
