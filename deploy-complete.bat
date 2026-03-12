@echo off
echo ========================================
echo    Pirisa HRM Complete Deployment
echo ========================================

echo.
echo 1. Starting Backend Deployment...
start "Backend Server" cmd /k "deploy-backend.bat"

echo.
echo 2. Waiting for backend to start...
timeout /t 10 /nobreak

echo.
echo 3. Starting Frontend Deployment...
start "Frontend Server" cmd /k "deploy-frontend.bat"

echo.
echo 4. Services are starting up...
echo.
echo Access URLs:
echo - Frontend: http://129.212.239.12
echo - Backend API: http://129.212.239.12/api
echo.
echo Press any key to open browser...
pause > nul

start http://129.212.239.12

echo.
echo Deployment complete!
echo Check the server windows for any errors.
pause
