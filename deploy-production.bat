@echo off
echo 🚀 HRM Production Deployment
echo.

echo 1. Stopping any existing backend...
taskkill /f /im java.exe >nul 2>&1

echo 2. Starting production backend on port 8080...
cd "F:\New folder\HRM-main\target"
start "HRM Production Backend" cmd /c "java -jar HRM-1.war"

echo 3. Waiting for startup...
timeout /t 20

echo 4. Testing backend...
curl -X GET http://localhost:8080/api/company/register

echo.
echo ✅ Deployment attempted!
echo 🔗 Backend URL: http://localhost:8080/api
echo 🌐 Production URL: http://129.212.239.12/api (when deployed to server)
echo.
pause
