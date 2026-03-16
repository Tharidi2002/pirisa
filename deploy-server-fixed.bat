@echo off
echo 🚀 HRM Backend Production Deployment (Windows)
echo ========================================

set JAR_FILE=HRM-1.war
set SERVER_IP=129.212.239.12
set DB_HOST=129.212.239.12
set DB_PORT=3306
set DB_NAME=HRM
set DB_USER=root
set DB_PASS=Ijse@123

echo 📋 Configuration:
echo Server: %SERVER_IP%
echo Database: %DB_HOST%:%DB_PORT%/%DB_NAME%
echo JAR File: %JAR_FILE%
echo.

REM 1. Check JAR file
if not exist "%JAR_FILE%" (
    echo ❌ ERROR: JAR file not found: %JAR_FILE%
    echo Please upload HRM-1.war to this directory
    pause
    exit /b 1
)
echo ✅ JAR file found

REM 2. Check Java
java -version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Java is installed
) else (
    echo ❌ ERROR: Java not found
    echo Install Java 11+ and try again
    pause
    exit /b 1
)

REM 3. Test Database Connection
echo 🔍 Testing database connection...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% -e "SELECT 1;" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database connection successful
) else (
    echo ❌ ERROR: Database connection failed
    echo Check MySQL server and credentials
    pause
    exit /b 1
)

REM 4. Create Database
echo 🗄️ Setting up database...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;" >nul 2>&1
echo ✅ Database ready

REM 5. Stop Existing Application
echo 🛑 Stopping existing application...
taskkill /f /im java.exe >nul 2>&1
timeout /t 3 >nul

REM 6. Start Application
echo 🚀 Starting HRM Backend...
start "HRM Backend" /min java -jar %JAR_FILE%

REM 7. Wait for Startup
echo ⏳ Waiting for application to start...
timeout /t 15 >nul

REM 8. Test API
echo 🧪 Testing API...
curl -f -s -o nul -w "%%{http_code}" http://localhost:8080/api/company/register | findstr "200 405" >nul
if %errorlevel% equ 0 (
    echo ✅ API is responding
) else (
    echo ⚠️  API not ready yet
)

echo.
echo ✅ DEPLOYMENT COMPLETED!
echo 🔗 API URL: http://%SERVER_IP%/api
echo 🌐 Frontend: http://%SERVER_IP%
echo 📊 Test: http://%SERVER_IP%/api/company/register
echo.
pause
