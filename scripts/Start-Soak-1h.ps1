# Start complete-suite soak fully detached (survives agent/job exit).
# Usage: powershell -File Start-Soak-1h.ps1 [baseUrl] [minutes]

param(
  [string]$BaseUrl = "http://127.0.0.1:8085",
  [int]$Minutes = 60
)

$ErrorActionPreference = "SilentlyContinue"
$root = Split-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) -Parent
if (-not (Test-Path (Join-Path $root "scripts\sim-observable-1h.mjs"))) {
  $root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
}
$script = Join-Path $root "scripts\sim-observable-1h.mjs"
$logDir = "C:\AOS\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$stdout = Join-Path $logDir "soak-1h-stdout.log"
$stderr = Join-Path $logDir "soak-1h-stderr.log"
$pidFile = Join-Path $logDir "soak-1h.pid"

# Stop prior soak only
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
  $_.Name -match "node" -and $_.CommandLine -and $_.CommandLine -match "sim-observable-1h"
} | ForEach-Object {
  Write-Host "Stopping prior soak pid=$($_.ProcessId)"
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 500

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Detach {
  [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
  public static extern bool CreateProcess(
    string app, string cmd, IntPtr pa, IntPtr ta, bool inherit,
    uint flags, IntPtr env, string cwd, ref STARTUPINFO si, out PROCESS_INFORMATION pi);
  [DllImport("kernel32.dll")] public static extern bool CloseHandle(IntPtr h);
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public struct STARTUPINFO {
    public int cb; public string reserved; public string desktop; public string title;
    public int x,y,xSize,ySize,xCount,yCount,fill,flags; public short show, reserved2;
    public IntPtr reserved3, stdIn, stdOut, stdErr;
  }
  [StructLayout(LayoutKind.Sequential)]
  public struct PROCESS_INFORMATION {
    public IntPtr hProcess, hThread; public int pid, tid;
  }
  public const uint CREATE_BREAKAWAY_FROM_JOB = 0x01000000;
  public const uint CREATE_NEW_PROCESS_GROUP = 0x00000200;
  public const uint DETACHED_PROCESS = 0x00000008;
  public const uint CREATE_NO_WINDOW = 0x08000000;

  public static int Launch(string nodeExe, string args, string cwd) {
    var si = new STARTUPINFO();
    si.cb = Marshal.SizeOf(typeof(STARTUPINFO));
    PROCESS_INFORMATION pi;
    string cmd = "\"" + nodeExe + "\" " + args;
    uint flags = CREATE_BREAKAWAY_FROM_JOB | CREATE_NEW_PROCESS_GROUP | CREATE_NO_WINDOW;
    bool ok = CreateProcess(null, cmd, IntPtr.Zero, IntPtr.Zero, false, flags, IntPtr.Zero, cwd, ref si, out pi);
    if (!ok) return 0;
    int pid = pi.pid;
    if (pi.hProcess != IntPtr.Zero) CloseHandle(pi.hProcess);
    if (pi.hThread != IntPtr.Zero) CloseHandle(pi.hThread);
    return pid;
  }
}
"@

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { $node = "C:\Program Files\nodejs\node.exe" }
if (-not (Test-Path $node)) { Write-Host "node not found"; exit 1 }

$args = "`"$script`" $BaseUrl $Minutes"
$pidLaunched = [Detach]::Launch($node, $args, $root)

if ($pidLaunched -le 0) {
  # Fallback: WMI create (often outside parent job)
  Write-Host "CreateProcess breakaway failed - WMI fallback"
  $cmd = "`"$node`" `"$script`" $BaseUrl $Minutes"
  $r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = $cmd
    CurrentDirectory = $root
  }
  $pidLaunched = [int]$r.ProcessId
}

if ($pidLaunched -le 0) {
  Write-Host "FAIL could not start soak"
  exit 1
}

Set-Content -Path $pidFile -Value $pidLaunched -Encoding ascii
Write-Host "SOAK_STARTED pid=$pidLaunched minutes=$Minutes base=$BaseUrl"
Write-Host "pidfile=$pidFile"
Write-Host "LIVE=$BaseUrl/soak/LIVE.json"
exit 0
