@echo off
echo Starting Pirisa HRM Backend...
cd /d "F:\New folder\HRM-main"
echo Current directory: %CD%
echo Checking if JAR file exists...
if exist "target\HRM-1.war" (
    echo JAR file found. Starting backend...
    java -jar target\HRM-1.war
) else (
    echo JAR file not found! Please build the project first.
    pause
)
