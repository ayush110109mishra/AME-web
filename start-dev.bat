@echo off
title AME Website (Frontend + Backend)
echo ============================================================
echo   Starting AME Website (Frontend on 5173, Backend on 5000)
echo ============================================================
echo.
cd /d "%~dp0"
call npm run dev
pause
