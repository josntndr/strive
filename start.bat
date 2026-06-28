@echo off
cd /d "%~dp0"
echo ================================================
echo    Strive - Fitness ^& Meal Planning
echo    Runs the whole app on this PC (data is local)
echo ================================================
echo.

if not exist "frontend\node_modules" (
  echo Installing frontend dependencies ^(first run only^)...
  call npm --prefix frontend install
)
if not exist "backend\node_modules" (
  echo Installing backend dependencies ^(first run only^)...
  call npm --prefix backend install
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
echo Starting Strive at http://localhost:5000 ...
start "Strive Server" cmd /k "npm --prefix backend start"
timeout /t 6 >nul
start "" http://localhost:5000

echo.
echo  Strive is running at:  http://localhost:5000
echo  Your data is saved in: backend\data\db.json
echo  To STOP the app, close the "Strive Server" window.
echo.
pause
