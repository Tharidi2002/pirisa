@echo off
cls
echo 🔍 JAVA DIAGNOSTIC CHECK
echo ========================
echo.
echo 📋 CHECKING JAVA INSTALLATION:
echo ==============================
echo.
echo 1️⃣ JAVA VERSION:
java -version
echo.
echo 2️⃣ JAVA LOCATION:
where java
echo.
echo 3️⃣ JAVA HOME:
echo JAVA_HOME: %JAVA_HOME%
echo.
echo 4️⃣ CURRENT DIRECTORY:
echo Current: %CD%
echo.
echo 5️⃣ JAR FILE CHECK:
echo HRM-1.war exists:
if exist "HRM-1.war" (
    echo ✅ Found HRM-1.war
    dir HRM-1.war
) else (
    echo ❌ HRM-1.war not found
)
echo.
echo 📋 TROUBLESHOOTING STEPS:
echo ========================
echo.
echo IF JAVA NOT WORKING:
echo 1️⃣ Check if Java is properly installed
echo 2️⃣ Try full path: "C:\Program Files\Common Files\Oracle\Java\javapath\java.exe" -jar HRM-1.war
echo 3️⃣ Or use: "C:\Program Files\Java\jdk-24\bin\java.exe" -jar HRM-1.war
echo.
echo IF JAR FILE ISSUE:
echo 1️⃣ Make sure you're in: F:\New folder\HRM-main\target
echo 2️⃣ Check file permissions
echo 3️⃣ Try with full path: java -jar "F:\New folder\HRM-main\target\HRM-1.war"
echo.
echo 🚀 ALTERNATIVE COMMANDS TO TRY:
echo ===============================
echo.
echo Command 1: "C:\Program Files\Common Files\Oracle\Java\javapath\java.exe" -jar HRM-1.war
echo Command 2: "C:\Program Files\Java\jdk-24\bin\java.exe" -jar HRM-1.war
echo Command 3: java -jar "%CD%\HRM-1.war"
echo.
pause
