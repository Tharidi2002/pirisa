@echo off
cls
echo 🚨 PRODUCTION BACKEND DEPLOYMENT - COMPLETE GUIDE
echo ===============================================
echo.
echo 🔍 CURRENT ISSUE ANALYSIS:
echo ============================
echo ❌ Frontend: http://129.212.239.12 (WORKING)
echo ❌ Backend:  http://129.212.239.12/api (502 Bad Gateway)
echo.
echo 🔧 ROOT CAUSE:
echo ================
echo - Nginx proxy is configured but backend is not running
echo - Backend JAR needs to be deployed and started
echo.
echo 📋 DEPLOYMENT FILES READY:
echo ==========================
echo ✅ Backend JAR: HRM-1.war (68MB)
echo ✅ Frontend Build: dist folder
echo ✅ Database Config: Production ready
echo ✅ API Config: Production ready
echo.
echo 🚀 STEP-BY-STEP DEPLOYMENT:
echo ==========================
echo.
echo STEP 1: Upload Files to Server
echo ============================
echo Upload these files to 129.212.239.12:
echo - HRM-1.war (Backend JAR)
echo - dist folder (Frontend)
echo.
echo STEP 2: Database Setup
echo ===================
echo mysql -h 129.212.239.12 -u root -pIjse@123
echo CREATE DATABASE IF NOT EXISTS hrm;
echo exit;
echo.
echo STEP 3: Start Backend
echo ===================
echo java -jar HRM-1.war
echo.
echo STEP 4: Update Nginx (if needed)
echo =============================
echo Make sure nginx proxies /api to localhost:8080
echo.
echo STEP 5: Test
echo =========
echo curl http://129.212.239.12/api/company/register
echo.
echo 🎯 EXPECTED RESULT:
echo ==================
echo ✅ Frontend: http://129.212.239.12
echo ✅ Backend:  http://129.212.239.12/api
echo ✅ Full App: Working
echo.
echo 📁 FILE LOCATIONS:
echo ==================
echo Backend JAR: F:\New folder\HRM-main\target\HRM-1.war
echo Frontend:   F:\New folder\PirisaHR-main\dist
echo.
echo 🚨 CRITICAL POINT:
echo ==================
echo The 502 error means nginx cannot find the backend.
echo Deploy the JAR file and start it to fix this!
echo.
pause
