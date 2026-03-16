@echo off
echo 🔍 Testing HRM Backend Deployment...

echo 1. Checking Java...
java -version

echo.
echo 2. Checking JAR file...
dir "HRM-main\target\HRM-1.war"

echo.
echo 3. Trying to run JAR...
cd "HRM-main\target"
java -jar HRM-1.war --spring.profiles.active=dev

pause
