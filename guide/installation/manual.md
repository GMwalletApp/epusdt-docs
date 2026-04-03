# Manual Installation

This guide covers installing Epusdt from source with full manual control over the build, configuration, and service management.

## Prerequisites

- **Go 1.16+** installed ([Install Go](https://go.dev/doc/install))
- **Git**
- **MySQL** or **PostgreSQL** (optional — SQLite is the default)
- A Linux server (recommended for production)
- A public domain pointed to your server
- A [TronGrid API key](https://www.trongrid.io/)

## Step 1: Clone the Repository

```bash
git clone https://github.com/GMwalletApp/epusdt.git
cd epusdt/src
```

## Step 2: Build the Binary

Compile Epusdt:

```bash
go build -o ../epusdt .
```

This produces the `epusdt` binary in the project root directory.

::: tip
You can also download a pre-built binary from the [GitHub Releases page](https://github.com/GMwalletApp/epusdt/releases) instead of building from source.
:::

## Step 3: Configure the Environment File

Copy the example environment file and edit it:

```bash
cd ..
cp src/.env.example .env
```

Open `.env` in your editor and configure the required values:

```dotenv
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

# Database type: sqlite, mysql, postgres
db_type=sqlite

# SQLite config
sqlite_database_filename=
sqlite_table_prefix=

# PostgreSQL config
postgres_host=127.0.0.1
postgres_port=5432
postgres_user=epusdt
postgres_passwd=change-this-db-password
postgres_database=epusdt
postgres_table_prefix=
postgres_max_idle_conns=10
postgres_max_open_conns=100
postgres_max_life_time=6

# MySQL config
mysql_host=127.0.0.1
mysql_port=3306
mysql_user=epusdt
mysql_passwd=change-this-db-password
mysql_database=epusdt
mysql_table_prefix=
mysql_max_idle_conns=10
mysql_max_open_conns=100
mysql_max_life_time=6

# Runtime SQLite store
runtime_sqlite_filename=epusdt-runtime.db

# Background scheduler
queue_concurrency=10
queue_poll_interval_ms=1000
callback_retry_base_seconds=5

# Telegram bot
tg_bot_token=
tg_proxy=
tg_manage=

# API authentication token (keep secret!)
api_auth_token=replace-with-a-long-random-secret

# Order settings
order_expiration_time=10
order_notice_max_retry=0
forced_usdt_rate=
usdt_rate=
cny_rate=
callback_timeout=30
api_rate_url=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/
tron_grid_api_key=replace-with-your-trongrid-api-key
```

### Required Fields

At minimum, you must set:

- `app_uri` — your public domain
- `api_auth_token` — a secret token for API authentication
- `tron_grid_api_key` — your TronGrid API key

### Database Notes

- **SQLite** (default) — no external database server needed; simplest option
- **MySQL** — set `db_type=mysql` and fill in the `mysql_*` fields
- **PostgreSQL** — set `db_type=postgres` and fill in the `postgres_*` fields

For the full configuration reference, see the [Docker guide — Configuration Reference](/guide/installation/docker#configuration-reference).

## Step 4: Test the Service

Make the binary executable and start it:

```bash
chmod +x epusdt
./epusdt http start
```

You should see output confirming the HTTP server has started. Visit:

- `http://your-server:8000` — public checkout page
- `http://your-server:8000/admin` — admin panel

Press `Ctrl+C` to stop the foreground process when you are ready to set up a proper service manager.

## Step 5: Create a systemd Service

For production, run Epusdt as a managed background service so it starts automatically on boot and restarts on failure.

Create `/etc/systemd/system/epusdt.service`:

```ini
[Unit]
Description=Epusdt USDT Payment Middleware
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/epusdt
ExecStart=/opt/epusdt/epusdt http start
Restart=always
RestartSec=5
Environment=TZ=UTC

[Install]
WantedBy=multi-user.target
```

::: warning
Adjust `WorkingDirectory` and `ExecStart` to match the directory where you placed the binary and `.env` file. The `.env` file must be in the working directory.
:::

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable epusdt
sudo systemctl start epusdt
```

Check service status:

```bash
sudo systemctl status epusdt
```

Follow the logs:

```bash
sudo journalctl -u epusdt -f
```

## Step 6: Configure Nginx Reverse Proxy

For production, expose Epusdt through your domain with HTTPS using Nginx.

Create a server block (e.g. `/etc/nginx/sites-available/epusdt`):

```nginx
server {
    listen 80;
    server_name pay.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pay.example.com;

    ssl_certificate     /etc/letsencrypt/live/pay.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pay.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/epusdt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Make sure `app_uri` in `.env` uses the HTTPS URL:

```dotenv
app_uri=https://pay.example.com
```

Then restart the service:

```bash
sudo systemctl restart epusdt
```

## Updating Epusdt

To update a manually installed instance:

```bash
cd /opt/epusdt
sudo systemctl stop epusdt

# Pull latest source and rebuild
git pull
cd src && go build -o ../epusdt . && cd ..

sudo systemctl start epusdt
```

Or download a new pre-built binary from [GitHub Releases](https://github.com/GMwalletApp/epusdt/releases), replace the old binary, and restart the service.

## Troubleshooting

### The binary will not start

Make sure it is executable:

```bash
chmod +x epusdt
```

Check that `.env` is in the same directory as the binary.

### Nginx shows 502 Bad Gateway

Confirm that Epusdt is running on the expected port:

```bash
sudo systemctl status epusdt
sudo journalctl -u epusdt -f
```

### Telegram bot does not respond

Verify:

- `tg_bot_token` is correct
- `tg_manage` is your numeric Telegram user ID
- `tg_proxy` is set if the server cannot reach `api.telegram.org` directly

### TRC20 payments are not detected

Check that `tron_grid_api_key` is present and valid. Without a working API key, Epusdt cannot monitor TRC20 transactions.
