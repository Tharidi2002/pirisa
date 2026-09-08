# HRM Docker Deployment

The repository uses the same source code for local testing and production hosting.

## Local testing

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

Set the real production values in `.env.production`, especially `DB_PASSWORD` and `JWT_SECRET`. Do not commit that file.

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

# Limit MySQL memory while preserving hrm_db data.
cp deploy/mysql/99-hrm-memory.cnf /etc/mysql/mysql.conf.d/99-hrm-memory.cnf
systemctl restart mysql

# Rebuild and deploy the same repository version.
mvn -f hrm-backend/pom.xml -DskipTests clean package
cp hrm-backend/target/HRM-1.jar /root/app.jar

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
- The frontend API URL is embedded during the image build. Change `PUBLIC_API_BASE_URL` and `PUBLIC_WS_URL` before rebuilding if the public address changes.
