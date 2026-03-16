#!/bin/bash

echo "🔧 Quick Backend Fix Script"
echo "=========================="

# Check if JAR file exists
if [ ! -f "/var/www/pirisa/backend/app.jar" ]; then
    echo "❌ JAR file not found!"
    echo "📝 Please upload JAR file first:"
    echo "   scp F:\New folder\HRM-main\target\HRM-1.war root@129.212.239.12:/var/www/pirisa/backend/app.jar"
    exit 1
fi

# Create backend service
echo "📝 Creating backend service..."
cat > /etc/systemd/system/pirisa-backend.service << 'EOF'
[Unit]
Description=Pirisa HRM Backend
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/pirisa/backend
ExecStart=/usr/bin/java -jar /var/www/pirisa/backend/app.jar
Restart=always
RestartSec=10
StandardOutput=append:/var/log/pirisa/backend.log
StandardError=append:/var/log/pirisa/backend-error.log

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
echo "🔧 Setting permissions..."
mkdir -p /var/www/pirisa/backend
mkdir -p /var/log/pirisa
chown -R www-data:www-data /var/www/pirisa
chmod +x /var/www/pirisa/backend/app.jar

# Start service
echo "🚀 Starting backend service..."
systemctl daemon-reload
systemctl enable pirisa-backend
systemctl start pirisa-backend

# Wait a moment
sleep 3

# Check status
echo "📊 Checking service status..."
systemctl status pirisa-backend --no-pager -l

# Test API
echo "🔍 Testing API..."
curl -s http://localhost:8080/api/health || echo "❌ API not responding yet"

echo "✅ Backend fix complete!"
echo "🌐 Test your app at: http://129.212.239.12/api"
