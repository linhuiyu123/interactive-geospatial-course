@echo off
setlocal
cd /d "%~dp0"
set "PORT=8000"
set "URL=http://127.0.0.1:%PORT%/index.html"

where py >nul 2>&1
if not errorlevel 1 (
    start "" /B py -3 -m http.server %PORT% --bind 127.0.0.1
) else (
    where python >nul 2>&1
    if not errorlevel 1 (
        start "" /B python -m http.server %PORT% --bind 127.0.0.1
    ) else (
        echo Python 3 was not found.
        echo Please install Python 3 and run this file again.
        pause
        exit /b 1
    )
)

timeout /t 2 /nobreak >nul
start "" "%URL%"
echo.
echo Website is running: %URL%
echo Keep this window open while studying.
pause
