@echo off
title Grok Tutor
cd /d "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path\Open-Grok-Tutor.ps1" -Port 8085 %*
if errorlevel 1 pause
