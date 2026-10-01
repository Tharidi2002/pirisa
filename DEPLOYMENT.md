# HRM Docker Deployment

The repository uses the same source code for local testing and production hosting.

## Local testing

Use the VS Code task `HRM: Create local environment file` once. It copies `.env.example` to `.env` only when `.env` does not already exist, so it will not overwrite this machine's settings. Open `.env` from the Explorer and fill in your own local values. `.env` is ignored by Git and Compose loads it automatically.

Open the task picker with `Ctrl+Shift+P`, choose `Tasks: Run Task`, then select one of the `HRM:` tasks:

- `HRM: Start full Docker stack` builds and starts MySQL, backend, and frontend.
- `HRM: Start frontend and dependencies` builds and starts the frontend plus its backend and MySQL dependencies.
- `HRM: Stop frontend only` leaves backend and MySQL running.
- `HRM: Stop all Docker services` stops/removes containers but keeps the database volume.

You can also create the file manually in PowerShell:

```powershell
Copy-Item .env.example .env
```

Set the local database values to match the existing MySQL volume, and set a private `JWT_SECRET`. Keep real SMTP and Stripe credentials in this file only; rotate any credential that was previously committed. Do not commit `.env`.

Website demo requests are recorded in the private Google spreadsheet instead of being sent by email. Set up the spreadsheet and Apps Script once, then configure `DEMO_SHEETS_WEB_APP_URL` and `DEMO_SHEETS_SHARED_SECRET` in `.env`. Keep the shared secret private and never commit it. SMTP settings remain available for other HRM email notifications.

### Google Sheets demo-request setup

1. Open the `PirisaHR Demo Requests` spreadsheet and confirm the tab is named `Demo Requests`. Row 1 must contain these headers in this exact order: `Submitted At`, `Request ID`, `Full Name`, `Work Email`, `Phone`, `Company`, `Team Size`, `Area of Interest`, `Status`, `Source`.
2. In that spreadsheet, open **Extensions > Apps Script**. Replace the editor contents with `google-apps-script/Code.gs` from this repository and save.
3. In Apps Script, open **Project Settings > Script Properties** and add `SHEET_ID` with the ID from the spreadsheet URL (the text between `/d/` and `/edit`). This is the spreadsheet ID, not the Apps Script deployment ID from the web-app URL. Add `SHARED_SECRET` with a new random value. On Windows PowerShell, generate one with `[guid]::NewGuid().ToString('N')`; use the same value in both Script Properties and the root `.env`.
4. Select `testAppendDemoRequest` in the Apps Script editor and click **Run**. Approve the requested spreadsheet access. Confirm a test row appears, then delete that test row. This verifies Sheet access without deploying a web app.
5. For the Postman/backend test, choose **Deploy > New deployment > Web app**. Set **Execute as** to your account. Allow web-app access required by your setup (typically **Anyone** for an unauthenticated backend request); the spreadsheet itself stays Restricted. The endpoint checks the shared secret on every request. Copy the URL ending in `/exec`.
6. Put that URL in `.env` as `DEMO_SHEETS_WEB_APP_URL` and the same secret as `DEMO_SHEETS_SHARED_SECRET`. Restart the native backend, or recreate the Docker backend after setting the values.
7. In Postman, send `POST http://localhost:8080/email/request-demo`, with `Content-Type: application/json` and a raw JSON body containing `fullName`, `email`, `phone`, `companyName`, `teamSize`, and `message`. A `200` response with `success: true` means Apps Script confirmed the row write. Confirm the new row in the spreadsheet. Missing settings return `503`; Apps Script/write failures return `502`.

Do not put the Apps Script URL or shared secret in frontend variables. Keep the spreadsheet Restricted and share it only with staff who need to view demo requests.

### Google Sheets settings on the systemd server

The current `/root/app.jar` systemd deployment reads `/root/config/application.properties`. In that external file, use the Spring property names below; `DEMO_SHEETS_*` are environment-variable names used by Docker, not the property names bound by the backend when an external config file is selected. The spreadsheet ID belongs only in Apps Script' `SHEET_ID` Script Property.

After pulling the repository to `/root/hrm`, back up both server files, install the repository's systemd unit, and add the settings without printing the secret:

```bash
cd /root/hrm
cp /root/config/application.properties /root/config/application.properties.bak.$(date +%Y%m%d%H%M%S)
cp /etc/systemd/system/hrm-backend.service /etc/systemd/system/hrm-backend.service.bak.$(date +%Y%m%d%H%M%S)
cp deploy/systemd/hrm-backend.service /etc/systemd/system/hrm-backend.service

read -rsp 'Apps Script shared secret: ' DEMO_SHEETS_SHARED_SECRET
printf '\n'
test "${#DEMO_SHEETS_SHARED_SECRET}" -ge 32 || { echo 'Secret must be at least 32 characters.'; unset DEMO_SHEETS_SHARED_SECRET; exit 1; }
printf '\n# Google Sheets demo-request integration\napp.demo-request.sheets.web-app-url=https://script.google.com/macros/s/AKfycbytbGIM92HWwMZVj4MVpKwQHLTr8NM3BvCcVEnNmvT3Rjcw0aXz0AGN3yYTw-WoQFJs/exec\napp.demo-request.sheets.shared-secret=%s\n' "$DEMO_SHEETS_SHARED_SECRET" >> /root/config/application.properties
unset DEMO_SHEETS_SHARED_SECRET

systemctl daemon-reload
systemctl restart hrm-backend
systemctl --no-pager --full status hrm-backend
curl -fsS http://127.0.0.1:8080/actuator/health
```

The unit file must put `-Dspring.config.location=/root/config/application.properties` before `-jar /root/app.jar`; JVM options placed after `-jar` are passed to the application instead. Do not run `cat` on the properties file or paste its secret-bearing lines into support chats. To confirm the URL without exposing the secret, run `grep -n '^app.demo-request.sheets.web-app-url=' /root/config/application.properties`; check the secret only by length/presence. For local Docker, configure `DEMO_SHEETS_WEB_APP_URL` and `DEMO_SHEETS_SHARED_SECRET` in the ignored root `.env` instead.

### Run backend and frontend directly

For the usual development loop, run only MySQL in Docker and run Spring Boot and Vite from their own project folders. Spring Boot loads the root `.env`; Vite loads frontend-specific env files from `hrm-frontend`. Docker uses its internal `mysql` hostname while the native backend connects through `127.0.0.1`.

Choose either this native development mode or the full Docker stack below. Do not run both at once: both modes use ports `8080` and `5174`. Stop a running native app with `Ctrl+C` before starting the full Docker stack, or stop the Docker backend/frontend before starting the native apps.

Start MySQL once:

```powershell
docker compose up -d mysql
```

In a backend terminal:

```powershell
cd hrm-backend
mvn spring-boot:run
```

In a separate frontend terminal:

```powershell
cd hrm-frontend
npm ci
npm run dev
```

Open `http://localhost:5174`. Keep both application terminals running while developing. Stop them with `Ctrl+C`; stop the database when finished with `docker compose stop mysql`.

After saving SMTP settings in `.env`, restart the native backend so it reloads them. For Docker development, rebuild/recreate the backend after changing environment values:

```powershell
docker compose up -d --build backend
```

Start the full local stack, including an isolated MySQL database:

```bash
docker compose up -d --build
```

Open:

- Frontend: `http://localhost:5174`
- Backend health: `http://localhost:8080/actuator/health`
- MySQL from the host: `127.0.0.1:3307`

View logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

Start the frontend for local use (Compose also starts the backend and MySQL it depends on):

```bash
docker compose up -d --build frontend
```

Open `http://localhost:5174`. Stop only the frontend while leaving the backend and database running:

```bash
docker compose stop frontend
```

Start the stopped frontend again:

```bash
docker compose start frontend
```

To rebuild after frontend source changes, run `docker compose up -d --build frontend` again. The frontend needs the backend for HR data and the backend needs MySQL; starting the frontend through Compose therefore brings up those dependencies automatically. To stop all services, run `docker compose down` (the database volume is kept unless `-v` is added).

Check status and memory:

```bash
docker compose ps
docker stats hrm-backend-dev hrm-frontend-dev hrm-mysql-dev
```

Stop the local stack without deleting database data:

```bash
docker compose down
```

Delete the local database volume only when a fresh database is required:

```bash
docker compose down -v
```

## Production hosting

The production Compose file is intended for the Linux server where MySQL already runs on `127.0.0.1:3306`.

On the server:

```bash
ssh root@167.172.95.86
cd /root
 git clone https://github.com/Tharidi2002/pirisa.git hrm
cd /root/hrm
cp .env.production.example .env.production
nano .env.production
```

