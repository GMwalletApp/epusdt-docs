# Installation Overview

Epusdt supports multiple deployment methods so you can choose the one that best fits your environment.

## Recommended Deployment Methods

### 1. Docker Deployment

**Best for most users.**

Docker is the fastest and cleanest way to deploy Epusdt. You can launch the service with a single image and keep configuration in environment variables or a mounted `config.yml` file.

Recommended when you want:

- Fast setup
- Easy upgrades
- Clean isolation from the host system
- Consistent deployment across servers

→ [Read the Docker deployment guide](/guide/installation/docker)

### 2. BaoTa Panel Deployment

**Best for panel-based server administration.**

If you manage servers with BaoTa (宝塔面板), you can deploy Epusdt using your existing web, database, Redis, and supervisor stack.

Recommended when you want:

- GUI-based server management
- Easy reverse proxy setup
- Built-in website/database tools

→ [Read the BaoTa deployment guide](/guide/installation/baota)

### 3. Manual Deployment

**Best for operators who want full control.**

Manual deployment is ideal if you prefer building from source, managing your own system services, or integrating Epusdt into a custom environment.

Recommended when you want:

- Full control over the runtime environment
- Source builds and custom packaging
- Native service management with systemd or supervisor

→ [Read the manual deployment guide](/guide/installation/manual)

### 4. Cloudflare Pages Deployment

**For documentation or frontend-only static sites.**

Cloudflare Pages can host the VitePress documentation site for Epusdt. This is useful if you want a public docs portal backed by GitHub and a custom domain.

> Note: Cloudflare Pages is suitable for the static documentation website, not for the Epusdt payment service itself.

→ [Read the Cloudflare Pages deployment guide](/guide/installation/cloudflare)

## Before You Deploy

Prepare the following information first:

- Your public site domain, such as `https://pay.example.com`
- A TronGrid API key for stable TRC20 transaction queries
- Database connection details
- Redis connection details
- An API token for external integrations
- Optional Telegram bot token and admin user ID

## Core Configuration Items

These settings are commonly required regardless of deployment method:

| Key | Description |
|-----|-------------|
| `app_name` | Application name shown in the admin UI |
| `app_uri` | Public domain used by the checkout page and callbacks |
| `db_*` | Database connection settings |
| `redis_*` | Redis queue and cache settings |
| `tron_api_key` / `tron_grid_api_key` | TronGrid API credential |
| `usdt_rate` | USDT exchange-rate related setting |
| `cny_rate` | RMB exchange-rate setting if used |
| `order_expiration_time` | Minutes before an unpaid order expires |
| `callback_timeout` | Timeout for callback delivery |

## Which Method Should You Choose?

- **New deployment** → Docker
- **BaoTa-based VPS** → BaoTa Panel
- **Custom operations / source build** → Manual
- **Public docs hosting** → Cloudflare Pages
