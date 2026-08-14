# Grok Tutor — durable launcher (server stays up + Edge opens)
# Server runs in a separate minimized console so agent/shell death does not kill it.
param(
  # 8085 = Tutor (AOS: 8080 is Local Qwen — do not steal)
  [int]$Port = 8085,
  [string]$Path = "/",
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$Root = "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
$Url = "http://127.0.0.1:$Port$Path"
$Npm = "$env:ProgramFiles\nodejs\npm.cmd"
if (-not (Test-Path $Npm)) { $Npm = "npm.cmd" }

function Test-TutorUp {
  try {
    $req = [System.Net.HttpWebRequest]::Create("http://127.0.0.1:$Port/")
    $req.Method = "GET"
    $req.Timeout = 2500
    $req.Headers.Add("Accept-Encoding", "identity")
    $req.UserAgent = "GrokTutor-Open/1.0"
    $resp = $req.GetResponse()
    $code = [int]$resp.StatusCode
    $resp.Close()
    return ($code -ge 200 -and $code -lt 500)
  } catch {
    return $false
  }
}

function Open-BrowserTab([string]$target) {
  $candidates = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:LocalAppData\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
  )
  foreach ($exe in $candidates) {
    if (Test-Path $exe) {
      Start-Process -FilePath $exe -ArgumentList "--new-window", $target
      Write-Host "Opened: $target"
      Write-Host "Browser: $exe"
      return $true
    }
  }
  Start-Process -FilePath "rundll32.exe" -ArgumentList "url.dll,FileProtocolHandler", $target
  Write-Host "Opened via rundll32: $target"
  return $true
}

function Start-TutorServer {
  $keepOpen = Join-Path $Root "START-DEV-KEEP-OPEN.cmd"
  if (-not (Test-Path $keepOpen)) {
    @"
@echo off
title Grok Tutor DEV :$Port
cd /d "$Root"
echo Grok Tutor — http://127.0.0.1:$Port/
echo Leave this window open while you work.
call "$Npm" run dev
echo.
echo Server exited. Press any key to close.
pause >nul
"@ | Set-Content -Path $keepOpen -Encoding ASCII
  }
  # Break away from agent/IDE job objects so Vite is not killed when the parent exits.
  # Nested `cmd /c start` creates an independent console process tree.
  $cmd = "start `"Grok Tutor DEV`" /MIN `"`"`"$keepOpen`"`"`""
  Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $cmd -WorkingDirectory $Root -WindowStyle Hidden
}

if (-not (Test-TutorUp)) {
  Write-Host "Starting Grok Tutor on port $Port ..."
  Start-TutorServer
  $deadline = (Get-Date).AddSeconds(60)
  do {
    Start-Sleep -Seconds 1
    if (Test-TutorUp) { break }
  } while ((Get-Date) -lt $deadline)
  if (-not (Test-TutorUp)) {
    Write-Host "ERROR: Tutor did not become ready on $Url"
    Write-Host "Check the minimized window titled 'Grok Tutor DEV'."
    if (-not $NoBrowser) { pause }
    exit 1
  }
  Write-Host "Tutor is up."
} else {
  Write-Host "Tutor already live on port $Port"
}

if (-not $NoBrowser) {
  [void](Open-BrowserTab $Url)
}

Write-Host ""
Write-Host "Grok Tutor  $Url"
Write-Host "Project     $Root"
Write-Host "Leave the 'Grok Tutor DEV' console open while using the app."
