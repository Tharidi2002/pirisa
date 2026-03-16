@echo off
echo ========================================
echo   Starting Pirisa HRM Development
echo ========================================
echo.
echo 1. Starting Backend...
start "Backend" cmd /k "start-backend.bat"
timeout /t 5 /nobreak >nul
echo.
echo 2. Starting Frontend...
start "Frontend" cmd /k "start-frontend.bat"
echo.
echo ========================================
echo Both services are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5174
echo ========================================
pause
