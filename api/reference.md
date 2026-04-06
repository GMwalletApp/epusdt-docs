# API Reference

This section documents the current Epusdt HTTP API baseline based on the official source.

## Base URL

Use your deployed Epusdt server as the base URL, for example:

```text
http://your-server:8000
```

For production, place Epusdt behind HTTPS:

```text
https://pay.example.com
```

## Authentication and Signing

Current source does **not** implement separate bearer-token, query-token, or request-body token authentication for payment creation.

What the live payment endpoints validate is the request `signature`, generated with the `.env` value `api_auth_token`.

::: warning
Keep `api_auth_token` secret. Never expose it in frontend code, mobile apps, or public repositories.
:::

## Request Signature

Signature algorithm: **MD5**

Rules:

1. Collect all non-empty parameters except `signature`
2. Sort by key in ASCII ascending order
3. Join as `key=value&key=value`
4. Append `api_auth_token` directly to the end
5. Compute lowercase MD5

Example:

```text
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirect
```

Append token:

```text
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirectepusdt_password_xasddawqe
```

## Request Format

- Method: `POST` or `GET`
- POST supports `application/json` and `application/x-www-form-urlencoded`
- Encoding: UTF-8

## Response Format

Successful responses use this shape:

```json
{
  "status_code": 200,
  "message": "success",
  "data": {
    "trade_id": "202203271648380592218340",
    "order_id": "9",
    "amount": 53,
    "currency": "cny",
    "actual_amount": 7.9104,
    "receive_address": "TNEns8t9jbWENbStkQdVQtHMGpbsYsQjZK",
    "token": "usdt",
    "expiration_time": 1648381192,
    "payment_url": "http://example.com/pay/checkout-counter/202203271648380592218340"
  },
  "request_id": "b1344d70-ff19-4543-b601-37abfb3b3686"
}
```

## Status Codes

Current source uses top-level `status_code` for API results:

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | System error or request validation failure |
| `401` | Signature verification failed |
| `10001` | Wallet address already exists |
| `10002` | Order already exists |
| `10003` | No available wallet address |
| `10004` | Invalid payment amount |
| `10005` | No available amount channel |
| `10006` | Rate calculation failed |
| `10007` | Block transaction already processed |
| `10008` | Order does not exist |
| `10009` | Failed to parse request params |
| `10010` | Order status already changed |

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/payments/epusdt/v1/order/create-transaction` | Create a payment transaction; injects default `token=usdt`, `currency=cny`, `network=TRON` when omitted |
| `POST` | `/payments/gmpay/v1/order/create-transaction` | Create a payment transaction without legacy default injection |
| `GET` | `/pay/checkout-counter/:trade_id` | Hosted checkout page |
| `GET` | `/pay/check-status/:trade_id` | Checkout status polling endpoint |

::: tip
The live API prefix is `/payments/...`. The older `/api/v1/order/create-transaction` path is legacy documentation, not a registered route in current source.
:::

## Prefix Distinctions

Keep these prefixes separate:

- `/payments/...` — live API routes
- `/pay/...` — checkout/UI routes
- `app_uri` — external absolute base used to build URLs such as `payment_url`

`app_uri` is **not** a server-side route prefix.

## Security Recommendations

- Keep `api_auth_token` secret and server-side only
- Always use HTTPS in production
- Verify callback signatures before marking orders paid
- Treat callback success as **HTTP 200 + exact body `ok`**
- Restrict access to `.env` and admin surfaces
- Use a stable `tron_grid_api_key` for TRC20 monitoring

## Next Step

- [Payment API](/api/payment) — create-order, callback, status, and example details
