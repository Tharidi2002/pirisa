@echo off
echo Testing SSH Connection to Production Server...
echo.
echo Server: 129.212.239.12
echo User: root
echo.
echo 1. Testing basic SSH connection...
ssh root@129.212.239.12 "echo 'SSH Connection Successful'"
echo.
echo If connection fails above, try:
echo - Check if server is running: ping 129.212.239.12
echo - Try different SSH port: ssh -p 2222 root@129.212.239.12
echo - Use DigitalOcean web console as backup
echo.
pause
