#!/bin/bash

# Quick Backend Check Script
echo "🔍 Checking Backend Status on Production Server"
echo "=============================================="

# Check if Java is installed
echo "📍 Java Installation:"
java -version 2>&1 || echo "❌ Java not installed"

# Check if backend service exists
echo ""
echo "📍 Backend Service Status:"
if systemctl list-unit-files | grep -q "pirisa-backend"; then
    echo "✅ Service found"
    systemctl status pirisa-backend --no-pager -l
else
    echo "❌ pirisa-backend service not found"
fi

# Check port 8080
echo ""
echo "📍 Port 8080 Status:"
netstat -tlnp | grep ":8080 " || echo "❌ Nothing listening on port 8080"

# Check Java processes
echo ""
echo "📍 Java Processes:"
ps aux | grep java | grep -v grep || echo "❌ No Java processes running"

# Check application files
echo ""
echo "📍 Application Files:"
if [ -f "/var/www/pirisa/backend/app.jar" ]; then
    echo "✅ JAR file exists"
    ls -lh /var/www/pirisa/backend/app.jar
else
    echo "❌ JAR file not found at /var/www/pirisa/backend/app.jar"
fi

# Check logs
echo ""
echo "📍 Backend Logs:"
if [ -f "/var/log/pirisa/backend.log" ]; then
    echo "📄 Recent logs:"
    tail -20 /var/log/pirisa/backend.log
else
    echo "❌ Log file not found"
fi

# Test API directly
echo ""
echo "📍 API Test:"
curl -s http://localhost:8080/api/health 2>&1 || echo "❌ API not responding"

echo ""
echo "🔍 Check Complete!"
