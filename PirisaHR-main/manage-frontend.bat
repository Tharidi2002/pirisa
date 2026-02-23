@echo off
setlocal enabledelayedexpansion

title HRM Frontend Profile Image Management
color 0B

echo ==========================================
echo   HRM Frontend Profile Image
echo        Management System
echo ==========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 16 or higher and try again
    pause
    exit /b 1
)

:: Set project paths
set FRONTEND_DIR=F:\KnoWeb-office\Pirisa\PirisaHR-frontend
set BACKEND_URL=http://localhost:8080
set LOG_FILE=%FRONTEND_DIR%\frontend-logs.txt

echo [INFO] Frontend Directory: %FRONTEND_DIR%
echo [INFO] Backend URL: %BACKEND_URL%
echo [INFO] Log File: %LOG_FILE%
echo.

:menu
cls
echo ==========================================
echo       FRONTEND MENU
echo ==========================================
echo.
echo 1. Start Frontend Server
echo 2. Stop Frontend Server
echo 3. Check Frontend Status
echo 4. Install Dependencies
echo 5. Build Production Version
echo 6. Test Profile Image Upload
echo 7. View Frontend Logs
echo 8. Clear Frontend Cache
echo 9. Browser Test Tools
echo 10. System Information
echo 0. Exit
echo.
set /p choice="Select an option (0-10): " 

if "%choice%"=="1" goto start_frontend
if "%choice%"=="2" goto stop_frontend
if "%choice%"=="3" goto check_frontend_status
if "%choice%"=="4" goto install_deps
if "%choice%"=="5" goto build_production
if "%choice%"=="6" goto test_upload
if "%choice%"=="7" goto view_frontend_logs
if "%choice%"=="8" goto clear_cache
if "%choice%"=="9" goto browser_tools
if "%choice%"=="10" goto system_info
if "%choice%"=="0" goto exit
echo [ERROR] Invalid choice. Please try again.
pause
goto menu

:start_frontend
cls
echo ==========================================
echo      STARTING FRONTEND SERVER
echo ==========================================
echo.
cd /d "%FRONTEND_DIR%"
echo [INFO] Changing to frontend directory...
echo [INFO] Starting React development server...

:: Check if port 5173 is already in use
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 5173 is already in use
    echo [INFO] Attempting to stop existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
        taskkill /f /pid %%a >nul 2>&1
        echo [INFO] Terminated process %%a
    )
    timeout /t 2 >nul
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo [WARNING] Dependencies not found. Installing first...
    call :install_deps
)

:: Start the frontend server
echo [%date% %time%] Starting frontend server... >> "%LOG_FILE%"
npm run dev > frontend-output.log 2>&1

:: Check if server started successfully
timeout /t 10 >nul
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Frontend server started successfully
    echo [INFO] Server running at: http://localhost:5173
    echo [%date% %time%] Frontend started successfully >> "%LOG_FILE%"
    echo.
    echo Press Ctrl+C to stop the server
    echo Frontend logs are being written to: frontend-output.log
    echo.
    echo [INFO] Backend should be running at: %BACKEND_URL%
    echo [INFO] Open browser and navigate to: http://localhost:5173
    echo.
) else (
    echo [ERROR] Failed to start frontend server
    echo [%date% %time%] Frontend startup failed >> "%LOG_FILE%"
    echo Check frontend-output.log for details
    pause
)
goto menu

:stop_frontend
cls
echo ==========================================
echo      STOPPING FRONTEND SERVER
echo ==========================================
echo.
echo [INFO] Checking for running Node.js processes...

:: Kill Node.js processes on port 5173
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo [INFO] Stopping Node.js process %%a...
    taskkill /f /pid %%a >nul 2>&1
    if %errorlevel% equ 0 (
        echo [SUCCESS] Process %%a terminated
        echo [%date% %time%] Frontend process %%a terminated >> "%LOG_FILE%"
    ) else (
        echo [ERROR] Failed to terminate process %%a
    )
)

:: Also kill any remaining Node.js processes from this directory
taskkill /f /im node.exe /fi "windowtitle eq *npm*" >nul 2>&1

:: Verify server is stopped
timeout /t 2 >nul
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo [WARNING] Frontend server may still be running
) else (
    echo [SUCCESS] Frontend server stopped successfully
    echo [%date% %time%] Frontend stopped >> "%LOG_FILE%"
)
pause
goto menu

:check_frontend_status
cls
echo ==========================================
echo      FRONTEND STATUS CHECK
echo ==========================================
echo.
echo [INFO] Checking frontend server status...

netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo [RUNNING] Frontend server is running on port 5173
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
        echo [INFO] Process ID: %%a
        echo [INFO] Checking Node.js process...
        tasklist /fi "PID eq %%a" /fo table 2>nul
    )
    echo [INFO] Frontend URL: http://localhost:5173
) else (
    echo [STOPPED] Frontend server is not running
)

echo.
echo [INFO] Checking backend connectivity...
curl -s -o nul "%BACKEND_URL%/api/profile-image/exists/1" >nul 2>&1
if %errorlevel% equ 0 (
    echo [CONNECTED] Backend is accessible at %BACKEND_URL%
) else (
    echo [DISCONNECTED] Backend is not accessible at %BACKEND_URL%
)

echo.
echo [INFO] Checking recent logs...
if exist "%LOG_FILE%" (
    echo ----------------------------------------
    echo Recent log entries:
    echo ----------------------------------------
    powershell "Get-Content '%LOG_FILE%' | Select-Object -Last 5"
) else (
    echo [INFO] No log file found
)
pause
goto menu

:install_deps
cls
echo ==========================================
echo      INSTALLING DEPENDENCIES
echo ==========================================
echo.
cd /d "%FRONTEND_DIR%"
echo [INFO] Installing Node.js dependencies...
echo [%date% %time%] Starting dependency installation... >> "%LOG_FILE%"

npm install > npm-install.log 2>&1

if %errorlevel% equ 0 (
    echo [SUCCESS] Dependencies installed successfully
    echo [%date% %time%] Dependencies installed >> "%LOG_FILE%"
) else (
    echo [ERROR] Dependency installation failed
    echo [%date% %time%] Dependency installation failed >> "%LOG_FILE%"
    echo Check npm-install.log for details
    echo.
    type npm-install.log
)
pause
goto menu

:build_production
cls
echo ==========================================
echo      BUILDING PRODUCTION
echo ==========================================
echo.
cd /d "%FRONTEND_DIR%"
echo [INFO] Building production version...

:: Clean previous build
if exist "dist" (
    echo [INFO] Cleaning previous build...
    rmdir /s /q dist >nul 2>&1
)

:: Build for production
npm run build > build-output.log 2>&1

if %errorlevel% equ 0 (
    echo [SUCCESS] Production build completed
    echo [%date% %time%] Production build successful >> "%LOG_FILE%"
    if exist "dist" (
        echo [INFO] Build files are in: dist\
        dir dist | findstr "File(s)"
    )
) else (
    echo [ERROR] Production build failed
    echo [%date% %time%] Production build failed >> "%LOG_FILE%"
    echo Check build-output.log for details
    echo.
    type build-output.log
)
pause
goto menu

:test_upload
cls
echo ==========================================
echo      TESTING PROFILE UPLOAD
echo ==========================================
echo.

:: Check if both servers are running
netstat -ano | findstr :5173 >nul
if %errorlevel% neq 0 (
    echo [ERROR] Frontend server is not running. Please start it first.
    pause
    goto menu
)

netstat -ano | findstr :8080 >nul
if %errorlevel% neq 0 (
    echo [ERROR] Backend server is not running. Please start it first.
    pause
    goto menu
)

echo [INFO] Both servers are running
echo [INFO] Opening browser for testing...

:: Open browser with frontend
start "" "http://localhost:5173"

echo.
echo ==========================================
echo      MANUAL TEST INSTRUCTIONS
echo ==========================================
echo.
echo 1. Login to the application
echo 2. Navigate to Employee Management
echo 3. Click "Edit" on any employee
echo 4. Test profile image upload:
echo    - Try large image file (^>10MB)
echo    - Try invalid file format
echo    - Try valid image (should auto-compress)
echo    - Check compression info display
echo 5. Verify error messages and popups
echo 6. Test image deletion
echo.
echo [INFO] Check browser console for network requests
echo [INFO] Check frontend-output.log for any errors
echo.

set /p test_done="Have you completed the testing? (y/N): "
if /i "%test_done%"=="y" (
    echo [%date% %time%] Manual testing completed >> "%LOG_FILE%"
    echo [SUCCESS] Testing session logged
)
pause
goto menu

:view_frontend_logs
cls
echo ==========================================
echo      VIEWING FRONTEND LOGS
echo ==========================================
echo.

if exist "%LOG_FILE%" (
    echo [INFO] Displaying log file: %LOG_FILE%
    echo ----------------------------------------
    type "%LOG_FILE%"
    echo ----------------------------------------
    echo.
    echo Log file size: 
    for %%A in ("%LOG_FILE%") do echo %%~zA bytes
) else (
    echo [INFO] No log file found
)

