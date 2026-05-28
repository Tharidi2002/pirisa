@echo off
set token=eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQ01QTlkiLCJzdWIiOiJhZG1pbiIsImV4cCI6MTc4MDA0MzYyNCwiaWF0IjoxNzc5OTU3MjI0fQ.RtHpAW0uAwdx6KMmbAUdXmKcYxRe6V9VdE_Nk8iwPd0
curl.exe -s -H "Authorization: Bearer %token%" "http://localhost:8080/employee/company/1" > "%~dp0\tmp_company_1.json"
if errorlevel 1 echo ERROR retrieving company employees
curl.exe -s -H "Authorization: Bearer %token%" "http://localhost:8080/employee/EmpDetailsList/1" > "%~dp0\tmp_empdetails_1.json"
if errorlevel 1 echo ERROR retrieving emp details
echo === COMPANY/1 ===
type "%~dp0\tmp_company_1.json"
echo === EMPDETAILS/1 ===
type "%~dp0\tmp_empdetails_1.json"