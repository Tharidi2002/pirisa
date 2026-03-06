#!/bin/bash

# Quick deployment test script
# Use this to test if everything is working

echo "🧪 Testing Pirisa HRM Deployment..."

# Check if backend is running
echo "1. Checking backend service..."
systemctl is-active --quiet pirisa-backend && echo "   ✅ Backend is running" || echo "   ❌ Backend is not running"

# Check if backend responds
echo "2. Checking backend API..."
curl -f http://localhost:8080/api/health > /dev/null 2>&1 && echo "   ✅ Backend API responds" || echo "   ❌ Backend API not responding"

# Check if nginx is running
echo "3. Checking nginx..."
systemctl is-active --quiet nginx && echo "   ✅ Nginx is running" || echo "   ❌ Nginx is not running"

# Check if frontend files exist
echo "4. Checking frontend files..."
[ -f "/var/www/pirisa/frontend/index.html" ] && echo "   ✅ Frontend files exist" || echo "   ❌ Frontend files missing"

# Check if MySQL is running
echo "5. Checking MySQL..."
systemctl is-active --quiet mysql && echo "   ✅ MySQL is running" || echo "   ❌ MySQL is not running"

# Check disk space
echo "6. Checking disk space..."
df -h / | awk 'NR==2 {print "   💾 Disk usage: " $5 " (" $3 " used of " $2 ")"}'

# Check memory
echo "7. Checking memory..."
free -h | awk 'NR==2 {print "   🧠 Memory: " $3 " used of " $2}'

echo ""
echo "✅ Test complete!"
