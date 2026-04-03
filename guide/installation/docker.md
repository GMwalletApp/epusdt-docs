# Docker Deployment

This guide shows how to run Epusdt using Docker Compose — the quickest way to get started.

## Prerequisites

- Docker and Docker Compose installed ([Install Docker](https://docs.docker.com/engine/install/))
- A Telegram bot token (for wallet management and notifications)
- A domain name pointed to your server (for the payment checkout page)
- A TronGrid API key ([Register at TronGrid](https://www.trongrid.io/))

## Step 1: Create the Working Directory

```shell
mkdir epusdt && cd epusdt
```

## Step 2: Create the `.env` Configuration File

Only three values **must** be changed: `app_uri`, `tron_grid_api_key`, and `api_auth_token`.

```shell
cat <<EOF > env
app_name=epusdt
app_uri=https://your-domain.com
log_level=info
http_access_log=false
sql_debug=false
http_listen=:8000

static_path=/static
runtime_root_path=/runtime

log_save_path=/logs
log_max_size=32
log_max_age=7
max_backups=3

# Database type: postgres, mysql, sqlite
db_type=sqlite

# SQLite primary database config
sqlite_database_filename=
sqlite_table_prefix=

# PostgreSQL config
postgres_host=127.0.0.1
postgres_port=5432
postgres_user=postgres_user
postgres_passwd=postgres_password
postgres_database=database_name
postgres_table_prefix=
postgres_max_idle_conns=10
postgres_max_open_conns=100
postgres_max_life_time=6

# MySQL config
mysql_host=127.0.0.1
mysql_port=3306
mysql_user=mysql_user
mysql_passwd=mysql_password
mysql_database=database_name
mysql_table_prefix=
mysql_max_idle_conns=10
mysql_max_open_conns=100
mysql_max_life_time=6

# SQLite runtime store config
runtime_sqlite_filename=epusdt-runtime.db

# Background scheduler config
queue_concurrency=10
queue_poll_interval_ms=1000
callback_retry_base_seconds=5

# Telegram bot
tg_bot_token=
tg_proxy=
tg_manage=

# API authentication token (keep secret!)
api_auth_token=

# Order settings
order_expiration_time=10
order_notice_max_retry=0
forced_usdt_rate=
api_rate_url=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/
tron_grid_api_key=
EOF
```

## Step 3: Create `docker-compose.yaml`

```shell
cat <<EOF > docker-compose.yaml
services:
  epusdt:
    image: gmwallet/epusdt:alpine
    restart: always
    volumes:
      - ./env:/app/.env
    ports:
      - "8000:8000"
EOF
```

## Step 4: Start the Service

```shell
docker compose up -d
```

Verify the container is running:

```shell
docker compose ps
```

You should see the `epusdt` service with status `running` and port `8000` mapped.

## Step 5: Configure Reverse Proxy (Recommended)

For production use, set up Nginx or Caddy as a reverse proxy with HTTPS:

**Nginx example:**

```nginx
server {
    listen 443 ssl http2;
    server_name pay.example.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Caddy example (auto-HTTPS):**

```
pay.example.com {
    reverse_proxy 127.0.0.1:8000
}
```

## Step 6: Verify Installation

1. Open your Telegram bot — if it responds, Epusdt is running correctly.
2. Visit `https://your-domain.com` in a browser to see the checkout page.
3. Check logs if needed:

```shell
docker compose logs -f epusdt
```

## Configuration Reference

| Key | Description | Required |
|-----|-------------|----------|
| `app_uri` | Your public domain (e.g. `https://pay.example.com`) | ✅ Yes |
| `api_auth_token` | API authentication token (keep secret) | ✅ Yes |
| `tg_bot_token` | Telegram bot token | Recommended |
| `tg_manage` | Telegram admin user ID | Recommended |
| `tron_grid_api_key` | TronGrid API key — improves stability | Recommended |
| `api_rate_url` | Exchange rate API URL | Optional |
| `forced_usdt_rate` | Force a fixed exchange rate (e.g. `6.4`) | Optional |
| `order_expiration_time` | Order expiry in minutes (default: `10`) | Optional |
| `db_type` | Database type: `sqlite`, `mysql`, `postgres` | Optional |
| `queue_concurrency` | Number of concurrent queue workers (default: `10`) | Optional |
| `log_level` | Logging level: `debug`, `info`, `warn`, `error` | Optional |

## Upgrading

To upgrade Epusdt to the latest version:

```shell
docker compose pull
docker compose up -d
```

## Troubleshooting

### Container fails to start

Check logs for configuration errors:

```shell
docker compose logs epusdt
```

### Port conflict

If port 8000 is already in use, change the port mapping in `docker-compose.yaml`:

```yaml
ports:
  - "9000:8000"
```

### Database connection issues

If using MySQL or PostgreSQL, ensure the database server is accessible from within the Docker container. Use `host.docker.internal` or the host's IP instead of `127.0.0.1`.
