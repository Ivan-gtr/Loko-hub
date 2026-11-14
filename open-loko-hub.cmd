@echo off
setlocal
cd /d "%~dp0"

where powershell.exe >nul 2>&1
if errorlevel 1 (
    echo Ошибка: PowerShell не найден в системе.
    pause
    exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-loko-hub-tcp.ps1"

if errorlevel 1 (
    echo.
    echo Запуск завершился с ошибкой. Подробности указаны выше.
    pause
)
