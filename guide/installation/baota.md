# BaoTa Panel Deployment

This guide shows the current, source-aligned way to run Epusdt with **BaoTa (宝塔)**.

> Prefer Docker or pure CLI? See [Docker Deployment](/guide/installation/docker) or [Manual Deployment](/guide/installation/manual).

## Prerequisites

Prepare the following before deployment:

- A Linux server with **BaoTa** installed
- **Nginx** installed in BaoTa
- **Supervisor** installed in BaoTa
- A public domain pointed to the server
- A valid **TronGrid API key**
- A built `epusdt` binary or official release package

Database choices supported by current source:

- **SQLite**: simplest option, no external database service required
- **MySQL**: optional
- **PostgreSQL**: optional

::: warning
Current source does **not** require Redis, and current startup does **not** require manually importing SQL tables in the normal case. The app auto-creates its tables on first start.
:::

## Deployment layout

Typical BaoTa setup:

- BaoTa **Nginx** terminates HTTP/HTTPS
- Epusdt listens on `127.0.0.1:8000`
- BaoTa **Supervisor** keeps the process running
- SQLite or your chosen SQL database stores data
- Runtime files and logs are created relative to the `.env` directory unless you set absolute paths

Example app directory:

```text
/www/wwwroot/pay.example.com/
├── epusdt
├── .env
├── static/
└── runtime/
```

## Step 1: Create the site in BaoTa

In **Website**:

1. Click **Add Site**
2. Bind your domain, for example `pay.example.com`
3. A static/default site type is fine because Epusdt serves its own HTTP app
4. If you plan to use MySQL, create the database here as well

## Step 2: Upload the application

Upload the Epusdt binary or release package into the site directory, for example:

```text
/www/wwwroot/pay.example.com/
```

Make it executable:

```bash
chmod +x /www/wwwroot/pay.example.com/epusdt
```

::: tip
Keep `.env`, `epusdt`, and the `static/` directory together. The server reads `.env` from its working directory and serves static assets from `./static` by default.
:::

## Step 3: Prepare `.env`

Create or edit `.env` in the same directory as the binary:

```dotenv
app_name=epusdt
app_uri=https://pay.example.com
http_listen=:8000

static_path=/static
runtime_root_path=runtime
log_save_path=logs

# supported values: sqlite, mysql, postgres
db_type=sqlite

# SQLite primary database file (leave empty to use runtime/store.sqlite)
sqlite_database_filename=
runtime_sqlite_filename=epusdt-runtime.db

# MySQL example
# db_type=mysql
# mysql_host=127.0.0.1
# mysql_port=3306
# mysql_user=epusdt
# mysql_passwd=change-this-db-password
# mysql_database=epusdt

# PostgreSQL example
# db_type=postgres
# postgres_host=127.0.0.1
# postgres_port=5432
# postgres_user=epusdt
# postgres_passwd=change-this-db-password
# postgres_database=epusdt

api_auth_token=replace-with-a-long-random-secret
tron_grid_api_key=replace-with-your-trongrid-api-key
order_expiration_time=10

# Optional Telegram bot
tg_bot_token=
tg_proxy=
tg_manage=
```

Minimum production values to review carefully:

- `app_uri`: your final public HTTPS URL
- `api_auth_token`: merchant API signing secret
- `tron_grid_api_key`: required for TRON/TRC20 monitoring
- `db_type` and matching DB fields if not using SQLite

## Step 4: Database notes

### SQLite

For a single-server deployment, SQLite is the easiest choice.

- No manual schema import is normally needed
- Epusdt auto-migrates its tables on startup
- Primary data and runtime locks use SQLite files
- Make sure the app directory is writable by the service user

### MySQL / PostgreSQL

If you prefer an external database:

- Set `db_type=mysql` or `db_type=postgres`
- Fill in the matching connection fields
- Ensure the database server is reachable from the BaoTa host
- The app still keeps its **runtime lock store** in SQLite via `runtime_sqlite_filename`

## Step 5: Configure reverse proxy

Epusdt serves HTTP itself, so BaoTa should proxy to it.

In the site settings, create a reverse proxy to:

```text
http://127.0.0.1:8000
```

Recommended proxy behavior:

- Enable HTTPS on the public site
- Keep `app_uri` exactly equal to the public URL
- Do **not** mount Epusdt under a subdirectory unless your reverse proxy also rewrites paths carefully

If BaoTa lets you edit the generated Nginx config, preserve standard forwarding headers such as:

- `Host`
- `X-Real-IP`
- `X-Forwarded-For`
- `X-Forwarded-Proto`

## Step 6: Add a Supervisor process

Create a new BaoTa Supervisor task.

Working directory:

```text
/www/wwwroot/pay.example.com/
```

Start command:

```bash
/www/wwwroot/pay.example.com/epusdt http start
```

::: warning
Current source uses the `http start` subcommand. Do not configure Supervisor to run only `./epusdt` unless your packaged binary explicitly documents that behavior.
:::

## Step 7: Start and verify

After saving the Supervisor task:

1. Start the process
2. Open `https://pay.example.com/`
3. Confirm the site responds normally
4. Check Supervisor or application logs if startup fails

Useful checks:

- Root page should respond at `/`
- Checkout pages are served under `/pay/...`
- API endpoints are served under `/payments/...`

## Recommended BaoTa hardening

- Enable automatic HTTPS certificate renewal
- Block direct web access to `.env`
- Keep the app directory writable only for the service user
- Back up your database files or external SQL database regularly
- Watch logs for callback failures and chain polling errors

## Troubleshooting

### 502 Bad Gateway

Usually means Nginx cannot reach Epusdt.

Check:

- Supervisor process is running
- Start command is `epusdt http start`
- `http_listen` matches the reverse proxy target
- The process can read `.env` from its working directory

### Startup fails after changing paths

Check whether these paths are valid and writable:

- `runtime_root_path`
- `log_save_path`
- `sqlite_database_filename` if you set it explicitly

Relative paths are resolved from the `.env` location.

### Orders are created but payments never confirm

Check:

- Wallet addresses were added correctly
- The network is TRON / TRC20 USDT as expected by your integration
- `tron_grid_api_key` is valid
- The server can reach external TRON/HTTP APIs

### Callback keeps failing

Check:

- Your `notify_url` is publicly reachable
- The merchant callback endpoint returns HTTP `200` with body `ok`
- TLS and reverse proxy rules are not blocking outbound callback retries

## Next step

- [Configure Dujiaoka integration](/guide/plugins/dujiaoka)
- [Read the API reference](/api/reference)
