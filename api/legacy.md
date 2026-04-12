# API Migration Guide

This document covers the route change and new configuration options introduced in recent Epusdt versions.

## Route Change

| Old Route | New Route | Description |
|-----------|-----------|-------------|
| `POST /api/v1/order/create-transaction` | `POST /payments/epusdt/v1/order/create-transaction` | Create payment transaction |

> The old route remains functional (backward compatible), but migrating to the new route is recommended.

## For Dujiaoka Users

**Only one change needed:** In the Dujiaoka admin panel payment plugin config, update the API URL prefix from `/api` to `/payments/epusdt`.

```
Old: https://your-domain.com/api/v1/order/create-transaction
New: https://your-domain.com/payments/epusdt/v1/order/create-transaction
```

Everything else (secret key, callback URL, etc.) stays the same.

---

## New Configuration Options

### `api_rate_url` — Exchange Rate API URL

URL for fetching real-time exchange rates dynamically.

```bash
api_rate_url=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/
```

**API format:** The system requests `{api_rate_url}/{currency}.json`, e.g.:
- `https://your-rate-api.com/cny.json`

**Expected response format:**

```json
{
  "cny": {
    "usdt": 0.1389,
    "trx": 0.0123
  }
}
```

Where `0.1389` means 1 CNY = 0.1389 USDT (≈ 7.2 CNY per USDT). You can self-host a rate API as long as it follows this format.

---

### `tron_grid_api_key` — TRON Grid API Key

API key for TRON Grid, improving request limits and stability.

```bash
tron_grid_api_key=your-api-key-here
```

**How to get one:**

1. Visit [https://www.trongrid.io/](https://www.trongrid.io/)
2. Register and log in
3. Create an API Key in the dashboard

**Why it's recommended:**
- Higher API call quota — avoids rate limiting on public nodes
- Better stability for production deployments
- Enables future support for TRX and other tokens

---

## Full Config Reference

```bash
# Order expiry time (minutes)
order_expiration_time=15

# Max callback retry count (0 = unlimited)
order_notice_max_retry=0

# Exchange rate API URL
api_rate_url=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/

# TRON Grid API Key (recommended)
tron_grid_api_key=your-api-key-here
```
