@echo off
echo Starting Pirisa HRM Backend Deployment...

cd /d F:\git\pirisa\HRM-main

echo Building backend JAR file...
call mvn clean package -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Starting backend server...
java -jar target\HRM-1.war

pause
