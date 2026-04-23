# API Migration Guide

This document covers the route change introduced in older Epusdt versions, and documents supplementary configuration options.

## Route Change

The old route `/api/v1/order/create-transaction` has been **removed**. Use the new routes:

| Integration | New Route |
|-------------|-----------|
| GMPay (recommended) | `POST /payments/gmpay/v1/order/create-transaction` |
| Epusdt (legacy compat) | `POST /payments/epusdt/v1/order/create-transaction` |
| EPay Compatible | `GET/POST /payments/epay/v1/order/create-transaction/submit.php` |

> ⚠️ The old `/api/v1/order/create-transaction` route is **no longer registered** in current source. Update your integration URL immediately.

## For Dujiaoka Users

**Only one change needed:** In the Dujiaoka admin panel payment plugin config, update the API URL to:

```
https://your-domain.com/payments/epusdt/v1/order/create-transaction
```

---

## Configuration Options

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

---

## Config Reference

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
