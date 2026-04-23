# aaPanel Deployment

This guide shows how to run the Epusdt service itself with aaPanel.

**No manual `.env` required for first run.** If no config file is present, Epusdt starts a built-in install wizard — open your browser and follow the steps.

## Prerequisites

- A Linux server with aaPanel installed
- Nginx installed in aaPanel
- Supervisor installed in aaPanel
- A public domain pointed to the server, such as `pay.example.com`
- The Epusdt release package or a self-built `epusdt` binary

## 1. Create a site in aaPanel

In aaPanel, create a new site and bind your checkout domain.

This site is only used as the public entry for the Epusdt service behind reverse proxy. You are not deploying the documentation site, VitePress, or Cloudflare Pages here.

## 2. Upload Epusdt

Upload the Epusdt release package to the site directory, then extract it.

If needed, grant execute permission:

```bash
chmod +x /www/wwwroot/pay.example.com/epusdt
```

## 3. Configure reverse proxy

In aaPanel, open the site settings and configure reverse proxy to:

```text
http://127.0.0.1:8000
```

## 4. Add Supervisor process

In aaPanel Supervisor, add a process with a startup command like:

```text
/www/wwwroot/pay.example.com/epusdt http start
```

Use the Epusdt application directory as the working directory.

## 5. Complete the install wizard

After the process starts, open `http://your-server-ip:8000` (or your domain if reverse proxy is already active). Epusdt will guide you through initial setup — database, API token, domain, etc.

Once submitted, the service restarts automatically and is ready to use.

## 6. Verify service

Use your deployed domain as the API base URL, for example:

```text
https://pay.example.com
```

Create orders through endpoints such as:

```text
POST /payments/epusdt/v1/order/create-transaction
```

## Notes

- All configuration is managed in the admin panel after setup completes
- Keep `api_auth_token` secret — it is used for API request signing
- Use actual deployment paths from your aaPanel environment
