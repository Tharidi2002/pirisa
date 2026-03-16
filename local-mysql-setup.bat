@echo off
cls
echo 🗄️ LOCAL MYSQL SETUP GUIDE
echo ==========================
echo.
echo 🔍 CURRENT CONFIGURATION:
echo =========================
echo ✅ Database: localhost:3306/hrm
echo ✅ Backend: Configured for local MySQL
echo ✅ Frontend: Configured for localhost API
echo.
echo 📋 STEPS TO SETUP LOCAL MYSQL:
echo ==============================
echo.
echo 1️⃣ OPEN MYSQL WORKBENCH / PHPMYADMIN
echo    - Connect to your local MySQL
echo    - Create database named "hrm"
echo.
echo 2️⃣ OR USE MYSQL COMMAND LINE:
echo    - Open MySQL Command Line Client
echo    - Run: CREATE DATABASE IF NOT EXISTS hrm;
echo.
echo 3️⃣ VERIFY DATABASE EXISTS:
echo    - USE hrm;
echo    - SHOW TABLES;
echo.
echo 4️⃣ START BACKEND:
echo    - cd "F:\New folder\HRM-main\target"
echo    - java -jar HRM-1.war
echo.
echo 5️⃣ START FRONTEND:
echo    - cd "F:\New folder\PirisaHR-main"
echo    - npm run dev
echo.
echo 🎯 EXPECTED RESULT:
echo ===================
echo ✅ Backend: http://localhost:8080/api
echo ✅ Frontend: http://localhost:5174
echo ✅ Database: Connected to local hrm
echo.
echo 📊 YOUR LOCAL SETUP:
echo ===================
echo - Frontend: http://localhost:5174
echo - Backend:  http://localhost:8080/api
echo - Database: localhost:3306/hrm
echo.
echo 🚀 AFTER SETUP:
echo ================
echo Your HRM system will work completely locally
echo with your local MySQL database!
echo.
pause
