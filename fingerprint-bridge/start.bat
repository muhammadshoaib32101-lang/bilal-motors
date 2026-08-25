@echo off
title ZKFinger Bridge Server
cd /d "%~dp0"

echo =========================================
echo   ZKFinger Bridge Server - Bilal Motors
echo =========================================
echo.

:: Install packages if needed
if not exist "node_modules" (
  echo Installing packages...
  npm install
  echo.
)

echo Starting server on localhost:9999 ...
echo.
node server.js

echo.
echo Server stopped. Press any key to exit.
pause >nul
