# 🚀 Deployment Guide: Pirisa HRM to DigitalOcean

This guide will help you deploy your Pirisa HRM application to DigitalOcean with automated CI/CD using GitHub Actions.

## 📋 Prerequisites

- DigitalOcean account
- GitHub account with access to the repository
- Basic knowledge of SSH and Linux commands

---

## 🎯 Step-by-Step Deployment

### 1️⃣ Create a DigitalOcean Droplet

1. **Login to DigitalOcean** (https://cloud.digitalocean.com/)
2. **Click "Create" → "Droplets"**
3. **Configure your droplet:**
   - **Choose an image:** Ubuntu 22.04 LTS
   - **Choose a plan:** Basic (Minimum: 2GB RAM / 1 CPU - $12/month)
   - **Choose a datacenter region:** Select closest to your users
   - **Authentication:** SSH keys (recommended) or password
   - **Hostname:** pirisa-hrm
4. **Click "Create Droplet"**
5. **Note down your droplet IP address** (you'll need this)

---

### 2️⃣ Initial Server Setup

1. **Connect to your droplet via SSH:**
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

2. **Create a non-root user (recommended):**
   ```bash
   adduser deploy
   usermod -aG sudo deploy
   su - deploy
   ```

3. **Upload the setup script to your droplet:**
   ```bash
   # On your local machine
   scp deploy-scripts/server-setup.sh root@YOUR_DROPLET_IP:/tmp/
   scp deploy-scripts/setup-database.sh root@YOUR_DROPLET_IP:/tmp/
   ```

4. **On the droplet, run the server setup:**
   ```bash
   chmod +x /tmp/server-setup.sh
   sudo /tmp/server-setup.sh
   ```

5. **Set up the database:**
   ```bash
   chmod +x /tmp/setup-database.sh
   sudo /tmp/setup-database.sh
   ```

6. **Update database password (IMPORTANT!):**
   ```bash
   sudo mysql
   # In MySQL prompt:
   ALTER USER 'pirisa_user'@'localhost' IDENTIFIED BY 'your-strong-password-here';
   FLUSH PRIVILEGES;
   EXIT;
   ```

---

### 3️⃣ Configure Application Properties

1. **Create production config file:**
   ```bash
   sudo mkdir -p /var/www/pirisa/backend
   sudo nano /var/www/pirisa/backend/application.properties
   ```

2. **Add the following content** (update values):
   ```properties
   server.port=8080
   server.address=localhost
   
   spring.datasource.url=jdbc:mysql://localhost:3306/pirisa_hrm
   spring.datasource.username=pirisa_user
   spring.datasource.password=YOUR_STRONG_PASSWORD_HERE
   
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=false
   
   file.upload-dir=/var/www/pirisa/backend/profile-images
   
   cors.allowed-origins=http://YOUR_DROPLET_IP
   
   jwt.secret=GENERATE_A_STRONG_SECRET_KEY_HERE
   jwt.expiration=86400000
   
   spring.profiles.active=production
   ```

3. **Create profile images directory:**
   ```bash
   sudo mkdir -p /var/www/pirisa/backend/profile-images
   sudo chown -R www-data:www-data /var/www/pirisa
   ```

---

### 4️⃣ Set up GitHub SSH Keys for Deployment

1. **On your droplet, generate SSH key:**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy"
   # Save to default location, no passphrase for automation
   cat ~/.ssh/id_ed25519
   ```

2. **Copy the private key content** (you'll need this for GitHub secrets)

---

### 5️⃣ Configure GitHub Secrets

1. **Go to your GitHub repository:** https://github.com/Tharidi2002/pirisa
2. **Navigate to:** Settings → Secrets and variables → Actions
3. **Click "New repository secret" and add these three secrets:**

   - **Name:** `DROPLET_IP`
     - **Value:** Your droplet IP address (e.g., `123.456.789.012`)

   - **Name:** `DROPLET_USER`
     - **Value:** `root` (or `deploy` if you created a deploy user)

   - **Name:** `SSH_PRIVATE_KEY`
     - **Value:** The entire content of your private key from step 4
     ```
     -----BEGIN OPENSSH PRIVATE KEY-----
     [paste entire key content here]
     -----END OPENSSH PRIVATE KEY-----
     ```

---

### 6️⃣ Update Frontend API Configuration

1. **Update the API endpoint in your frontend:**
   
   Edit `PirisaHR-main/src/api/config/axios.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.PROD 
     ? 'http://YOUR_DROPLET_IP/api'  // Production
     : 'http://localhost:8080/api';   // Development
   ```

2. **Or create an environment file** `.env.production`:
   ```
   VITE_API_BASE_URL=http://YOUR_DROPLET_IP/api
   ```

---

### 7️⃣ Deploy Your Application

1. **Commit all changes to your repository:**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - ✅ Build the backend (Spring Boot)
   - ✅ Build the frontend (React/Vite)
   - ✅ Deploy to your droplet
   - ✅ Restart services
   - ✅ Reload nginx

3. **Monitor the deployment:**
   - Go to GitHub → Actions tab
   - Watch the workflow execution

---

### 8️⃣ Verify Deployment

1. **Check if backend is running:**
   ```bash
   ssh root@YOUR_DROPLET_IP
   sudo systemctl status pirisa-backend
   curl http://localhost:8080/api/health
   ```

2. **Check nginx status:**
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   ```

3. **View logs if needed:**
   ```bash
   sudo tail -f /var/log/pirisa/backend.log
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Access your application:**
   - **Frontend:** http://YOUR_DROPLET_IP
   - **Backend API:** http://YOUR_DROPLET_IP/api

---

## 🔒 Optional: Set up SSL with Domain

If you have a domain name:

1. **Point your domain to droplet IP:**
   - Add an A record: `@` → `YOUR_DROPLET_IP`
   - Add an A record: `www` → `YOUR_DROPLET_IP`

2. **Install SSL certificate:**
   ```bash
   ssh root@YOUR_DROPLET_IP
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Update nginx config to use your domain:**
   ```bash
   sudo nano /etc/nginx/sites-available/pirisa
   # Change: server_name _;
   # To: server_name yourdomain.com www.yourdomain.com;
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Update CORS in application.properties:**
   ```properties
   cors.allowed-origins=https://yourdomain.com,https://www.yourdomain.com
   ```

---

## 🔄 How CI/CD Works

Every time you push to the `main` or `master` branch:

1. ✅ GitHub Actions triggers automatically
2. ✅ Builds backend JAR file
3. ✅ Builds frontend static files
4. ✅ Copies files to droplet
5. ✅ Restarts backend service
6. ✅ Updates frontend files
7. ✅ Reloads nginx
8. ✅ **Your changes are LIVE!**

---

## 🛠️ Useful Commands

### On Droplet:

```bash
# Check backend service status
sudo systemctl status pirisa-backend

# Restart backend
sudo systemctl restart pirisa-backend

# View backend logs
sudo tail -f /var/log/pirisa/backend.log

# Check nginx status
sudo systemctl status nginx

# Reload nginx (after config changes)
sudo nginx -t && sudo systemctl reload nginx

# Check disk space
df -h

# Check memory usage
free -m

# Monitor system resources
htop
```

### Manual Deployment (if needed):

```bash
# On droplet
cd /var/www/pirisa
sudo systemctl stop pirisa-backend
# Upload your JAR file
sudo systemctl start pirisa-backend
```

---

## 🐛 Troubleshooting

### Backend not starting:
```bash
sudo journalctl -u pirisa-backend -n 50
sudo tail -f /var/log/pirisa/backend-error.log
```

### Database connection issues:
```bash
sudo systemctl status mysql
sudo mysql -u pirisa_user -p pirisa_hrm
```

### Nginx issues:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### GitHub Actions failing:
- Check SSH key is correct in GitHub secrets
- Verify droplet IP is correct
- Ensure deploy scripts have execute permissions

---

## 📊 Monitoring & Maintenance

1. **Set up monitoring:**
   - DigitalOcean Monitoring (built-in)
   - Set up alerts for CPU, memory, disk usage

2. **Regular maintenance:**
   ```bash
   # Update system packages (monthly)
   sudo apt update && sudo apt upgrade -y
   
   # Clean old logs (as needed)
   sudo journalctl --vacuum-time=7d
   
   # Check disk usage
   df -h
   ```

3. **Backup database:**
   ```bash
   sudo mysqldump -u pirisa_user -p pirisa_hrm > backup.sql
   ```

---

## 🎉 Success!

Your application is now:
- ✅ Hosted on DigitalOcean
- ✅ Accessible via droplet IP
- ✅ Auto-deploys on every push
- ✅ Backend and frontend working together

**Next Steps:**
- Test all features thoroughly
- Set up domain and SSL
- Configure backups
- Monitor performance
- Add environment-specific configs

---

## 📞 Need Help?

If you encounter issues:
1. Check the logs (see commands above)
2. Verify GitHub Actions workflow execution
3. Ensure all secrets are set correctly
4. Check DigitalOcean droplet console

---

**Created:** March 2026  
**Repository:** https://github.com/Tharidi2002/pirisa.git
