@echo off
echo Starting Pirisa HRM Frontend Deployment...

cd /d F:\git\pirisa\PirisaHR-main

echo Installing dependencies...
call npm install

echo Building for production...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Trying alternative method...
    echo Using development server for now...
    call npm run dev
) else (
    echo Build successful! Files are in dist/ folder
)

pause
