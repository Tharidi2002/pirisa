@echo off
echo ========================================
echo Uploading Company Logo
echo ========================================
echo.

echo Creating a simple test logo file...
echo This is a test logo file > test-logo.txt

echo Uploading logo for Company ID 1...
curl -X POST http://localhost:8080/logo/upload ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQ01QTlkiLCJzdWIiOiJjb21wYW55IiwiaWF0IjoxNzQwNTkyNjMxLCJleHAiOjE3NDA2NzkwMzF9.test" ^
  -F "comId=1" ^
  -F "logo=@test-logo.txt"

echo.
echo Cleaning up test file...
del test-logo.txt

echo.
echo Company logo uploaded successfully!
echo You can now check the dashboard for the company logo.
echo.
pause
