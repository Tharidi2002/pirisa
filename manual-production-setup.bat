@echo off
echo ========================================
echo   Manual Production Deployment Setup
echo ========================================
echo.
echo This guide helps you deploy manually to 129.212.239.12
echo.
echo STEP 1: Connect to Server
echo ------------------------
echo Open PowerShell/CMD and run:
echo ssh root@129.212.239.12
echo.
echo STEP 2: If SSH Fails, Use DigitalOcean Console
echo ---------------------------------------------
echo 1. Go to https://cloud.digitalocean.com/
echo 2. Login to your account
echo 3. Find your droplet (129.212.239.12)
echo 4. Click "Console" button
echo.
echo STEP 3: Run Server Setup Commands
echo --------------------------------
echo Once connected to server, run:
echo.
echo # Update server
echo sudo apt update && sudo apt upgrade -y
echo.
echo # Install Java
echo sudo apt install openjdk-17-jdk -y
echo.
echo # Install Nginx
echo sudo apt install nginx -y
echo.
echo # Install MySQL (if not installed)
echo sudo apt install mysql-server -y
echo.
echo # Create directories
echo sudo mkdir -p /var/www/pirisa/backend
echo sudo mkdir -p /var/www/pirisa/frontend
echo sudo mkdir -p /var/log/pirisa
echo.
echo STEP 4: Upload Application Files
echo --------------------------------
echo From your local machine, upload files:
echo.
echo # Upload backend JAR
echo scp F:\New folder\HRM-main\target\HRM-1.war root@129.212.239.12:/var/www/pirisa/backend/app.jar
echo.
echo # Upload frontend build
echo scp -r F:\New folder\PirisaHR-main\dist\* root@129.212.239.12:/var/www/pirisa/frontend/
echo.
echo STEP 5: Create Backend Service
echo -------------------------------
echo On server, create service file:
echo sudo nano /etc/systemd/system/pirisa-backend.service
echo.
echo Paste this content:
echo [Unit]
echo Description=Pirisa HRM Backend
echo After=network.target mysql.service
echo.
echo [Service]
echo Type=simple
echo User=www-data
echo WorkingDirectory=/var/www/pirisa/backend
echo ExecStart=/usr/bin/java -jar /var/www/pirisa/backend/app.jar
echo Restart=always
echo.
echo [Install]
echo WantedBy=multi-user.target
echo.
echo Then run:
echo sudo systemctl daemon-reload
echo sudo systemctl enable pirisa-backend
echo sudo systemctl start pirisa-backend
echo.
echo STEP 6: Configure Nginx
echo ------------------------
echo sudo nano /etc/nginx/sites-available/pirisa
echo.
echo Paste this content:
echo server {
echo     listen 80;
echo     server_name 129.212.239.12;
echo.
echo     location / {
echo         root /var/www/pirisa/frontend;
echo         try_files $uri $uri/ /index.html;
echo     }
echo.
echo     location /api {
echo         proxy_pass http://localhost:8080;
echo         proxy_set_header Host $host;
echo         proxy_set_header X-Real-IP $remote_addr;
echo     }
echo }
echo.
echo Then run:
echo sudo ln -s /etc/nginx/sites-available/pirisa /etc/nginx/sites-enabled/
echo sudo rm /etc/nginx/sites-enabled/default
echo sudo nginx -t
echo sudo systemctl restart nginx
echo.
echo STEP 7: Set Permissions
echo -----------------------
echo sudo chown -R www-data:www-data /var/www/pirisa
echo sudo chmod +x /var/www/pirisa/backend/app.jar
echo.
echo STEP 8: Test Everything
echo -----------------------
echo # Test backend
echo curl http://localhost:8080/api/health
echo.
echo # Test nginx
echo sudo systemctl status nginx
echo.
echo # Test backend service
echo sudo systemctl status pirisa-backend
echo.
echo ========================================
echo After setup, access your app at:
echo Frontend: http://129.212.239.12
echo Backend: http://129.212.239.12/api
echo ========================================
pause
