#!/bin/bash

# HRM Backend Deployment Script
echo "🚀 Starting HRM Backend Deployment..."

# 1. Check if JAR file exists
if [ ! -f "HRM-1.war" ]; then
    echo "❌ Error: HRM-1.war file not found!"
    exit 1
fi

echo "✅ JAR file found"

# 2. Check Java installation
java -version
if [ $? -eq 0 ]; then
    echo "✅ Java is installed"
else
    echo "❌ Java not found. Please install Java 11+"
    exit 1
fi

# 3. Check MySQL connection
echo "🔍 Testing MySQL connection..."
mysql -h 129.212.239.12 -u root -pIjse@123 -e "SELECT 1;"
if [ $? -eq 0 ]; then
    echo "✅ MySQL connection successful"
else
    echo "❌ MySQL connection failed"
    exit 1
fi

# 4. Create database if not exists
echo "🗄️ Creating database..."
mysql -h 129.212.239.12 -u root -pIjse@123 -e "CREATE DATABASE IF NOT EXISTS HRM;"

# 5. Stop existing application (if running)
echo "🛑 Stopping existing application..."
pkill -f "HRM-1.war"

# 6. Start the application
echo "🚀 Starting HRM Backend..."
nohup java -jar HRM-1.war > application.log 2>&1 &

# 7. Wait for startup
echo "⏳ Waiting for application to start..."
sleep 10

# 8. Check if application is running
if pgrep -f "HRM-1.war" > /dev/null; then
    echo "✅ Application started successfully!"
    echo "📋 Application logs: tail -f application.log"
    echo "🔗 API URL: http://129.212.239.12/api"
    echo "🧪 Test API: curl http://129.212.239.12/api/company/register"
else
    echo "❌ Application failed to start"
    echo "📋 Check logs: cat application.log"
    exit 1
fi

echo "🎉 Deployment completed!"
