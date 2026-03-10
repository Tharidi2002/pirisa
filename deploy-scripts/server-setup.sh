#!/bin/bash

# Server Setup Script for Pirisa HRM on DigitalOcean
# Run this script once on your new droplet

set -e

echo "🔧 Setting up server for Pirisa HRM..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Java 17
echo "☕ Installing Java 17..."
sudo apt install -y openjdk-17-jre-headless

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install certbot for SSL (optional but recommended)
echo "🔒 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create application directories
echo "📁 Creating application directories..."
sudo mkdir -p /var/www/pirisa/backend
sudo mkdir -p /var/www/pirisa/frontend
sudo mkdir -p /var/log/pirisa

# Create systemd service for backend
echo "⚙️  Creating backend service..."
sudo tee /etc/systemd/system/pirisa-backend.service > /dev/null <<EOF
[Unit]
Description=Pirisa HRM Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/pirisa/backend
ExecStart=/usr/bin/java -jar /var/www/pirisa/backend/app.jar
Restart=always
RestartSec=10
StandardOutput=append:/var/log/pirisa/backend.log
StandardError=append:/var/log/pirisa/backend-error.log

Environment="JAVA_OPTS=-Xms512m -Xmx1024m"
Environment="SPRING_PROFILES_ACTIVE=production"

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx configuration
echo "🔧 Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/pirisa > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/pirisa/frontend;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Serve profile images
    location /profile-images {
        alias /var/www/pirisa/backend/profile-images;
        autoindex off;
    }
}
EOF

# Enable Nginx site
echo "✅ Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/pirisa /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Set permissions
echo "🔑 Setting permissions..."
sudo chown -R www-data:www-data /var/www/pirisa
sudo chown -R www-data:www-data /var/log/pirisa

# Reload systemd and nginx
echo "🔄 Reloading services..."
sudo systemctl daemon-reload
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo ""
echo "✅ Server setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Update your application.properties for production database"
echo "2. Set up GitHub secrets in your repository"
echo "3. Push to trigger the first deployment"
echo ""
echo "🔐 To enable SSL (recommended):"
echo "   sudo certbot --nginx -d yourdomain.com"
echo ""
