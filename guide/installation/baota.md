# BaoTa Panel Deployment

This guide shows how to run Epusdt using the **BaoTa (宝塔)** control panel.

> If you prefer Docker or direct service management, see [Docker Deployment](/guide/installation/docker) or [Manual Deployment](/guide/installation/manual).

## Prerequisites

Before deployment, make sure your BaoTa server has:

- **Nginx** installed
- **MySQL** installed and running
- **Supervisor** or **Supervisord** available
- A public domain already pointed to the server
- A TronGrid API key

## Deployment Overview

In a BaoTa-based setup, Epusdt usually runs as its own Go service behind an Nginx reverse proxy.

Typical architecture:

- Nginx handles public HTTP/HTTPS traffic
- Epusdt listens locally on `127.0.0.1:8000`
- MySQL stores order and wallet data
- Supervisor keeps the process alive

## Step 1: Create a Website in BaoTa

In BaoTa:

1. Open **Website**
2. Click **Add Site**
3. Bind your payment domain, for example `pay.example.com`
4. Create the matching database at the same time
5. The site type can remain a simple static or default site because Epusdt serves its own application

## Step 2: Prepare the application directory

Upload the Epusdt binary or release package to your site directory, for example:

```text
/www/wwwroot/pay.example.com/
```

Example structure:

```text
/www/wwwroot/pay.example.com/
├── epusdt
├── .env
├── data/
└── logs/
```

Grant execute permission:

```bash
chmod +x /www/wwwroot/pay.example.com/epusdt
```

## Step 3: Create the database

Create a MySQL database from BaoTa, then record the following:

- Database host
- Database port
- Database name
- Database username
- Database password

Import the schema required by Epusdt if the release package does not initialize it automatically.

## Step 4: Prepare `.env`

Create or edit `.env` in the application directory:

```dotenv
app_name=epusdt
app_uri=https://pay.example.com
http_listen=:8000

# Database type: sqlite (default), mysql, postgres
db_type=sqlite

# SQLite (default, no extra DB needed)
sqlite_database_filename=

# MySQL (uncomment if using MySQL)
# db_type=mysql
# mysql_host=127.0.0.1
# mysql_port=3306
# mysql_user=epusdt
# mysql_passwd=your_password
# mysql_database=epusdt

tron_grid_api_key=your_trongrid_api_key
order_expiration_time=10
api_auth_token=change-this-to-a-long-random-token

# Telegram bot (optional)
tg_bot_token=
tg_manage=
```

## Step 5: Configure reverse proxy

Epusdt has its own HTTP service, so BaoTa should proxy traffic to it.

In BaoTa website settings, configure reverse proxy to:

```text
http://127.0.0.1:8000
```

Important points:

- Enable HTTPS on the site
- Make sure `app_uri` matches the final public domain
- If using Cloudflare in front of BaoTa, still keep origin HTTPS configured properly

## Step 6: Add a Supervisor process

In BaoTa Supervisor, create a new daemon process.

Example start command:

```bash
/www/wwwroot/pay.example.com/epusdt
```

If your build expects subcommands, use the matching startup form from the release notes or binary help.

Suggested working directory:

```text
/www/wwwroot/pay.example.com/
```

## Step 7: Start and verify

After saving the supervisor task:

1. Start the process
2. Visit `https://pay.example.com`
3. Check application logs if the page does not load
4. Open the admin panel and add wallet addresses if needed

## Recommended BaoTa Settings

- Enable automatic HTTPS certificate renewal
- Restrict direct access to sensitive files such as `.env`
- Back up your MySQL database regularly
- Monitor `logs/` for callback and chain polling errors

## Troubleshooting

### 502 Bad Gateway

Usually means Nginx cannot reach Epusdt.

Check:

- Whether Epusdt is running under Supervisor
- Whether `http_listen` is correct
- Whether the reverse proxy target matches the actual listening port

### Orders can be created but never complete

Check:

- Wallet address is a **TRC20 USDT** address
- TronGrid API key is valid
- Firewall rules allow outbound traffic

### Callback fails repeatedly

Check:

- The callback endpoint is public and reachable
- `callback_timeout` is not too short
- Your business system accepts the callback payload correctly

## Next Step

- [Configure Dujiaoka integration](/guide/plugins/dujiaoka)
- [Read the API reference](/api/reference)
