@echo off
cls
echo 🎯 COMPLETE PRODUCTION DEPLOYMENT GUIDE
echo =====================================
echo.
echo 📊 CURRENT STATUS:
echo ✅ Frontend: http://129.212.239.12 (WORKING)
echo ❌ Backend:  http://129.212.239.12/api (NEEDS DEPLOYMENT)
echo.
echo 🚀 OPTION 1: DEPLOY BACKEND TO SERVER
echo =====================================
echo.
echo 1️⃣ Upload JAR file to server:
echo    File: F:\New folder\HRM-main\target\HRM-1.war (68MB)
echo    To: 129.212.239.12
echo.
echo 2️⃣ On server, run these commands:
echo    mysql -h 129.212.239.12 -u root -pIjse@123
echo    CREATE DATABASE IF NOT EXISTS HRM;
echo    exit;
echo.
echo    java -jar HRM-1.war
echo.
echo 3️⃣ Test: curl http://129.212.239.12/api/company/register
echo.
echo 🚀 OPTION 2: USE LOCAL BACKEND (TEMPORARY)
echo ============================================
echo.
echo 1️⃣ Frontend already built with localhost API
echo 2️⃣ Backend is running on localhost:8080
echo 3️⃣ Upload new frontend build to server
echo.
echo 📁 FILES READY:
echo    ✅ HRM-1.war (Backend JAR)
echo    ✅ Frontend build (dist folder)
echo    ✅ Deployment scripts
echo.
echo 🎯 FINAL RESULT AFTER DEPLOYMENT:
echo    🌐 Full App: http://129.212.239.12
echo    🔧 Backend: http://129.212.239.12/api
echo    📱 Registration: Working
echo.
echo 📋 CHOOSE YOUR METHOD:
echo    1 - Deploy backend to server (RECOMMENDED)
echo    2 - Use localhost backend (TEMPORARY)
echo.
pause
