@echo off
setlocal enabledelayedexpansion

title HRM Profile Image Management System
color 0A

echo ==========================================
echo    HRM Profile Image Management
echo ==========================================
echo.

:: Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH
    echo Please install Java 11 or higher and try again
    pause
    exit /b 1
)

:: Check if Maven is installed
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven is not installed or not in PATH
    echo Please install Maven and try again
    pause
    exit /b 1
)

:: Set project paths
set BACKEND_DIR=F:\KnoWeb-office\Pirisa\HRM-main
set LOG_FILE=%BACKEND_DIR%\profile-image-logs.txt

echo [INFO] Backend Directory: %BACKEND_DIR%
echo [INFO] Log File: %LOG_FILE%
echo.

:menu
cls
echo ==========================================
echo       MAIN MENU
echo ==========================================
echo.
echo 1. Start Backend Server
echo 2. Stop Backend Server
echo 3. Check Server Status
echo 4. Compile Project
echo 5. Test Profile Image API
echo 6. View Logs
echo 7. Clear Logs
echo 8. Database Status Check
echo 9. System Information
echo 0. Exit
echo.
set /p choice="Select an option (0-9): " 

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto stop_server
if "%choice%"=="3" goto check_status
if "%choice%"=="4" goto compile_project
if "%choice%"=="5" goto test_api
if "%choice%"=="6" goto view_logs
if "%choice%"=="7" goto clear_logs
if "%choice%"=="8" goto db_status
if "%choice%"=="9" goto system_info
if "%choice%"=="0" goto exit
echo [ERROR] Invalid choice. Please try again.
pause
goto menu

:start_server
cls
echo ==========================================
echo      STARTING BACKEND SERVER
echo ==========================================
echo.
cd /d "%BACKEND_DIR%"
echo [INFO] Changing to backend directory...
echo [INFO] Starting Spring Boot application...

:: Check if port 8080 is already in use
netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 8080 is already in use
    echo [INFO] Attempting to stop existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
        taskkill /f /pid %%a >nul 2>&1
        echo [INFO] Terminated process %%a
    )
    timeout /t 2 >nul
)

:: Start the server
echo [%date% %time%] Starting server... >> "%LOG_FILE%"
mvn spring-boot:run > server-output.log 2>&1

:: Check if server started successfully
timeout /t 10 >nul
netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Server started successfully on port 8080
    echo [%date% %time%] Server started successfully >> "%LOG_FILE%"
    echo.
    echo Press Ctrl+C to stop the server
    echo Server logs are being written to: server-output.log
    echo.
    tail -f server-output.log 2>nul || type server-output.log
) else (
    echo [ERROR] Failed to start server
    echo [%date% %time%] Server startup failed >> "%LOG_FILE%"
    echo Check server-output.log for details
    pause
)
goto menu

:stop_server
cls
echo ==========================================
echo      STOPPING BACKEND SERVER
echo ==========================================
echo.
echo [INFO] Checking for running processes on port 8080...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    echo [INFO] Stopping process %%a...
    taskkill /f /pid %%a >nul 2>&1
    if %errorlevel% equ 0 (
        echo [SUCCESS] Process %%a terminated
        echo [%date% %time%] Process %%a terminated >> "%LOG_FILE%"
    ) else (
        echo [ERROR] Failed to terminate process %%a
    )
)

:: Verify server is stopped
timeout /t 2 >nul
netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo [WARNING] Server may still be running
) else (
    echo [SUCCESS] Server stopped successfully
    echo [%date% %time%] Server stopped >> "%LOG_FILE%"
)
pause
goto menu

:check_status
cls
echo ==========================================
echo      SERVER STATUS CHECK
echo ==========================================
echo.
echo [INFO] Checking server status...

netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo [RUNNING] Server is running on port 8080
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
        echo [INFO] Process ID: %%a
        echo [INFO] Checking process details...
        tasklist /fi "PID eq %%a" /fo table 2>nul
    )
) else (
    echo [STOPPED] Server is not running
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

:compile_project
cls
echo ==========================================
echo      COMPILING PROJECT
echo ==========================================
echo.
cd /d "%BACKEND_DIR%"
echo [INFO] Cleaning previous builds...
mvn clean >nul 2>&1

echo [INFO] Compiling project...
mvn compile > compile-output.log 2>&1

if %errorlevel% equ 0 (
    echo [SUCCESS] Project compiled successfully
    echo [%date% %time%] Compilation successful >> "%LOG_FILE%"
) else (
    echo [ERROR] Compilation failed
    echo [%date% %time%] Compilation failed >> "%LOG_FILE%"
    echo Check compile-output.log for details
    echo.
    type compile-output.log
)
pause
goto menu

:test_api
cls
echo ==========================================
echo      TESTING PROFILE IMAGE API
echo ==========================================
echo.
echo [INFO] Running Profile Image API Tests...
echo.

:: Test 1: Check if server is running
netstat -ano | findstr :8080 >nul
if %errorlevel% neq 0 (
    echo [ERROR] Server is not running. Please start the server first.
    pause
    goto menu
)

:: Run the test script
if exist "%BACKEND_DIR%\test-profile-api.bat" (
    echo [INFO] Running API test script...
    call "%BACKEND_DIR%\test-profile-api.bat"
) else (
    echo [ERROR] Test script not found at %BACKEND_DIR%\test-profile-api.bat
)
pause
goto menu

:view_logs
cls
echo ==========================================
echo      VIEWING LOGS
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

if exist "%BACKEND_DIR%\server-output.log" (
    echo.
    echo ----------------------------------------
    echo Recent server output:
    echo ----------------------------------------
    powershell "Get-Content '%BACKEND_DIR%\server-output.log' | Select-Object -Last 10"
)

pause
goto menu

:clear_logs
cls
echo ==========================================
echo      CLEARING LOGS
echo ==========================================
echo.

set /p confirm="Are you sure you want to clear all logs? (y/N): "
if /i "%confirm%" neq "y" (
    echo [INFO] Log clearing cancelled
    goto menu
)

echo [INFO] Clearing log files...
if exist "%LOG_FILE%" (
    del "%LOG_FILE%"
    echo [SUCCESS] Application log cleared
)

if exist "%BACKEND_DIR%\server-output.log" (
    del "%BACKEND_DIR%\server-output.log"
    echo [SUCCESS] Server output log cleared
)

if exist "%BACKEND_DIR%\compile-output.log" (
    del "%BACKEND_DIR%\compile-output.log"
    echo [SUCCESS] Compile log cleared
)

echo [%date% %time%] All logs cleared >> "%LOG_FILE%" 2>nul
echo [SUCCESS] All logs cleared successfully
pause
goto menu

:db_status
cls
echo ==========================================
echo      DATABASE STATUS CHECK
echo ==========================================
echo.

:: Check MySQL service
sc query mysql 2>nul | findstr RUNNING >nul
if %errorlevel% equ 0 (
    echo [RUNNING] MySQL service is running
) else (
    echo [WARNING] MySQL service may not be running
    echo [INFO] Attempting to check MySQL process...
    tasklist | findstr mysqld.exe >nul
    if %errorlevel% equ 0 (
        echo [RUNNING] MySQL process found
    ) else (
        echo [STOPPED] MySQL process not found
    )
)

:: Test database connection
echo [INFO] Testing database connection...
cd /d "%BACKEND_DIR%"
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=test-db" > db-test.log 2>&1
timeout /t 5 >nul
taskkill /f /im java.exe >nul 2>&1

echo [INFO] Database connection test completed
echo Check db-test.log for connection details
pause
goto menu

:system_info
cls
echo ==========================================
echo      SYSTEM INFORMATION
echo ==========================================
echo.

echo [SYSTEM] Operating System:
ver
echo.

echo [JAVA] Java Version:
java -version 2>&1 | findstr "version"
echo.

echo [MAVEN] Maven Version:
mvn -version 2>&1 | findstr "Apache Maven"
echo.

echo [MEMORY] Memory Status:
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:table 2>nul

echo [DISK] Disk Space:
dir "%BACKEND_DIR%" | findstr "bytes free"
echo.

echo [NETWORK] Network Status:
netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo Port 8080: IN USE
) else (
    echo Port 8080: AVAILABLE
)

echo.
echo [PROJECT] Backend Directory:
echo %BACKEND_DIR%
echo.

echo [LOGS] Log File:
if exist "%LOG_FILE%" (
    echo %LOG_FILE% (Exists)
) else (
    echo No log file
)
pause
goto menu

:exit
cls
echo ==========================================
echo    THANK YOU FOR USING HRM
echo    PROFILE IMAGE MANAGEMENT
echo ==========================================
echo.
echo [INFO] Session ended at %date% %time%
echo [%date% %time%] Session ended >> "%LOG_FILE%" 2>nul
timeout /t 2 >nul
exit /b 0
