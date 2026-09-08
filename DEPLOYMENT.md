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

Each application container is limited to 1 GB RAM and logs use rotation to prevent unbounded disk growth.

## Important hosting notes

- Port 80 must be available for the frontend container. Stop or reconfigure an existing Nginx service if it already owns port 80.
- The production backend uses host networking so `127.0.0.1:3306` refers to the server's MySQL service.
- The production Compose file is intended for Linux Docker Engine. Use `docker-compose.yml` for local Windows/Docker Desktop testing.
- The frontend API URL is embedded during the image build. Change `PUBLIC_API_BASE_URL` and `PUBLIC_WS_URL` before rebuilding if the public address changes.
