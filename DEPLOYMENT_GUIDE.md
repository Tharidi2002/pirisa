# HRM Backend Deployment Guide

## 🚀 Quick Deployment Setup

### 1. Server Setup (One-time)

SSH into your droplet and run:
```bash
wget https://raw.githubusercontent.com/your-repo/deploy-scripts/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

### 2. GitHub Secrets Setup

In your GitHub repository, add these secrets:

1. **DROPLET_IP**: `129.212.239.12`
2. **DROPLET_USER**: `root`
3. **SSH_PRIVATE_KEY**: Your SSH private key

### 3. Database Setup

The server script creates:
- Database: `hrm_db`
- User: `hrm_user`
- Password: `hrm_password_123`

### 4. Automatic Deployment

Push to `main` or `master` branch to trigger deployment.

## 🔧 Manual Deployment

### Build and Deploy Locally:
```bash
# Build the project
mvn clean package -DskipTests

# Copy to server
scp target/*.jar root@129.212.239.12:/opt/hrm-backend/

# Deploy on server
ssh root@129.212.239.12
cd /opt/hrm-backend
chmod +x deploy-backend.sh
./deploy-backend.sh
```

## 📊 Service Management

### Check Status:
```bash
sudo systemctl status hrm-backend
```

### View Logs:
```bash
sudo journalctl -u hrm-backend -f
```

### Restart Service:
```bash
sudo systemctl restart hrm-backend
```

## 🔍 Testing

### Frontend: http://129.212.239.12
### Backend API: http://129.212.239.12/api

### Test API:
```bash
curl http://129.212.239.12/api/test
```

## 🛠️ Troubleshooting

### Backend Not Responding:
1. Check service status: `sudo systemctl status hrm-backend`
2. Check logs: `sudo journalctl -u hrm-backend -n 50`
3. Verify port: `netstat -tlnp | grep :8080`
4. Check Nginx: `sudo nginx -t && sudo systemctl restart nginx`

### Database Issues:
1. Check MySQL: `sudo systemctl status mysql`
2. Test connection: `mysql -u hrm_user -p hrm_db`

### Permission Issues:
```bash
sudo chown -R root:root /opt/hrm-backend
sudo chmod +x /opt/hrm-backend/hrm-backend.jar
```

## 📁 File Structure

```
/opt/hrm-backend/
├── hrm-backend.jar          # Main application
├── profile-images/          # Uploaded images
└── hrm-backend.jar.backup   # Previous version

/var/log/pirisa/
├── backend.log              # Application logs
└── backend-error.log        # Error logs

/etc/nginx/sites-available/pirisa  # Nginx config
/etc/systemd/system/hrm-backend.service  # Systemd service
```

## 🔐 Security Notes

- Change default passwords in production
- Set up SSL with certbot: `sudo certbot --nginx -d yourdomain.com`
- Configure firewall properly
- Regular security updates
