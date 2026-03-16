#!/bin/bash

# Production Diagnostic Script for Pirisa HRM
# This script diagnoses issues with the production deployment

set -e

echo "🔍 Production Diagnostic for Pirisa HRM"
echo "========================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

echo ""
echo "📍 1. Checking Backend Service Status..."
echo "======================================"

# Check if pirisa-backend service exists
if systemctl list-unit-files | grep -q "pirisa-backend"; then
    echo "✅ pirisa-backend service found"
    
    # Check service status
    echo "📊 Service status:"
    systemctl status pirisa-backend --no-pager || echo "❌ Service not running"
    
    # Check if service is enabled
    if systemctl is-enabled --quiet pirisa-backend; then
        echo "✅ Service is enabled on boot"
    else
        echo "❌ Service is not enabled on boot"
    fi
else
    echo "❌ pirisa-backend service not found"
fi

echo ""
echo "📍 2. Checking Backend Process..."
echo "==============================="

# Check if Java process is running on port 8080
if netstat -tlnp | grep -q ":8080 "; then
    echo "✅ Process found on port 8080"
    netstat -tlnp | grep ":8080 "
else
    echo "❌ No process found on port 8080"
fi

# Check for any Java processes
echo "🔍 Java processes:"
ps aux | grep java | grep -v grep || echo "❌ No Java processes found"

echo ""
echo "📍 3. Checking Application Files..."
echo "=================================="

APP_DIR="/var/www/pirisa"
BACKEND_DIR="$APP_DIR/backend"

if [ -d "$BACKEND_DIR" ]; then
    echo "✅ Backend directory exists: $BACKEND_DIR"
    
    if [ -f "$BACKEND_DIR/app.jar" ]; then
        echo "✅ Backend JAR file exists"
        ls -lh "$BACKEND_DIR/app.jar"
    else
        echo "❌ Backend JAR file not found"
    fi
    
    if [ -f "$BACKEND_DIR/application.properties" ]; then
        echo "✅ Application properties file exists"
    else
        echo "❌ Application properties file not found"
    fi
else
    echo "❌ Backend directory not found: $BACKEND_DIR"
fi

echo ""
echo "📍 4. Checking Nginx Configuration..."
echo "==================================="

# Check nginx status
echo "📊 Nginx status:"
systemctl status nginx --no-pager || echo "❌ Nginx not running"

# Check nginx configuration
echo "🔍 Testing nginx config:"
nginx -t || echo "❌ Nginx configuration error"

# Check if nginx site exists
if [ -f "/etc/nginx/sites-available/pirisa" ]; then
    echo "✅ Nginx site configuration exists"
    echo "📄 Nginx configuration:"
    cat /etc/nginx/sites-available/pirisa
else
    echo "❌ Nginx site configuration not found"
fi

echo ""
echo "📍 5. Checking Database Connection..."
echo "==================================="

# Check MySQL status
echo "📊 MySQL status:"
systemctl status mysql --no-pager || echo "❌ MySQL not running"

# Test database connection
echo "🔍 Testing database connection:"
mysql -u root -p'Ijse@123' -e "SHOW DATABASES;" 2>/dev/null || echo "❌ Database connection failed"

echo ""
echo "📍 6. Checking Logs..."
echo "===================="

# Check backend logs
if [ -f "/var/log/pirisa/backend.log" ]; then
    echo "📄 Recent backend logs:"
    tail -20 /var/log/pirisa/backend.log
else
    echo "❌ Backend log file not found"
fi

# Check nginx logs
echo "📄 Recent nginx error logs:"
tail -10 /var/log/nginx/error.log

echo ""
echo "📍 7. Testing Backend API..."
echo "==========================="

# Test backend API locally
echo "🔍 Testing local API:"
curl -s http://localhost:8080/api/health 2>/dev/null || echo "❌ Local API test failed"

echo ""
echo "🔍 Diagnostic Complete!"
echo "======================="
echo "Review the output above to identify issues."
echo "Common fixes:"
echo "1. If backend service not found: Create systemd service"
echo "2. If backend not running: Restart the service"
echo "3. If JAR file missing: Redeploy the application"
echo "4. If database connection failed: Check MySQL credentials"
