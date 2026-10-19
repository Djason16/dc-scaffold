@echo off
rem DC Scaffold - by Djason CHERY: runs the engine of this folder without installing anything (development)
chcp 65001 >nul
where pwsh >nul 2>nul
if %errorlevel%==0 (
    pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0engine\dc-scaffold.ps1" %*
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0engine\dc-scaffold.ps1" %*
)
pause
