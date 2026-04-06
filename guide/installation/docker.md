# Docker Deployment

This guide shows how to run Epusdt with Docker Compose.

## What the official Docker setup actually does

The source repository includes an official `docker-compose.yaml` example that:

- runs `gmwallet/epusdt:alpine`
- mounts a local `env` file to `/app/.env`
- publishes container port `8000`

The application reads configuration from `.env` by default. In Docker, the documented pattern is to keep a host file named `env` and mount it as `/app/.env` inside the container.

## Prerequisites

- Docker and Docker Compose installed
- a public domain or server address for Epusdt
- a TronGrid API key
- an `api_auth_token`
- optional Telegram bot settings

## Step 1: Create the working directory

```shell
mkdir epusdt && cd epusdt
```

## Step 2: Create the configuration file

Save the following as `env` in the working directory:

```shell
cat <<EOF > env
app_name=epusdt
app_uri=https://pay.example.com
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

# supported values: postgres,mysql,sqlite
db_type=sqlite

# sqlite primary database config
sqlite_database_filename=
sqlite_table_prefix=

# postgres config
postgres_host=127.0.0.1
postgres_port=3306
postgres_user=mysql_user
postgres_passwd=mysql_password
postgres_database=database_name
postgres_table_prefix=
postgres_max_idle_conns=10
postgres_max_open_conns=100
postgres_max_life_time=6

# mysql config
mysql_host=127.0.0.1
mysql_port=3306
mysql_user=mysql_user
mysql_passwd=mysql_password
mysql_database=database_name
mysql_table_prefix=
mysql_max_idle_conns=10
mysql_max_open_conns=100
mysql_max_life_time=6

# sqlite runtime store config
runtime_sqlite_filename=epusdt-runtime.db

# background scheduler config
queue_concurrency=10
queue_poll_interval_ms=1000
callback_retry_base_seconds=5

tg_bot_token=
tg_proxy=
tg_manage=

api_auth_token=

order_expiration_time=10
order_notice_max_retry=0
forced_usdt_rate=
api_rate_url=
tron_grid_api_key=
EOF
```

### Minimum settings to review

At minimum, check and set these values:

| Key | Why it matters |
|-----|----------------|
| `app_uri` | Public URL used when Epusdt generates checkout links |
| `api_auth_token` | Required for API request signing/authentication |
| `tron_grid_api_key` | Recommended for stable TRON/TRC20 queries |
| `db_type` | Defaults to `sqlite`; change only if you really use MySQL/PostgreSQL |
| `tg_bot_token` / `tg_manage` | Optional, but useful for bot-based management |

## Step 3: Create `docker-compose.yaml`

```shell
cat <<EOF > docker-compose.yaml
services:
  epusdt:
    image: gmwallet/epusdt:alpine
    restart: always
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ./env:/app/.env
    ports:
      - "8000:8000"
EOF
```

## Step 4: Start the service

```shell
docker compose up -d
```

Check status:

```shell
docker compose ps
```

Check logs:

```shell
docker compose logs -f epusdt
```

## Port exposure and reverse proxy

By default, the application listens on `:8000` inside the container, and the compose example publishes it as `8000:8000`.

That means:

- the app is reachable directly on the host's port `8000`
- you can also place Nginx, Caddy, or another reverse proxy in front of it

### Nginx example

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

### Caddy example

```text
pay.example.com {
    reverse_proxy 127.0.0.1:8000
}
```

## API path vs checkout path

Keep these paths distinct:

- create order API: `/payments/epusdt/v1/order/create-transaction`
- hosted checkout page: `/pay/checkout-counter/:trade_id`
- checkout polling endpoint: `/pay/check-status/:trade_id`

`app_uri` is used to generate checkout URLs such as:

```text
https://pay.example.com/pay/checkout-counter/{trade_id}
```

It is **not** an internal router prefix.

## Subpath caveat

The current source code registers routes at root-relative paths like `/payments/...` and `/pay/...`.

If you want to expose Epusdt under a subpath such as `https://example.com/epusdt/`, Docker alone does not change that. You would need reverse-proxy rewrite rules and careful testing for both API and checkout routes.

For the least surprising setup, deploy Epusdt on its own domain or subdomain, for example:

- `https://pay.example.com`

## Verify installation

A practical verification flow is:

1. confirm the container is running
2. open `http://SERVER_IP:8000/` or your proxied domain and confirm the service responds
3. create a test order against `/payments/epusdt/v1/order/create-transaction`
4. confirm the returned `payment_url` points to `/pay/checkout-counter/{trade_id}` on your public domain

## Upgrading

```shell
docker compose pull
docker compose up -d
```

## Troubleshooting

### The container starts but uses the wrong config

Make sure the file is mounted exactly as:

```yaml
volumes:
  - ./env:/app/.env
```

The app looks for `.env` inside the container unless you explicitly override the config path.

### Port 8000 is already in use

Change the host-side mapping, for example:

```yaml
ports:
  - "9000:8000"
```

The container still listens on `8000`; only the host port changes.

### MySQL or PostgreSQL cannot be reached

Inside Docker, `127.0.0.1` points to the container itself, not your host database.

If your database runs in another container, use the service name. If it runs on the host, use a host-accessible address instead of assuming localhost will work.

### Static assets or runtime files behave unexpectedly after changing paths

`static_path` controls the URL path for static files, while `runtime_root_path` controls filesystem storage. They are not deployment base-path settings. Avoid changing them just to try to mount the app under a URL subpath.
