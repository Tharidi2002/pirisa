#!/bin/bash

# Backend Deployment Script
# Run this on the server to deploy the backend manually

echo "🚀 Deploying HRM Backend..."

# Stop existing service
sudo systemctl stop hrm-backend || true

# Backup current version
if [ -f "/opt/hrm-backend/hrm-backend.jar" ]; then
    cp /opt/hrm-backend/hrm-backend.jar /opt/hrm-backend/hrm-backend.jar.backup
    echo "✅ Backup created"
fi

# Remove old jar
rm -f /opt/hrm-backend/*.jar

# Copy new jar (assumes jar is in current directory)
if [ -f "*.jar" ]; then
    cp *.jar /opt/hrm-backend/hrm-backend.jar
    echo "✅ New JAR file copied"
else
    echo "❌ No JAR file found in current directory"
    exit 1
fi

# Set permissions
chmod +x /opt/hrm-backend/hrm-backend.jar

# Start service
sudo systemctl start hrm-backend
sudo systemctl enable hrm-backend

# Wait for service to start
sleep 10

# Check status
echo "📊 Service Status:"
sudo systemctl status hrm-backend --no-pager

# Check if backend is responding
echo "🔍 Testing Backend API..."
if curl -f http://localhost:8080/api/test > /dev/null 2>&1; then
    echo "✅ Backend is responding correctly"
else
    echo "❌ Backend is not responding"
    echo "📝 Checking logs..."
    sudo journalctl -u hrm-backend --no-pager -n 20
fi

echo "🎉 Deployment completed!"
