@echo off
echo Testing Frontend Profile Image Integration
echo ========================================
echo.

echo 1. Make sure backend is running on port 8080
echo 2. Make sure frontend is running (usually on port 5173)
echo 3. Open browser and navigate to: http://localhost:5173
echo.

echo Test Steps:
echo ============
echo.
echo 1. Login to the application
echo 2. Navigate to Employee List
echo 3. Click "Edit" on any employee
echo 4. Verify Profile Image section appears at top of form
echo 5. Test uploading a profile image:
echo    - Click camera icon
echo    - Select an image file (JPEG, PNG, GIF, WebP)
echo    - Verify upload success message
echo    - Verify image displays correctly
echo 6. Test deleting profile image:
echo    - Click trash icon
echo    - Confirm deletion
echo    - Verify image is removed
echo 7. Go back to Employee List
echo 8. Verify profile image appears in table
echo.

echo Validation Tests:
echo =================
echo.
echo - Try uploading invalid file (PDF, TXT) - should show error
echo - Try uploading oversized file (^>10MB) - should show error  
echo - Try uploading empty file - should show error
echo - Test with different image formats
echo - Test network interruption scenarios
echo.

echo API Endpoints to Monitor (in browser dev tools):
echo ==============================================
echo.
echo - GET /api/profile-image/exists/{empId}
echo - POST /api/profile-image/upload/{empId}
echo - GET /api/profile-image/view/{empId}
echo - DELETE /api/profile-image/delete/{empId}
echo.

echo Expected Behavior:
echo ==================
echo.
echo ✓ Profile images display as circular thumbnails
echo ✓ Upload button shows camera icon
echo ✓ Delete button shows trash icon (when image exists)
echo ✓ Loading spinners during operations
echo ✓ Success/error toast notifications
echo ✓ Proper fallback avatar when no image exists
echo ✓ Images appear in employee list table
echo ✓ Form updates include profile image status
echo.

echo Press any key to open browser...
pause > nul

start http://localhost:5173

echo.
echo Test completed! Check browser console for any errors.
pause
