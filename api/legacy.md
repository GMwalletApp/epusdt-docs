# Legacy API

::: warning Deprecated
The legacy API endpoints documented on this page are **deprecated** and maintained only for backward compatibility. New integrations should use the [Payment API](/api/payment) instead.
:::

## Overview

Epusdt originally provided API endpoints under the `/api/v1/` path. These endpoints are still functional through a compatibility wrapper, but they have limited features compared to the new `/payments/epusdt/v1/` endpoints.

**Key differences:**

| Feature | Legacy API | New API |
|---------|-----------|---------|
| Endpoint prefix | `/api/v1/` | `/payments/epusdt/v1/` |
| Currency selection | Fixed to CNY | Configurable via `currency` field |
| Token selection | Fixed to USDT | Configurable via `token` field |
| Network selection | Fixed to TRON | Configurable via `network` field |
| Future updates | No new features | Actively maintained |

## Create Transaction (Legacy)

```
POST /api/v1/order/create-transaction
```

This endpoint creates a payment transaction with hardcoded defaults:

- `currency` = `cny`
- `token` = `usdt`
- `network` = `TRON`

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_id` | string | ✅ | Your unique order ID |
| `amount` | float | ✅ | Payment amount in CNY |
| `notify_url` | string | ✅ | Callback URL for payment notifications |
| `redirect_url` | string | ❌ | Redirect URL after payment |
| `signature` | string | ✅ | HMAC-SHA256 signature |

The signature algorithm is identical to the new API. See the [Signature Generation](/api/payment#signature-generation) section.

### Response

The response format is the same as the new API:

```json
{
  "status": 1,
  "message": "ok",
  "data": {
    "trade_id": "EP20240101XXXXXXXX",
    "order_id": "ORDER_20240101_001",
    "amount": 100.00,
    "actual_amount": 14.28,
    "token": "usdt",
    "network": "TRON",
    "receive_address": "TXXXXXXXXXXXXXXXXXXxx",
    "expiration_time": 10,
    "checkout_url": "http://your-server:8080/pay/checkout-counter/EP20240101XXXXXXXX"
  }
}
```

### Callback

Callbacks work the same as the new API. See [Callback / Webhook](/api/payment#callback-webhook).

## Exchange Rate {#exchange-rate}

Get the current USDT/CNY exchange rate used by Epusdt.

```
GET /api/v1/rate
```

### Response

```json
{
  "status": 1,
  "message": "ok",
  "data": {
    "rate": "7.12"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `rate` | string | Current USDT to CNY exchange rate |

### Example

::: code-group

```bash [cURL]
curl -X GET https://pay.example.com/api/v1/rate
```

```python [Python]
import requests

response = requests.get("https://pay.example.com/api/v1/rate")
data = response.json()

if data["status"] == 1:
    rate = float(data["data"]["rate"])
    print(f"Current USDT/CNY rate: {rate}")
    # Convert 100 CNY to USDT
    usdt_amount = 100 / rate
    print(f"100 CNY = {usdt_amount:.4f} USDT")
```

```javascript [Node.js]
const response = await fetch("https://pay.example.com/api/v1/rate");
const data = await response.json();

if (data.status === 1) {
  const rate = parseFloat(data.data.rate);
  console.log(`Current USDT/CNY rate: ${rate}`);
  // Convert 100 CNY to USDT
  const usdtAmount = (100 / rate).toFixed(4);
  console.log(`100 CNY = ${usdtAmount} USDT`);
}
```

:::

::: tip
The exchange rate is used internally by Epusdt to convert fiat amounts to USDT. This endpoint is useful for displaying estimated USDT amounts in your UI before creating a transaction.
:::

## Migration Guide

Migrating from the legacy API to the new API is straightforward. The core flow and signature algorithm remain the same.

### Step 1 — Update the Endpoint URL

Change your API call from:

```
POST /api/v1/order/create-transaction
```

To:

```
POST /payments/epusdt/v1/order/create-transaction
```

### Step 2 — Add Optional Fields (If Needed)

The new API supports additional optional fields. You can add them if needed, or omit them to use defaults:

```json
{
  "order_id": "ORDER_001",
  "amount": 100.00,
  "notify_url": "https://example.com/callback",
  "redirect_url": "https://example.com/success",
  "currency": "cny",
  "token": "usdt",
  "network": "TRON",
  "signature": "..."
}
```

If you omit `currency`, `token`, and `network`, they default to the same values as the legacy API (`cny`, `usdt`, `TRON`).

### Step 3 — Verify

1. Test the new endpoint in your staging environment
2. Verify that the signature generates correctly
3. Confirm callbacks are still received and processed
4. Switch production traffic to the new endpoint

### Quick Diff

```diff
- POST /api/v1/order/create-transaction
+ POST /payments/epusdt/v1/order/create-transaction

  {
    "order_id": "ORDER_001",
    "amount": 100.00,
    "notify_url": "https://example.com/callback",
+   "currency": "cny",      // optional, default: cny
+   "token": "usdt",        // optional, default: usdt
+   "network": "TRON",      // optional, default: TRON
    "signature": "..."
  }
```

::: info
The callback format and signature verification process are identical between the legacy and new APIs. No changes are needed on the callback handler side.
:::
