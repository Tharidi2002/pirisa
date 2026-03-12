@echo off
echo ========================================
echo    Pirisa HRM Demo Server
echo ========================================

echo.
echo 1. Starting Backend (H2 Database)...
cd /d F:\git\pirisa\HRM-main
start "Backend Server" cmd /k "mvn spring-boot:run"

echo.
echo 2. Waiting for backend to start...
timeout /t 15 /nobreak

echo.
echo 3. Testing Backend...
curl http://localhost:8080/api/company/all

echo.
echo 4. Opening Browser...
start http://localhost:8080/h2-console

echo.
echo ========================================
echo    DEMO URLs:
echo ========================================
echo Backend API: http://localhost:8080/api
echo H2 Database: http://localhost:8080/h2-console
echo Frontend: Build with npm run dev manually
echo ========================================

pause
