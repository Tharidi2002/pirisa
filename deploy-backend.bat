@echo off
echo 🚀 Starting HRM Backend Deployment...

REM 1. Check if JAR file exists
if not exist "HRM-1.war" (
    echo ❌ Error: HRM-1.war file not found!
    pause
    exit /b 1
)
echo ✅ JAR file found

REM 2. Check Java installation
java -version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Java is installed
) else (
    echo ❌ Java not found. Please install Java 11+
    pause
    exit /b 1
)

REM 3. Stop existing application (if running)
echo 🛑 Stopping existing application...
taskkill /f /im java.exe >nul 2>&1

REM 4. Start the application
echo 🚀 Starting HRM Backend...
start "HRM Backend" java -jar HRM-1.war

REM 5. Wait for startup
echo ⏳ Waiting for application to start...
timeout /t 15

echo ✅ Application started!
echo 🔗 API URL: http://129.212.239.12/api
echo 🧪 Test API: curl http://129.212.239.12/api/company/register
echo 🎉 Deployment completed!
pause
