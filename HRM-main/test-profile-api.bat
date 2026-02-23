@echo off
echo Testing Profile Image API
echo =========================

set BASE_URL=http://localhost:8080/api/profile-image
set EMP_ID=1

echo.
echo 1. Checking if profile image exists for employee %EMP_ID%...
curl -X GET "%BASE_URL%/exists/%EMP_ID%" -H "Content-Type: application/json"

echo.
echo.
echo 2. Testing profile image upload (you need to provide an image file)...
echo Usage: test-profile-api.bat [path-to-image-file]
if "%~1"=="" (
    echo Please provide an image file path as argument
    echo Example: test-profile-api.bat C:\path\to\image.jpg
    goto :end
)

echo Uploading %1...
curl -X POST "%BASE_URL%/upload/%EMP_ID%" -F "profileImage=@%1"

echo.
echo.
echo 3. Checking if profile image exists after upload...
curl -X GET "%BASE_URL%/exists/%EMP_ID%" -H "Content-Type: application/json"

echo.
echo.
echo 4. To view the image, open this URL in browser:
echo %BASE_URL%/view/%EMP_ID%

echo.
echo.
echo 5. To delete the profile image, run:
echo curl -X DELETE "%BASE_URL%/delete/%EMP_ID%"

:end
echo.
echo Test completed!
pause
