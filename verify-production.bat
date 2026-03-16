@echo off
echo ========================================
echo   Production Verification
echo ========================================
echo.
echo Testing production deployment...
echo.

echo 1. Testing frontend...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://129.212.239.12/' -TimeoutSec 10; Write-Host '✅ Frontend Status:' $response.StatusCode } catch { Write-Host '❌ Frontend Error:' $_.Exception.Message }"

echo.
echo 2. Testing backend API...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://129.212.239.12/api/health' -TimeoutSec 10; Write-Host '✅ Backend Status:' $response.StatusCode } catch { Write-Host '❌ Backend Error:' $_.Exception.Message }"

echo.
echo 3. Testing server connectivity...
ping -n 2 129.212.239.12 | findstr /i "TTL\|timeout\|unreachable"

echo.
echo ========================================
echo VERIFICATION RESULTS:
echo.
echo If both frontend and backend show ✅:
echo 🎉 Production deployment is successful!
echo.
echo If any show ❌:
echo 1. Check GitHub Actions for deployment errors
echo 2. Run manual setup: manual-production-setup.bat
echo 3. Check server logs via SSH
echo.
echo Application URLs:
echo Frontend: http://129.212.239.12
echo Backend API: http://129.212.239.12/api
echo ========================================
pause
