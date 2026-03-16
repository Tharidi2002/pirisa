@echo off
cls
echo 🎯 SETUP WITH YOUR EXISTING 'hrm' DATABASE
echo ==========================================
echo.
echo ✅ You already have the 'hrm' database!
echo ✅ Backend is configured to use it
echo ✅ Ready to start!
echo.
echo 📋 STEP-BY-STEP INSTRUCTIONS:
echo ==============================
echo.
echo STEP 1: START BACKEND
echo ==================
echo ✅ You're already in the correct folder
echo ✅ Run this command:
echo.
echo    java -jar HRM-1.war
echo.
echo ⏳ Wait for it to start (you'll see "Started HrmApplication")
echo.
echo STEP 2: START FRONTEND (New Terminal)
echo ====================================
echo Open NEW PowerShell and run:
echo.
echo    cd "F:\New folder\PirisaHR-main"
echo    npm run dev
echo.
echo STEP 3: TEST THE APPLICATION
echo ============================
echo ✅ Frontend: http://localhost:5174
echo ✅ Backend:  http://localhost:8080/api
echo ✅ Database: Your existing 'hrm' database
echo.
echo STEP 4: TEST REGISTRATION
echo ========================
echo 1. Open http://localhost:5174
echo 2. Go to Company Registration
echo 3. Fill form and submit
echo 4. Check your 'hrm' database for new data
echo.
echo 🎯 EXPECTED OUTPUT:
echo ===================
echo Backend will show:
echo "Started HrmApplication in X seconds"
echo "Tomcat started on port(s): 8080"
echo.
echo 🚀 YOUR SETUP:
echo ==============
echo ✅ Database: hrm (your existing database)
echo ✅ Backend: http://localhost:8080/api
echo ✅ Frontend: http://localhost:5174
echo.
echo 🎉 START NOW: Run "java -jar HRM-1.war"
echo.
pause
