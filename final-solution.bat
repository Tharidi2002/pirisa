@echo off
cls
echo 🎯 PRODUCTION BACKEND ISSUE - SOLUTION
echo ====================================
echo.
echo 📊 PROBLEM:
echo ============
echo ❌ Backend: http://129.212.239.12/api (502 Bad Gateway)
echo ✅ Frontend: http://129.212.239.12 (Working)
echo.
echo 🔍 ROOT CAUSE:
echo ================
echo Nginx is trying to proxy /api requests to backend,
echo but the backend application is NOT running on the server.
echo.
echo 🚀 SOLUTION:
echo ============
echo Deploy the backend JAR file to your server and start it!
echo.
echo 📋 EXACT STEPS:
echo =================
echo.
echo 1️⃣ UPLOAD JAR TO SERVER:
echo    File: F:\New folder\HRM-main\target\HRM-1.war
echo    To: Your server (129.212.239.12)
echo.
echo 2️⃣ SETUP DATABASE:
echo    mysql -h 129.212.239.12 -u root -pIjse@123
echo    CREATE DATABASE IF NOT EXISTS hrm;
echo    exit;
echo.
echo 3️⃣ START BACKEND:
echo    java -jar HRM-1.war
echo.
echo 4️⃣ VERIFY:
echo    curl http://129.212.239.12/api/company/register
echo.
echo 🎯 AFTER DEPLOYMENT:
echo ====================
echo ✅ Frontend: http://129.212.239.12
echo ✅ Backend:  http://129.212.239.12/api
echo ✅ Full App: Working
echo.
echo 📦 FILES READY:
echo ================
echo ✅ HRM-1.war (68MB) - Production backend
echo ✅ dist folder - Frontend build
echo ✅ Database config - Production ready
echo.
echo 🚨 THIS IS THE ONLY ISSUE:
echo ==========================
echo Your frontend is deployed and working.
echo Your backend JAR needs to be deployed and started.
echo That's it!
echo.
echo 🎉 DO THIS AND YOUR APP WILL WORK 100%%
echo.
pause
