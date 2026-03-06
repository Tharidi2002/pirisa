#!/bin/bash

# Database Setup Script
# Run this on your droplet to set up MySQL database

set -e

echo "🗄️  Setting up MySQL database for Pirisa HRM..."

# Install MySQL
echo "📦 Installing MySQL..."
sudo apt update
sudo apt install -y mysql-server

# Secure MySQL installation
echo "🔒 Starting MySQL service..."
sudo systemctl start mysql
sudo systemctl enable mysql

# Create database and user
echo "📝 Creating database and user..."
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS pirisa_hrm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'pirisa_user'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON pirisa_hrm.* TO 'pirisa_user'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✅ Database setup completed!"
echo ""
echo "⚠️  IMPORTANT: Change the default password!"
echo "   Run: sudo mysql"
echo "   Then: ALTER USER 'pirisa_user'@'localhost' IDENTIFIED BY 'your-strong-password';"
echo ""
echo "📝 Update /var/www/pirisa/backend/application.properties with:"
echo "   spring.datasource.url=jdbc:mysql://localhost:3306/pirisa_hrm"
echo "   spring.datasource.username=pirisa_user"
echo "   spring.datasource.password=your-strong-password"
