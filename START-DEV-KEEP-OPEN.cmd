@echo off
title Grok Tutor DEV :8085
cd /d "C:\Users\Chris\Projects\Grok-Tutor-AOS-Path"
echo Grok Tutor — http://127.0.0.1:8085/
echo Port 8085 (8080 reserved for Local Qwen on AOS). Leave this window open.
echo.
call "C:\Program Files\nodejs\npm.cmd" run dev
echo.
echo Server exited with code %ERRORLEVEL%. Press any key to close.
pause >nul
