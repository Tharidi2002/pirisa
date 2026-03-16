@echo off
echo ========================================
echo   Quick Backend Fix
echo ========================================
echo.
echo PROBLEM IDENTIFIED:
echo - Server: RUNNING (ping OK)
echo - Nginx: RUNNING (HTTP 200)
echo - Backend: NOT RUNNING (502 Bad Gateway)
echo.
echo SOLUTION: Start the backend service on server
echo.
echo METHOD 1: DigitalOcean Console (Easiest)
echo -----------------------------------------
echo 1. Go to https://cloud.digitalocean.com/
echo 2. Login and find your droplet (129.212.239.12)
echo 3. Click "Console" button
echo 4. Run these commands in the console:
echo.
echo    # Check if backend service exists
echo    systemctl status pirisa-backend
echo.
echo    # If service doesn't exist, create it:
echo    sudo nano /etc/systemd/system/pirisa-backend.service
echo.
echo    # Paste this content (copy-paste):
echo    [Unit]
echo    Description=Pirisa HRM Backend
echo    After=network.target mysql.service
echo.
echo    [Service]
echo    Type=simple
echo    User=www-data
echo    WorkingDirectory=/var/www/pirisa/backend
echo    ExecStart=/usr/bin/java -jar /var/www/pirisa/backend/app.jar
echo    Restart=always
echo    RestartSec=10
echo.
echo    [Install]
echo    WantedBy=multi-user.target
echo.
echo    # Save file (Ctrl+X, Y, Enter)
echo.
echo    # Enable and start service
echo    sudo systemctl daemon-reload
echo    sudo systemctl enable pirisa-backend
echo    sudo systemctl start pirisa-backend
echo.
echo    # Check if JAR file exists
echo    ls -la /var/www/pirisa/backend/app.jar
echo.
echo    # If JAR file doesn't exist, upload it:
echo    # From your local machine run:
echo    scp F:\New folder\HRM-main\target\HRM-1.war root@129.212.239.12:/var/www/pirisa/backend/app.jar
echo.
echo    # Test backend
echo    curl http://localhost:8080/api/health
echo.
echo METHOD 2: SSH Connection
echo -----------------------
echo ssh root@129.212.239.12
echo # Then run the same commands as above
echo.
echo ========================================
echo After fixing, test your application:
echo Frontend: http://129.212.239.12
echo Backend API: http://129.212.239.12/api
echo ========================================
pause
