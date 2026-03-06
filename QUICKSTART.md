# 🚀 Quick Start: DigitalOcean Deployment

## ⚡ Fast Track (5 Steps)

### 1. Create Droplet
- Go to DigitalOcean → Create Droplet
- Ubuntu 22.04, 2GB RAM minimum
- Note your IP address

### 2. Run Server Setup
```bash
# Connect to droplet
ssh root@YOUR_DROPLET_IP

# Download and run setup
curl -o setup.sh https://raw.githubusercontent.com/Tharidi2002/pirisa/main/deploy-scripts/server-setup.sh
chmod +x setup.sh
sudo ./setup.sh

# Setup database
curl -o db-setup.sh https://raw.githubusercontent.com/Tharidi2002/pirisa/main/deploy-scripts/setup-database.sh
chmod +x db-setup.sh
sudo ./db-setup.sh
```

### 3. Configure Database
```bash
sudo nano /var/www/pirisa/backend/application.properties
```
Update password and settings from the template.

### 4. Add GitHub Secrets
In GitHub repository → Settings → Secrets:
- `DROPLET_IP`: Your droplet IP
- `DROPLET_USER`: root
- `SSH_PRIVATE_KEY`: Your SSH private key

### 5. Push to Deploy
```bash
git push origin main
```

## 🎯 Your app will be live at:
- **Frontend:** http://YOUR_DROPLET_IP
- **Backend:** http://YOUR_DROPLET_IP/api

---

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
