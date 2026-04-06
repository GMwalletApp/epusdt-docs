# Payment API

This page covers the current payment integration flow: creating transactions, redirecting users, handling callbacks, and checking order status.

## Create Transaction

Create a new payment order. Epusdt locks a wallet address and amount for the order window.

**Live endpoint:**

```
POST /payments/epusdt/v1/order/create-transaction
```

**Also available:**

```
POST /payments/gmpay/v1/order/create-transaction
```

::: tip
`/payments/...` is the current live API prefix. `/api/v1/order/create-transaction` is a legacy path from older docs, not a registered route in current source.
:::

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_id` | string | ✅ | Your unique order ID, max 32 chars |
| `amount` | float | ✅ | Fiat amount; must be greater than `0.01` |
| `notify_url` | string | ✅ | Callback URL; Epusdt POSTs here after payment success |
| `redirect_url` | string | ❌ | Customer redirect URL after payment |
| `currency` | string | ✅* | Fiat currency code |
| `token` | string | ✅* | Token symbol |
| `network` | string | ✅* | Blockchain network |
| `signature` | string | ✅ | MD5 signature |

`*` The shared request validator requires `currency`, `token`, and `network`. On the live `/payments/epusdt/v1/...` route, current source injects defaults when omitted:

- `currency = cny`
- `token = usdt`
- `network = TRON`

The `/payments/gmpay/v1/...` route does **not** inject these defaults.

### Signature Generation

Generate `signature` with these rules:

1. Collect all non-empty parameters except `signature`
2. Sort by key in ASCII ascending order
3. Join as `key=value&key=value`
4. Append `api_auth_token` directly to the end
5. Compute lowercase MD5

#### Example

Given:

```
order_id = "20220201030210321"
amount = 42
notify_url = "http://example.com/notify"
redirect_url = "http://example.com/redirect"
```

Token:

```
api_auth_token = "epusdt_password_xasddawqe"
```

Sorted string:

```
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirect
```

Append token:

```
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirectepusdt_password_xasddawqe
```

MD5:

```
1cd4b52df5587cfb1968b0c0c6e156cd
```

#### Code Examples

::: code-group

```php [PHP]
<?php
function epusdtSign(array $parameter, string $signKey): string {
    ksort($parameter);
    reset($parameter);
    $sign = '';
    foreach ($parameter as $key => $val) {
        if ($val === '' || $val === null) continue;
        if ($key === 'signature') continue;
        if ($sign !== '') $sign .= '&';
        $sign .= "$key=$val";
    }
    return md5($sign . $signKey);
}
```

```python [Python]
import hashlib

def epusdt_sign(params: dict, token: str) -> str:
    filtered = {k: v for k, v in params.items() if v != '' and v is not None and k != 'signature'}
    sorted_str = '&'.join(f"{k}={v}" for k, v in sorted(filtered.items()))
    return hashlib.md5((sorted_str + token).encode()).hexdigest()
```

```go [Go]
import (
    "crypto/md5"
    "fmt"
    "sort"
    "strings"
)