if exist "%FRONTEND_DIR%\frontend-output.log" (
    echo.
    echo ----------------------------------------
    echo Recent frontend output:
    echo ----------------------------------------
    powershell "Get-Content '%FRONTEND_DIR%\frontend-output.log' | Select-Object -Last 10"
)

if exist "%FRONTEND_DIR%\npm-install.log" (
    echo.
    echo ----------------------------------------
    echo Recent npm install output:
    echo ----------------------------------------
    powershell "Get-Content '%FRONTEND_DIR%\npm-install.log' | Select-Object -Last 5"
)

pause
goto menu

:clear_cache
cls
echo ==========================================
echo      CLEARING FRONTEND CACHE
echo ==========================================
echo.

set /p confirm="Are you sure you want to clear frontend cache? (y/N): "
if /i "%confirm%" neq "y" (
    echo [INFO] Cache clearing cancelled
    goto menu
)

cd /d "%FRONTEND_DIR%"
echo [INFO] Clearing Node.js cache...
npm cache clean --force >nul 2>&1

echo [INFO] Clearing browser cache directories...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" >nul 2>&1
    echo [SUCCESS] Node.js cache cleared
)

if exist ".vite" (
    rmdir /s /q ".vite" >nul 2>&1
    echo [SUCCESS] Vite cache cleared
)

echo [INFO] Clearing package-lock.json...
if exist "package-lock.json" (
    del "package-lock.json" >nul 2>&1
    echo [SUCCESS] Package lock file deleted
)

echo [%date% %time%] Frontend cache cleared >> "%LOG_FILE%"
echo [SUCCESS] Frontend cache cleared successfully
pause
goto menu

:browser_tools
cls
echo ==========================================
echo      BROWSER TESTING TOOLS
echo ==========================================
echo.

echo [INFO] Opening browser developer tools...
echo.

:: Check if servers are running
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo [INFO] Opening frontend: http://localhost:5173
    start "" "http://localhost:5173"
) else (
    echo [WARNING] Frontend server not running
)

netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo [INFO] Backend API: %BACKEND_URL%
    echo [INFO] Testing API endpoints:
    echo   - GET %BACKEND_URL%/api/profile-image/exists/1
    echo   - POST %BACKEND_URL%/api/profile-image/upload/1
    echo   - GET %BACKEND_URL%/api/profile-image/view/1
    echo   - DELETE %BACKEND_URL%/api/profile-image/delete/1
    echo.
    echo [INFO] Opening API test in browser...
    start "" "%BACKEND_URL%/api/profile-image/exists/1"
) else (
    echo [WARNING] Backend server not running
)

echo.
echo [INFO] Browser testing tools launched
echo [INFO] Use browser developer tools (F12) to monitor:
echo   - Network requests
echo   - Console errors
echo   - Image compression performance
echo   - Upload progress
pause
goto menu

:system_info
cls
echo ==========================================
echo      FRONTEND SYSTEM INFO
echo ==========================================
echo.

echo [SYSTEM] Operating System:
ver
echo.

echo [NODE] Node.js Version:
node --version
echo.

echo [NPM] NPM Version:
npm --version
echo.

echo [MEMORY] Memory Status:
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:table 2>nul

echo [DISK] Frontend Directory Space:
dir "%FRONTEND_DIR%" | findstr "bytes free"
echo.

echo [NETWORK] Frontend Server Status:
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo Port 5173: IN USE (Frontend)
) else (
    echo Port 5173: AVAILABLE
)

echo [NETWORK] Backend Server Status:
netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo Port 8080: IN USE (Backend)
) else (
    echo Port 8080: AVAILABLE
)

echo.
echo [PROJECT] Frontend Directory:
echo %FRONTEND_DIR%
echo.

echo [DEPENDENCIES] Node Modules:
if exist "node_modules" (
    echo node_modules (EXISTS - Size: 
    dir "node_modules" | findstr "File(s)" 
) else (
    echo node_modules (NOT FOUND)
)

echo.
echo [LOGS] Log File:
if exist "%LOG_FILE%" (
    echo %LOG_FILE% (EXISTS)
) else (
    echo No log file
)

echo.
echo [BUILD] Production Build:
if exist "dist" (
    echo dist\ (EXISTS - Production build ready)
) else (
    echo dist\ (NOT FOUND - No production build)
)
pause
goto menu

:exit
cls
echo ==========================================
echo   THANK YOU FOR USING HRM
echo      FRONTEND MANAGEMENT
echo ==========================================
echo.
echo [INFO] Session ended at %date% %time%
echo [%date% %time%] Session ended >> "%LOG_FILE%" 2>nul
timeout /t 2 >nul
exit /b 0