Set the real production values in `.env.production`, especially `DB_PASSWORD`, `JWT_SECRET`, `DEMO_SHEETS_WEB_APP_URL`, and `DEMO_SHEETS_SHARED_SECRET`. Configure SMTP credentials only if other HRM email notifications need them. Do not commit that file.

Verify the database before starting the application:

```bash
mysql -u hrm_user -p hrm_db -e "SHOW TABLES;"
```

Start or update the production stack:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production up -d --build
```

Open:

- Frontend: `http://167.172.95.86/` or `http://pirisahr.com/`
- Backend health: `http://167.172.95.86:8080/actuator/health`

View logs and status:

```bash
docker compose -f docker-compose.production.yml logs -f backend
docker compose -f docker-compose.production.yml logs -f frontend
docker compose -f docker-compose.production.yml ps
docker stats hrm-backend hrm-frontend
```

The 1 GB production server is budgeted across services: backend is capped at 380 MB, frontend at 64 MB, and the host MySQL configuration below targets a 128 MB InnoDB buffer pool. Logs use rotation to prevent unbounded disk growth.

## Production memory update for the current systemd deployment

The current server runs `/root/app.jar` through `hrm-backend.service`, not the production Compose backend. Apply the memory-safe runtime settings without changing the database:

```bash
cd /root/hrm
git pull origin main

# Back up the active files first.
cp /root/config/application.properties /root/config/application.properties.bak.$(date +%Y%m%d%H%M%S)
cp /etc/systemd/system/hrm-backend.service /etc/systemd/system/hrm-backend.service.bak.$(date +%Y%m%d%H%M%S)

# Preserve the existing production database credentials and add only the
# memory/query-pool overrides from this repository.
cat >> /root/config/application.properties <<'EOF'
spring.jpa.show-sql=false
spring.jpa.open-in-view=false
spring.jpa.properties.hibernate.default_batch_fetch_size=16
spring.datasource.hikari.maximum-pool-size=3
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=900000
EOF

# Install the bounded JVM service. It continues using the preserved external config.
cp deploy/systemd/hrm-backend.service /etc/systemd/system/hrm-backend.service
cp deploy/nginx/hrm.conf /etc/nginx/sites-available/hrm.conf
rm -f /etc/nginx/sites-enabled/default
ln -sfn /etc/nginx/sites-available/hrm.conf /etc/nginx/sites-enabled/hrm.conf
nginx -t
systemctl reload nginx

# Limit MySQL memory while preserving hrm_db data.
cp deploy/mysql/99-hrm-memory.cnf /etc/mysql/mysql.conf.d/99-hrm-memory.cnf
systemctl restart mysql

# Rebuild and deploy the same repository version.
mvn -f hrm-backend/pom.xml -DskipTests clean package
cp hrm-backend/target/HRM-1.jar /root/app.jar

# Rebuild the frontend with production same-origin API routing and deploy it.
cd /root/hrm/hrm-frontend
npm ci
npm run build
cp -r /var/www/html /var/www/html.bak.$(date +%Y%m%d%H%M%S)
cp -r dist/. /var/www/html/
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

systemctl daemon-reload
systemctl restart hrm-backend
systemctl restart nginx
systemctl --no-pager --full status mysql hrm-backend nginx
curl -fsS http://127.0.0.1:8080/actuator/health
free -h
```

Watch logs and memory after the restart:

```bash
journalctl -u hrm-backend -f
docker stats --no-stream
top
```

The service uses `-Xmx256m`; this is a heap ceiling, not a promise that the process will always use that amount. Do not set a 1 GB limit for each service on a 1 GB host.

## Important hosting notes

- Port 80 must be available for the frontend container. Stop or reconfigure an existing Nginx service if it already owns port 80.
- The production backend uses host networking so `127.0.0.1:3306` refers to the server's MySQL service.
- The production Compose file is intended for Linux Docker Engine. Use `docker-compose.yml` for local Windows/Docker Desktop testing.
- The frontend API URL is embedded during the image build. Production builds use same-origin API requests by default, so the browser works on either `http://pirisahr.com` or `http://167.172.95.86` without calling the visitor's localhost. Nginx must proxy `/email` and the other backend path prefixes to `127.0.0.1:8080`.
- After pulling frontend changes on the systemd/Nginx server, rebuild `hrm-frontend` with `npm ci && npm run build`, then copy `dist/.` into `/var/www/html` and reload Nginx. Restarting only the backend does not update the static frontend.
