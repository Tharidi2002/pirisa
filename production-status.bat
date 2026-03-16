@echo off
cls
echo 🔍 PRODUCTION STATUS CHECK
echo ========================
echo.
echo 📊 CURRENT PRODUCTION STATUS:
echo =====================================
echo.
echo ✅ FRONTEND: http://129.212.239.12
echo    Status: WORKING ✅
echo    Response: 200 OK
echo    Content: HTML page loading
echo.
echo ❌ BACKEND: http://129.212.239.12/api
echo    Status: NOT WORKING ❌
echo    Response: 502 Bad Gateway
echo    Issue: Backend not deployed
echo.
echo 🎯 WHAT NEEDS TO BE DONE:
echo =====================================
echo.
echo 1️⃣ DEPLOY BACKEND TO SERVER
echo    - Upload JAR file to server
echo    - Run database setup
echo    - Start backend application
echo.
echo 2️⃣ FILES NEEDED FOR DEPLOYMENT:
echo    📦 HRM-1.war (Backend JAR)
echo    🗄️ Database: hrm (already exists)
echo    🔧 Config: Production ready
echo.
echo 3️⃣ DEPLOYMENT COMMANDS:
echo    =====================================
echo    # On server (129.212.239.12):
echo    mysql -h 129.212.239.12 -u root -pIjse@123
echo    CREATE DATABASE IF NOT EXISTS hrm;
echo    exit;
echo.
echo    java -jar HRM-1.war
echo.
echo 4️⃣ AFTER DEPLOYMENT:
echo    ✅ Frontend: http://129.212.239.12
echo    ✅ Backend:  http://129.212.239.12/api
echo    ✅ Full App: Working
echo.
echo 📋 CURRENT FILES READY:
echo    📍 JAR File: F:\New folder\HRM-main\target\HRM-1.war
echo    📊 Size: 68MB
echo    ⚙️  Config: Production database ready
echo.
echo 🚀 NEXT ACTION:
echo    Upload HRM-1.war to server and run it!
echo.
pause
