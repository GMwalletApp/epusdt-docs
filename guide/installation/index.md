# Installation Overview

Epusdt supports multiple deployment methods. For most users, **Docker** is the simplest and safest starting point.

## Recommended Methods

### 1. Docker Deployment

**Best for most users.**

Use Docker when you want:

- quick setup
- isolated runtime
- straightforward upgrades
- a predictable production layout

→ [Docker deployment guide](/guide/installation/docker)

### 2. BaoTa Panel Deployment

**Best for panel-based server management.**

Use BaoTa when you want:

- GUI-based website and database management
- easy SSL and reverse proxy setup
- a familiar panel workflow

→ [BaoTa deployment guide](/guide/installation/baota)

### 3. Manual Deployment

**Best for operators who want full control.**

Use manual deployment when you want:

- source builds
- custom process supervision
- deeper integration with your own Linux stack

→ [Manual deployment guide](/guide/installation/manual)

### 4. Cloudflare Pages Deployment

**For the documentation site only.**

Cloudflare Pages can host the static `epusdt-docs` VitePress site.

> It does **not** run the Epusdt payment service itself.

→ [Cloudflare Pages guide](/guide/installation/cloudflare)

## Before You Deploy

Prepare these items first:

- a public domain or server address for the Epusdt service
- a TronGrid API key
- database settings if you plan to use MySQL or PostgreSQL
- an `api_auth_token`
- optional Telegram bot token and admin ID

## Important Deployment Notes

### `app_uri` is a public URL, not a route prefix

In the current source code, Epusdt serves its routes at root-relative paths such as:

- `/payments/epusdt/v1/order/create-transaction`
- `/payments/gmpay/v1/order/create-transaction`
- `/pay/checkout-counter/:trade_id`
- `/pay/check-status/:trade_id`

`app_uri` is used to build absolute URLs returned by the service, especially the checkout link. It does **not** make the app internally mount under `/something`.

If you want to expose Epusdt under a subpath such as `/epusdt`, that must be handled by your reverse proxy or ingress rules.

### Keep API routes and checkout routes separate

Two route groups matter during deployment:

- **Create-order API**: `/payments/...`
- **Hosted checkout pages**: `/pay/...`

Do not treat `/pay/...` as the API endpoint.

## Common Configuration Items

| Key | Description |
|-----|-------------|
| `app_name` | Application name shown in the UI |
| `app_uri` | Public base URL used in generated checkout links |
| `http_listen` | Bind address for the HTTP server, default `:8000` |
| `db_type` | `sqlite`, `mysql`, or `postgres` |
| `db_*` | Database connection settings |
| `tron_grid_api_key` | TronGrid API credential |
| `api_auth_token` | API signing/auth token |
| `order_expiration_time` | Minutes before an unpaid order expires |
| `callback_retry_base_seconds` | Base delay for callback retries |
| `order_notice_max_retry` | Extra callback retries after the first attempt |

## Which Method Should You Choose?

- **New deployment** → Docker
- **BaoTa-based VPS** → BaoTa Panel
- **Custom Linux operations** → Manual
- **Public docs hosting** → Cloudflare Pages
