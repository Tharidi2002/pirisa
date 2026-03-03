@echo off
echo ========================================
echo Starting Pirisa HRM Complete Application
echo ========================================
echo.

echo Setting up Java environment...
set JAVA_HOME=D:\Program Files\Java\jdk-11.0.17
set PATH=%JAVA_HOME%\bin;%PATH%
echo Java version:
java -version
echo.

echo Killing any existing processes on ports 8080 and 5174...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080"') do (
    echo Killing process %%a on port 8080
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5174"') do (
    echo Killing process %%a on port 5174
    taskkill /PID %%a /F >nul 2>&1
)
echo.

echo Starting Backend (Spring Boot)...
cd /d "%~dp0HRM-main"
start "HRM Backend" cmd /k "echo Backend Starting... && %JAVA_HOME%\bin\java -jar target\HRM-1.war --server.port=8080"

echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo Starting Frontend (React/Vite)...
cd /d "%~dp0PirisaHR-frontend"
start "HRM Frontend" cmd /k "echo Frontend Starting... && npm run dev"

echo.
echo ========================================
echo Application Starting Complete!
echo ========================================
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5174
echo.
echo Press any key to exit...
pause >nul
