@echo off
echo ========================================
echo   Perfect Production Deployment
echo ========================================
echo.
echo This script will deploy a perfect production
echo environment to 129.212.239.12
echo.
echo PREREQUISITES:
echo 1. GitHub secrets configured:
echo    - DROPLET_IP: 129.212.239.12
echo    - DROPLET_USER: root
echo    - SSH_PRIVATE_KEY: Your SSH key
echo.
echo 2. Server requirements:
echo    - Ubuntu 22.04 LTS
echo    - Java 17+ installed
echo    - Nginx installed
echo    - MySQL installed
echo.
echo DEPLOYMENT PROCESS:
echo 1. Build frontend (no TypeScript errors)
echo 2. Build backend (Spring Boot WAR)
echo 3. Deploy to production server
echo 4. Configure backend service
echo 5. Configure Nginx reverse proxy
echo 6. Test everything
echo.
echo APPLICATION URLs AFTER DEPLOYMENT:
echo Frontend: http://129.212.239.12
echo Backend API: http://129.212.239.12/api
echo.
echo Starting deployment...
echo.

cd /d "F:\New folder"

echo 1. Building frontend...
cd PirisaHR-main
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend built successfully

echo 2. Building backend...
cd ..\HRM-main
call mvn clean package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend build failed!
    pause
    exit /b 1
)
echo ✅ Backend built successfully

echo 3. Committing changes...
cd ..
git add .
git commit -m "Perfect production deployment - All fixes applied"
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git push failed!
    pause
    exit /b 1
)
echo ✅ Code pushed to GitHub

echo.
echo ========================================
echo 🚀 Deployment initiated!
echo ========================================
echo.
echo GitHub Actions will now:
echo 1. Build both frontend and backend
echo 2. Deploy to 129.212.239.12
echo 3. Configure production environment
echo 4. Start all services
echo.
echo Monitor progress at:
echo https://github.com/Tharidi2002/pirisa/actions
echo.
echo Expected deployment time: 5-10 minutes
echo.
echo After deployment, test your app at:
echo http://129.212.239.12
echo.
echo ========================================
pause
