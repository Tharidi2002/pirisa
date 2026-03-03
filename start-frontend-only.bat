@echo off
echo ========================================
echo Starting Pirisa HRM Frontend Only
echo ========================================
echo.

echo Killing any existing process on port 5174...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5174"') do (
    echo Killing process %%a on port 5174
    taskkill /PID %%a /F >nul 2>&1
)
echo.

echo Starting Frontend...
cd /d "%~dp0PirisaHR-frontend"

echo Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing npm packages...
    npm install
)

echo Starting development server...
start "HRM Frontend" cmd /k "echo Frontend Running on http://localhost:5174 && npm run dev"

echo.
echo ========================================
echo Frontend Started Successfully!
echo ========================================
echo Frontend URL: http://localhost:5174
echo.
echo Note: Make sure backend is running on http://localhost:8080
echo.
echo Press any key to exit...
pause >nul
