#!/bin/bash

# Quick Production Setup Script
# Run this on your DigitalOcean droplet to fix the 502 error

echo "🚀 Quick Fix for 502 Bad Gateway Error"
echo "======================================"

# Step 1: Run diagnostic first
echo "📍 Step 1: Running diagnostic..."
chmod +x diagnose-production.sh
sudo ./diagnose-production.sh

echo ""
echo "📍 Step 2: Applying fixes..."
chmod +x fix-production.sh
sudo ./fix-production.sh

echo ""
echo "📍 Step 3: Testing the fix..."
echo "Testing frontend:"
curl -s -I http://129.212.239.12/ | head -1

echo "Testing backend API:"
curl -s -I http://129.212.239.12/api/health | head -1

echo ""
echo "✅ Quick fix complete!"
echo "Access your application at:"
echo "Frontend: http://129.212.239.12"
echo "Backend API: http://129.212.239.12/api"
