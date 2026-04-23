# Manual Installation

This guide covers running Epusdt on a normal Linux server without Docker or aaPanel.

**No manual `.env` required for first run.** If no config file is present, Epusdt starts a built-in install wizard — open your browser and follow the steps to complete setup.

## Prerequisites

- A Go toolchain compatible with the current source repository `src/go.mod` (currently `Go 1.25.0`) if you plan to build from source
- Or a release package from [GitHub Releases](https://github.com/GMwalletApp/epusdt/releases)
- A Linux server
- A public domain for the checkout service, such as `pay.example.com`
- Nginx or another reverse proxy for HTTPS in production

## 1. Prepare the application directory

```bash
mkdir -p /opt/epusdt
cd /opt/epusdt
```

Choose one of the following installation methods.

### Option A. Use a release package

```bash
wget https://github.com/GMwalletApp/epusdt/releases/latest/download/epusdt_Linux_x86_64.tar.gz -O epusdt.tar.gz

tar -xzf epusdt.tar.gz
rm epusdt.tar.gz
```

### Option B. Build from source

```bash
git clone https://github.com/GMwalletApp/epusdt.git
cd epusdt/src
go build -o /opt/epusdt/epusdt .
```

## 2. Start Epusdt

```bash
chmod +x /opt/epusdt/epusdt
cd /opt/epusdt
./epusdt http start
```

If no `.env` is present, Epusdt starts the install wizard. Open `http://your-server-ip:8000` in your browser to complete initial setup (database, API token, domain, etc.).

Once submitted, the service restarts automatically.

## 3. Configure Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name pay.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pay.example.com;

    ssl_certificate     /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then reload Nginx:

```bash
nginx -t && systemctl reload nginx
```

## 4. Run with Supervisor

```ini
[program:epusdt]
process_name=epusdt
directory=/opt/epusdt
command=/opt/epusdt/epusdt http start
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/supervisor/epusdt.log
```

Apply it:

```bash
supervisorctl reread
supervisorctl update
supervisorctl start epusdt
supervisorctl tail epusdt
```

## 5. Verify service and integration

Use your deployed Epusdt domain as the API base URL, for example:

```text
https://pay.example.com
```

Create orders through endpoints such as:

```text
POST /payments/epusdt/v1/order/create-transaction
```

## Notes

- After editing `.env`, restart the process: `supervisorctl restart epusdt`
- Put Epusdt behind HTTPS in production
- Keep `api_auth_token` secret, it is also used by wallet management APIs
- `tron_grid_api_key` is recommended for better Tron query stability
- If you enable Solana or Ethereum collection, configure `solana_rpc_url` and `ethereum_ws_url`
- Current `.env.example` also includes `epay_pid` and `epay_key` for the EPay-compatible route
