# API Reference

This section documents the current Epusdt HTTP API for creating payment orders.

## Base URL

Use your deployed Epusdt server as the base URL:

```text
http://your-server:8000
```

For production, put Epusdt behind HTTPS:

```text
https://pay.example.com
```

## Authentication and Signature

Epusdt does **not** use Bearer tokens or HMAC signing for the payment API.

Instead, requests are signed with **MD5** using the `api_auth_token` value from your `.env` file.

Signature rules:

1. Collect all **non-empty** request parameters except `signature`
2. Sort parameters by key in ASCII ascending order
3. Join them as `key=value&key=value`
4. Append your `api_auth_token` directly to the end of that string
5. Compute the **MD5** hash
6. Convert the result to **lowercase** and send it as `signature`

Example:

```text
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirect
```

Append the token:

```text
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirectepusdt_password_xasddawqe
```

Then compute lowercase MD5.

## Request Format

- Method: `POST`
- Content type: `application/json` or `application/x-www-form-urlencoded`
- Character encoding: UTF-8

## Response Format

Successful HTTP responses return JSON in this shape:

```json
{
  "status_code": 200,
  "message": "success",
  "data": {
    "trade_id": "202203271648380592218340",
    "order_id": "9",
    "amount": 53,
    "actual_amount": 7.9104,
    "token": "TNEns8t9jbWENbStkQdVQtHMGpbsYsQjZK",
    "expiration_time": 1648381192,
    "payment_url": "http://example.com/pay/checkout-counter/202203271648380592218340"
  },
  "request_id": "b1344d70-ff19-4543-b601-37abfb3b3686"
}
```

## Status Codes

`status_code` values currently documented by the upstream project:

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | System error |
| `401` | Signature verification failed |
| `10002` | Payment transaction already exists |
| `10003` | No available wallet address |
| `10004` | Invalid payment amount / cannot satisfy minimum payment unit |
| `10005` | No available amount channel |
| `10006` | Exchange-rate calculation error |
| `10007` | Order block already processed |
| `10008` | Order does not exist |
| `10009` | Failed to parse parameters |

## Available Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/payments/epusdt/v1/order/create-transaction` | Create a payment transaction |

## Security Recommendations

- Keep `api_auth_token` secret and store it only on the server side
- Always use HTTPS in production
- Validate callback signatures before marking an order as paid
- Restrict access to your `.env` file
- Use a stable `tron_grid_api_key` for TRC20 monitoring

## Next Step

- [Payment API](/api/payment) — full request, response, callback, and signing details
