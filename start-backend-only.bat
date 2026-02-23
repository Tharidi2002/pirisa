@echo off
echo ========================================
echo Starting Pirisa HRM Backend Only
echo ========================================
echo.

echo Setting up Java environment...
set JAVA_HOME=D:\Program Files\Java\jdk-11.0.17
set PATH=%JAVA_HOME%\bin;%PATH%
echo Java version:
java -version
echo.

echo Killing any existing process on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080"') do (
    echo Killing process %%a on port 8080
    taskkill /PID %%a /F >nul 2>&1
)
echo.

echo Compiling and Starting Backend...
cd /d "%~dp0HRM-main"
echo Building with Maven...
call mvnw.cmd clean package -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Check the errors above.
    pause
    exit /b 1
)

echo Starting Backend Server...
start "HRM Backend" cmd /k "echo Backend Running on http://localhost:8080 && %JAVA_HOME%\bin\java -jar target\HRM-1.war --server.port=8080"

echo.
echo ========================================
echo Backend Started Successfully!
echo ========================================
echo API Base URL: http://localhost:8080
echo Login Endpoint: http://localhost:8080/login
echo.
echo Press any key to exit...
pause >nul
