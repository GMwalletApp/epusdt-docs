# Manual Installation

This guide covers building and deploying Epusdt manually, without Docker or BaoTa.

## Prerequisites

- **Go 1.16+**
- **Git**
- A Linux server
- **Nginx** or another reverse proxy for production HTTPS
- A public domain pointed to the server
- A valid **TronGrid API key**

Database choices supported by current source:

- **SQLite**: default and simplest
- **MySQL**: optional
- **PostgreSQL**: optional

::: warning
Current source does **not** require Redis. It also auto-migrates its database tables on startup, so a normal installation does not begin with a manual SQL import step.
:::

## Step 1: Clone the repository

```bash
git clone https://github.com/GMwalletApp/epusdt.git
cd epusdt/src
```

## Step 2: Build the binary

```bash
go build -o ../epusdt .
```

This creates the binary in the project root:

```text
epusdt/epusdt
```

::: tip
You can also use an official prebuilt release package if you do not want to compile from source.
:::

## Step 3: Create `.env`

From the project root:

```bash
cd ..
cp src/.env.example .env
```

Edit `.env` and set the values for your environment:

```dotenv
app_name=epusdt
app_uri=https://pay.example.com
log_level=info
http_access_log=false
sql_debug=false
http_listen=:8000

static_path=/static
runtime_root_path=runtime
log_save_path=logs
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
postgres_port=5432
postgres_user=epusdt
postgres_passwd=change-this-db-password
postgres_database=epusdt
postgres_table_prefix=
postgres_max_idle_conns=10
postgres_max_open_conns=100
postgres_max_life_time=6

# mysql config
mysql_host=127.0.0.1
mysql_port=3306
mysql_user=epusdt
mysql_passwd=change-this-db-password
mysql_database=epusdt
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

api_auth_token=replace-with-a-long-random-secret
order_expiration_time=10
order_notice_max_retry=0
forced_usdt_rate=
api_rate_url=
tron_grid_api_key=replace-with-your-trongrid-api-key
```

Must-review settings:

- `app_uri`: public HTTPS URL used in generated payment links
- `api_auth_token`: signing secret for merchant API requests
- `tron_grid_api_key`: required for TRON/TRC20 payment detection
- `db_type`: choose `sqlite`, `mysql`, or `postgres`

## Step 4: Runtime and database expectations

### Static files

Keep the binary, `.env`, and `static/` directory together. By default, the app serves static files from `./static` relative to the `.env` directory.

### SQLite

If `db_type=sqlite`:

- No external database server is needed
- No manual schema import is normally needed
- The app auto-creates tables on startup
- The service user must be able to write its data and runtime files

### MySQL / PostgreSQL

If `db_type=mysql` or `db_type=postgres`:

- Fill in the matching DB connection fields
- Make sure the SQL server is reachable
- The app still uses a separate SQLite runtime lock database via `runtime_sqlite_filename`

### Paths

`runtime_root_path`, `log_save_path`, and explicit SQLite filenames can be relative or absolute.

- Relative paths are resolved from the `.env` location
- Absolute paths must already be writable by the service user

## Step 5: Test the app in foreground

From the project root:

```bash
chmod +x epusdt
./epusdt http start
```

Then test:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/pay/checkout-counter/<trade_id>` for checkout pages when you have a real order

Stop the foreground process with `Ctrl+C` after confirming it starts cleanly.

## Step 6: Create a systemd service

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
`WorkingDirectory` must contain the `.env` file, the `epusdt` binary, and the `static/` directory unless you deliberately use custom paths.
:::

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable epusdt
sudo systemctl start epusdt
```

Useful checks:

```bash
sudo systemctl status epusdt
sudo journalctl -u epusdt -f
```

## Step 7: Configure Nginx reverse proxy

For production, expose Epusdt through HTTPS and proxy traffic to the local app port.

Example server block:

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

Reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Important notes:

- Keep `app_uri` aligned with the final public URL
- Root-mounted deployment is the safest setup
- If you place Epusdt under a subpath, your reverse proxy must rewrite paths correctly because the app itself registers routes at `/`, `/pay/...`, and `/payments/...`

## Step 8: Update the service

For source-based upgrades:

```bash
cd /opt/epusdt
sudo systemctl stop epusdt
git pull
cd src && go build -o ../epusdt . && cd ..
sudo systemctl start epusdt
```

If you use release binaries instead, replace the old binary and restart the service.

## Troubleshooting

### The service fails to start

Check:

- `.env` exists in the working directory
- `ExecStart` includes `http start`
- `static/` exists where the app expects it
- Runtime and log paths are writable

### Nginx returns 502 Bad Gateway

Check:

- Epusdt is listening on the configured port
- Nginx proxies to the same port as `http_listen`
- The service started successfully according to `journalctl`

### Payments are not detected

Check:

- `tron_grid_api_key` is configured
- Wallet addresses were added correctly
- The host can reach external TRON/HTTP APIs
- You are testing with the expected TRON/TRC20 flow

### Callback retries do not behave as expected

Current retry behavior is config-driven.

Review:

- `order_notice_max_retry`
- `callback_retry_base_seconds`
- whether your callback endpoint returns HTTP `200` with body `ok`
