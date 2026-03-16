#!/bin/bash

# Production Fix Script for Pirisa HRM
# This script fixes common production deployment issues

set -e

echo "🔧 Production Fix Script for Pirisa HRM"
echo "======================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Configuration
APP_DIR="/var/www/pirisa"
BACKEND_DIR="$APP_DIR/backend"
SERVICE_NAME="pirisa-backend"

echo ""
echo "📍 1. Creating Directories..."
echo "============================="

# Create necessary directories
mkdir -p $BACKEND_DIR
mkdir -p /var/log/pirisa
mkdir -p /var/www/pirisa/frontend

echo "✅ Directories created"

echo ""
echo "📍 2. Creating Systemd Service..."
echo "================================"

# Create systemd service file
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=Pirisa HRM Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$BACKEND_DIR
ExecStart=/usr/bin/java -jar $BACKEND_DIR/app.jar
Restart=always
RestartSec=10
StandardOutput=append:/var/log/pirisa/backend.log
StandardError=append:/var/log/pirisa/backend-error.log
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Systemd service created"

echo ""
echo "📍 3. Creating Application Properties..."
echo "======================================"

# Create production application properties
cat > $BACKEND_DIR/application.properties << EOF
# Production Configuration
spring.application.name=HRM
server.port=8080

# Disable SQL logging in production
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=update

# Production Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/hrm
spring.datasource.username=root
spring.datasource.password=Ijse@123
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT Configuration
jwt.secret=6YS6/n7egeA1Ezi5PpPWKTE7HQ9/4DKbfAKXjiJ1U6M=
jwt.expiration=86400000
spring.main.allow-circular-references=true

# SMTP server configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=knowebtest@gmail.com
spring.mail.password=riem jmmz cyzh fqml
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Stripe Configuration
stripe.api.key=sk_test_51Q5Sl8LS4Zd4e05LgSQbR0smc5P8b9y6Gr6umDayeHDDhRk9nWVjCXgK6gaiWXk98N50F5Kv8HOPd9WKaxsUZdyB00vPmMeKbz
stripe.webhook.secret=whsec_SKZ1Usco60NMBustPeINsLWFrFP3ESxF

# Production Domain
app.domain=http://129.212.239.12

# File upload configuration
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB

# CORS Configuration for production
cors.allowed-origins=http://129.212.239.12

# Production profile
spring.profiles.active=production
EOF

echo "✅ Application properties created"

echo ""
echo "📍 4. Creating Nginx Configuration..."
echo "===================================="

# Create nginx site configuration
cat > /etc/nginx/sites-available/pirisa << EOF
server {
    listen 80;
    server_name 129.212.239.12;
    
    # Frontend files
    location / {
        root /var/www/pirisa/frontend;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/pirisa /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "✅ Nginx configuration created"

echo ""
echo "📍 5. Setting Permissions..."
echo "=========================="

# Set proper permissions
chown -R www-data:www-data $APP_DIR
chown -R www-data:www-data /var/log/pirisa
chmod +x /etc/systemd/system/$SERVICE_NAME.service

echo "✅ Permissions set"

echo ""
echo "📍 6. Starting Services..."
echo "========================="

# Reload systemd
systemctl daemon-reload

# Enable and start backend service
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# Restart nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Services started"

echo ""
echo "📍 7. Verifying Services..."
echo "========================="

# Wait a moment for services to start
sleep 5

# Check service status
echo "📊 Backend service status:"
systemctl is-active $SERVICE_NAME && echo "✅ Backend is running" || echo "❌ Backend failed to start"

echo "📊 Nginx status:"
systemctl is-active nginx && echo "✅ Nginx is running" || echo "❌ Nginx failed to start"

# Test backend API
echo "🔍 Testing backend API:"
curl -s http://localhost:8080/api/health >/dev/null 2>&1 && echo "✅ Backend API responding" || echo "❌ Backend API not responding"

echo ""
echo "📍 8. Final Steps..."
echo "=================="

echo "🔍 Checking if JAR file exists:"
if [ -f "$BACKEND_DIR/app.jar" ]; then
    echo "✅ JAR file found"
    ls -lh "$BACKEND_DIR/app.jar"
else
    echo "❌ JAR file not found at $BACKEND_DIR/app.jar"
    echo "📝 You need to deploy the JAR file from GitHub Actions or manually upload it"
fi

echo ""
echo "🔍 Checking frontend files:"
if [ -d "/var/www/pirisa/frontend" ] && [ "$(ls -A /var/www/pirisa/frontend)" ]; then
    echo "✅ Frontend files found"
else
    echo "❌ Frontend files not found"
    echo "📝 You need to deploy the frontend build from GitHub Actions or manually upload it"
fi

echo ""
echo "✅ Fix Complete!"
echo "================"
echo "Next steps:"
echo "1. Deploy your application using GitHub Actions or manual upload"
echo "2. Check the application at: http://129.212.239.12"
echo "3. Check API at: http://129.212.239.12/api"
echo ""
echo "To view logs:"
echo "  Backend: sudo tail -f /var/log/pirisa/backend.log"
echo "  Nginx: sudo tail -f /var/log/nginx/error.log"
