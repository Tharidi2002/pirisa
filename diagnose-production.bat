@echo off
echo ========================================
echo   Production Diagnosis
echo ========================================
echo.
echo Testing connection to production server...
echo.
echo 1. Pinging server...
ping -n 4 129.212.239.12
echo.
echo 2. Testing HTTP connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://129.212.239.12/' -TimeoutSec 10; Write-Host 'HTTP Status:' $response.StatusCode } catch { Write-Host 'HTTP Error:' $_.Exception.Message }"
echo.
echo 3. Testing API connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://129.212.239.12/api/health' -TimeoutSec 10; Write-Host 'API Status:' $response.StatusCode } catch { Write-Host 'API Error:' $_.Exception.Message }"
echo.
echo ========================================
echo Diagnosis Results:
echo - If ping fails: Server is down or network issue
echo - If HTTP fails: Nginx not running or configured wrong
echo - If API fails: Backend service not running
echo ========================================
pause
