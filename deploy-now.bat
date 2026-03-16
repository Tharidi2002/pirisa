@echo off
echo 🚀 DEPLOY BACKEND TO PRODUCTION NOW
echo ==================================
echo.
echo 📋 Copy these commands and run them on your server:
echo.
echo ==================================
echo STEP 1: Connect to Server
echo ssh user@129.212.239.12
echo.
echo STEP 2: Download JAR file (or upload via FTP)
echo wget http://your-local-server/HRM-1.war
echo OR: Upload HRM-1.war via FTP/SFTP
echo.
echo STEP 3: Setup Database
echo mysql -h 129.212.239.12 -u root -pIjse@123
echo CREATE DATABASE IF NOT EXISTS HRM;
echo exit;
echo.
echo STEP 4: Start Backend
echo java -jar HRM-1.war
echo.
echo STEP 5: Test
echo curl http://129.212.239.12/api/company/register
echo.
echo ==================================
echo 📁 YOUR JAR FILE IS READY:
echo Location: F:\New folder\HRM-main\target\HRM-1.war
echo Size: 68MB
echo.
echo 🎯 AFTER DEPLOYMENT:
echo Frontend: http://129.212.239.12 ✅
echo Backend:  http://129.212.239.12/api ✅
echo Full App: http://129.212.239.12 ✅
echo.
pause
