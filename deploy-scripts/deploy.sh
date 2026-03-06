#!/bin/bash

# Deployment script for Pirisa HRM
# This script deploys both backend and frontend

set -e

echo "🚀 Starting deployment..."

# Configuration
APP_DIR="/var/www/pirisa"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
TEMP_DIR="/tmp/pirisa-deploy"

# Create directories if they don't exist
sudo mkdir -p $BACKEND_DIR
sudo mkdir -p $FRONTEND_DIR

# Stop backend service
echo "⏹️  Stopping backend service..."
sudo systemctl stop pirisa-backend || true

# Deploy Backend
echo "📦 Deploying backend..."
sudo cp $TEMP_DIR/HRM-main/target/*.jar $BACKEND_DIR/app.jar
sudo chown -R www-data:www-data $BACKEND_DIR

# Deploy Frontend
echo "🎨 Deploying frontend..."
sudo rm -rf $FRONTEND_DIR/*
sudo cp -r $TEMP_DIR/PirisaHR-main/dist/* $FRONTEND_DIR/
sudo chown -R www-data:www-data $FRONTEND_DIR

# Start backend service
echo "▶️  Starting backend service..."
sudo systemctl start pirisa-backend
sudo systemctl enable pirisa-backend

# Reload nginx
echo "🔄 Reloading nginx..."
sudo nginx -t
sudo systemctl reload nginx

# Cleanup
echo "🧹 Cleaning up..."
rm -rf $TEMP_DIR

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://your-droplet-ip"
echo "🔌 Backend API: http://your-droplet-ip/api"
