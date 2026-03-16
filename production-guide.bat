@echo off
echo 🚀 HRM Backend Production Setup
echo.

echo 📋 Current Status:
echo ✅ Frontend: http://129.212.239.12 (Working)
echo ❌ Backend: http://129.212.239.12/api (Not deployed)
echo.

echo 🔧 To fix backend production deployment:
echo.
echo 1️⃣ Upload these files to your server (129.212.239.12):
echo    - HRM-1.war (from F:\New folder\HRM-main\target\)
echo    - deploy-server.sh (Linux) or deploy-server.bat (Windows)
echo.
echo 2️⃣ On your server, setup database:
echo    mysql -h 129.212.239.12 -u root -pIjse@123
echo    CREATE DATABASE IF NOT EXISTS HRM;
echo.
echo 3️⃣ Run deployment script on server:
echo    Linux: chmod +x deploy-server.sh && ./deploy-server.sh
echo    Windows: deploy-server.bat
echo.
echo 4️⃣ Test production URLs:
echo    Frontend: http://129.212.239.12 ✅
echo    Backend:  http://129.212.239.12/api ⏳
echo.
echo 📁 Files ready for deployment:
dir "HRM-main\target\HRM-1.war"
echo.
pause