func EpusdtSign(params map[string]string, token string) string {
    keys := make([]string, 0)
    for k, v := range params {
        if v != "" && k != "signature" {
            keys = append(keys, k)
        }
    }
    sort.Strings(keys)
    parts := make([]string, 0, len(keys))
    for _, k := range keys {
        parts = append(parts, k+"="+params[k])
    }
    raw := strings.Join(parts, "&") + token
    return fmt.Sprintf("%x", md5.Sum([]byte(raw)))
}
```

:::

### Response

```json
{
  "status_code": 200,
  "message": "success",
  "data": {
    "trade_id": "EP20240101XXXXXXXX",
    "order_id": "ORDER_20240101_001",
    "amount": 100.0,
    "currency": "cny",
    "actual_amount": 14.28,
    "receive_address": "TXXXXXXXXXXXXXXXXXXxx",
    "token": "usdt",
    "expiration_time": 1712500000,
    "payment_url": "http://your-server:8000/pay/checkout-counter/EP20240101XXXXXXXX"
  },
  "request_id": "b1344d70-ff19-4543-b601-37abfb3b3686"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `trade_id` | string | Epusdt internal trade ID |
| `order_id` | string | Your original order ID |
| `amount` | float | Original fiat amount |
| `currency` | string | Fiat currency code |
| `actual_amount` | float | Actual token amount the customer needs to pay |
| `receive_address` | string | Payment address |
| `token` | string | Token symbol, such as `usdt` |
| `expiration_time` | int | Expiration Unix timestamp in seconds |
| `payment_url` | string | Hosted checkout URL |

Current create-order response does **not** include `network`.

## Payment Flow

```
1. Your server calls the create-transaction API
2. Epusdt returns `trade_id`, `receive_address`, and `payment_url`
3. Redirect the customer to `payment_url` or render the address / QR code yourself
4. Customer sends funds to `receive_address`
5. Epusdt detects payment on-chain
6. Epusdt POSTs a callback to `notify_url`
7. Your server verifies the signature and returns exact body `ok`
8. If `redirect_url` exists, the hosted checkout page redirects the user after success
```

## Checkout Page

Hosted checkout page:

```
GET /pay/checkout-counter/:trade_id
```

Example:

```
https://pay.example.com/pay/checkout-counter/EP20240101XXXXXXXX
```

## Check Order Status

Status polling endpoint:

```
GET /pay/check-status/:trade_id
```

Example:

```
GET https://pay.example.com/pay/check-status/EP20240101XXXXXXXX
```

Response:

```json
{
  "status_code": 200,
  "message": "success",
  "data": {
    "trade_id": "EP20240101XXXXXXXX",
    "status": 2
  },
  "request_id": "b1344d70-ff19-4543-b601-37abfb3b3686"
}
```

### Order Status Values

| Status | Meaning |
|--------|---------|
| `1` | Waiting for payment |
| `2` | Payment success |
| `3` | Expired |

## Callback / Webhook

When payment is confirmed on-chain, Epusdt POSTs to the `notify_url` from the create-order request.

The callback body is signed with the same MD5 algorithm and `api_auth_token` used for create-order requests.

### Callback Payload

```json
{
  "trade_id": "EP20240101XXXXXXXX",
  "order_id": "ORDER_20240101_001",
  "amount": 100.0,
  "actual_amount": 14.28,
  "receive_address": "TXXXXXXXXXXXXXXXXXXxx",
  "token": "usdt",
  "block_transaction_id": "4d7d...",
  "status": 2,
  "signature": "a1b2c3d4e5f6..."
}
```

### Callback Fields

| Field | Type | Description |
|-------|------|-------------|
| `trade_id` | string | Epusdt internal trade ID |
| `order_id` | string | Your original order ID |
| `amount` | float | Original fiat amount |
| `actual_amount` | float | Actual token amount received |
| `receive_address` | string | Payment address |
| `token` | string | Token symbol |
| `block_transaction_id` | string | On-chain transaction ID |
| `status` | int | Order status (`2` = paid) |
| `signature` | string | MD5 signature for verification |

Current callback payload does **not** include `network`.

### Verifying the Callback Signature

Use the same signing rules as the create-order request:

1. Keep all non-empty fields except `signature`
2. Sort by key
3. Join as `key=value&key=value`
4. Append `api_auth_token`
5. Compute lowercase MD5 and compare

### Responding to the Callback

::: danger Important
Your server **must** return the exact plain-text body `ok` with **HTTP 200**.

Current retry behavior is configuration-driven, not a fixed hardcoded retry count:

- `order_notice_max_retry` — maximum retry count after the first attempt
- `callback_retry_base_seconds` — exponential backoff base delay

Default `.env.example` values are:

- `order_notice_max_retry=0`
- `callback_retry_base_seconds=5`

So with default settings, Epusdt performs the first callback attempt, but no extra retries after a failure.
:::

## Full Integration Example

```python
import hashlib
import requests

API_BASE = "https://pay.example.com"
API_AUTH_TOKEN = "your_api_auth_token"

def epusdt_sign(params: dict, token: str) -> str:
    filtered = {k: v for k, v in params.items() if v != '' and v is not None and k != 'signature'}
    sorted_str = '&'.join(f"{k}={v}" for k, v in sorted(filtered.items()))
    return hashlib.md5((sorted_str + token).encode()).hexdigest()

def create_order(order_id: str, amount: float, notify_url: str):
    params = {
        "order_id": order_id,
        "amount": amount,
        "notify_url": notify_url,
    }
    params["signature"] = epusdt_sign(params, API_AUTH_TOKEN)

    response = requests.post(
        f"{API_BASE}/payments/epusdt/v1/order/create-transaction",
        json=params,
    )
    result = response.json()

    if result["status_code"] == 200:
        data = result["data"]
        print(f"Trade ID:     {data['trade_id']}")
        print(f"USDT Amount:  {data['actual_amount']}")
        print(f"Address:      {data['receive_address']}")
        print(f"Payment URL:  {data['payment_url']}")
        return data
    else:
        print(f"Error: {result['message']}")
        return None

create_order("ORDER_001", 100.00, "https://example.com/callback")
```

## Error Handling

| Status Code | Message | How to Fix |
|-------------|---------|------------|
| `400` | system / validation error | Check request body and required fields |
| `401` | `signature verification failed` | Verify your signature logic and `api_auth_token` |
| `10002` | `order already exists` | Use a unique `order_id` |
| `10003` | `no available wallet address` | Add more wallet addresses |
| `10004` | `invalid payment amount` | Check amount limits and minimum value |
| `10005` | `no available amount channel` | Retry with another amount or review channel allocation |
| `10008` | `order does not exist` | Verify the queried `trade_id` |
