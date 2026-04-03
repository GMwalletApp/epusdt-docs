# API Reference

This section covers the Epusdt HTTP API — everything you need to integrate USDT payments into your application.

## Base URL

All API requests use your deployed Epusdt server as the base URL:

```
http://your-server:8080
```

In production, always use HTTPS with a reverse proxy (Nginx, Caddy, etc.):

```
https://pay.example.com
```

## Authentication

Epusdt uses a shared secret token for API authentication. The token is configured in your `.env` file as `app_token`.

You can pass the token in any of the following ways:

### 1. Authorization Header (Recommended)

```http
Authorization: Bearer YOUR_API_TOKEN
```

### 2. Query Parameter

```
POST /payments/epusdt/v1/order/create-transaction?token=YOUR_API_TOKEN
```

### 3. Request Body Field

Include `token` as a field in the JSON request body.

::: warning
Keep your API token secret. Never expose it in client-side code or public repositories.
:::

## Request Format

- All POST requests accept `application/json` or `application/x-www-form-urlencoded`
- All GET requests use standard query parameters
- Character encoding: UTF-8

## Response Format

All responses are JSON objects with a consistent structure:

### Success Response

```json
{
  "status": 1,
  "message": "ok",
  "data": {
    // Business data
  }
}
```

### Error Response

```json
{
  "status": 400,
  "message": "invalid params",
  "data": null
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| `1` | Success |
| `400` | Bad request / invalid parameters |
| `401` | Unauthorized (invalid or missing token) |
| `10001` | Order not found |
| `10002` | Order expired |
| `10003` | Duplicate order ID |
| `10004` | Amount out of range |
| `10005` | No available wallet address |
| `10006` | Currency not supported |
| `10007` | Network not supported |
| `10008` | Signature verification failed |
| `10009` | Order already paid |
| `10010` | System busy, try again later |

::: tip
Status code `1` indicates success. Any other value indicates an error — always check the `message` field for details.
:::

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/epusdt/v1/order/create-transaction` | [Create a payment transaction](/api/payment) |
| GET | `/pay/checkout-counter/:trade_id` | Redirect user to the payment page |
| GET | `/pay/check-status/:trade_id` | Check order payment status |
| POST | `/api/v1/order/create-transaction` | [Legacy: Create transaction](/api/legacy) (deprecated) |
| GET | `/api/v1/rate` | [Legacy: Get exchange rate](/api/legacy#exchange-rate) |

## Security Recommendations

- Always use **HTTPS** in production with a valid TLS certificate
- Store the API token on the server side only — never in frontend code
- Validate callback signatures in your business system
- Set reasonable `order_expiration_time` and `callback_timeout` values in your config
- Restrict access to the admin panel and `.env` file
- Use IP whitelisting for callback URLs when possible

## Next Steps

- [Payment API](/api/payment) — full integration guide with code examples
- [Legacy API](/api/legacy) — deprecated endpoints and migration guide
