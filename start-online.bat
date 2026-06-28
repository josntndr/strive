@echo off
cd /d "%~dp0"
echo ====================================================
echo    Strive - put the app ONLINE (data stays on this PC)
echo ====================================================
echo.

if not exist "frontend\node_modules" call npm --prefix frontend install
if not exist "backend\node_modules" call npm --prefix backend install

if not exist "cloudflared.exe" (
  echo Downloading Cloudflare Tunnel ^(first run only^)...
  curl -L -o cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
)

echo Building the app...
set "NEXT_PUBLIC_API_URL="
call npm --prefix frontend run build
if errorlevel 1 (
  echo.
  echo Build failed. See the messages above.
  pause
  exit /b 1
)

echo.
echo Starting the local server...
start "Strive Server" cmd /k "npm --prefix backend start"
timeout /t 6 >nul

echo Opening the public tunnel...
start "Strive Public URL" cmd /k "cloudflared.exe tunnel --url http://localhost:5000"

echo.
echo  Your PUBLIC https link will appear in the "Strive Public URL" window
echo  (look for the line ending in .trycloudflare.com).
echo.
echo  Keep BOTH windows open to stay online.
echo  Data is saved on this PC in: backend\data\db.json
echo  To go offline, close both windows.
echo.
pause
