#!/bin/bash

# HRM Production Deployment Script - FIXED VERSION
echo "🚀 HRM Backend Production Deployment"
echo "=================================="

# Configuration
JAR_FILE="HRM-1.war"
SERVER_IP="129.212.239.12"
DB_HOST="129.212.239.12"
DB_PORT="3306"
DB_NAME="HRM"
DB_USER="root"
DB_PASS="Ijse@123"

echo "📋 Configuration:"
echo "Server: $SERVER_IP"
echo "Database: $DB_HOST:$DB_PORT/$DB_NAME"
echo "JAR File: $JAR_FILE"
echo

# 1. Check if JAR file exists
if [ ! -f "$JAR_FILE" ]; then
    echo "❌ ERROR: JAR file not found: $JAR_FILE"
    echo "Please upload HRM-1.war to this directory"
    exit 1
fi
echo "✅ JAR file found"

# 2. Check Java
java -version > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Java is installed"
else
    echo "❌ ERROR: Java not found"
    echo "Install Java 11+: sudo apt install openjdk-11-jre"
    exit 1
fi

# 3. Test Database Connection
echo "🔍 Testing database connection..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ ERROR: Database connection failed"
    echo "Check MySQL server and credentials"
    exit 1
fi

# 4. Create Database
echo "🗄️ Setting up database..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" > /dev/null 2>&1
echo "✅ Database ready"

# 5. Stop Existing Application
echo "🛑 Stopping existing application..."
pkill -f "$JAR_FILE" > /dev/null 2>&1
sleep 3

# 6. Start Application
echo "🚀 Starting HRM Backend..."
nohup java -jar $JAR_FILE > application.log 2>&1 &
APP_PID=$!

# 7. Wait for Startup
echo "⏳ Waiting for application to start..."
sleep 15

# 8. Check if Running
if ps -p $APP_PID > /dev/null; then
    echo "✅ Application started successfully (PID: $APP_PID)"
    echo "📋 Logs: tail -f application.log"
    echo "🔗 API URL: http://$SERVER_IP/api"
    
    # 9. Test API
    echo "🧪 Testing API..."
    sleep 5
    curl -f -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/company/register | grep -q "200\|405"
    if [ $? -eq 0 ]; then
        echo "✅ API is responding"
    else
        echo "⚠️  API not ready yet, check logs"
    fi
    
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "📊 Status: http://$SERVER_IP/api/company/register"
else
    echo "❌ Application failed to start"
    echo "📋 Check logs:"
    tail -20 application.log
    exit 1
fi
