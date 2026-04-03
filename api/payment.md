# Payment API

This page covers the full payment integration flow: creating transactions, redirecting users, handling callbacks, and checking order status.

## Create Transaction

Create a new payment order. Epusdt will lock a wallet address and amount for the customer.

**Endpoint:**

```
POST /payments/epusdt/v1/order/create-transaction
```

An alias is also available:

```
POST /payments/gmpay/v1/order/create-transaction
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_id` | string | ✅ | Your unique order ID (must not be reused) |
| `amount` | float | ✅ | Payment amount in fiat currency (default: CNY) |
| `notify_url` | string | ✅ | Callback URL — Epusdt will POST here when payment is confirmed |
| `redirect_url` | string | ❌ | URL to redirect the customer after payment |
| `currency` | string | ❌ | Fiat currency code. Default: `cny` |
| `token` | string | ❌ | Cryptocurrency to receive. Default: `usdt` |
| `network` | string | ❌ | Blockchain network. Default: `TRON` |
| `signature` | string | ✅ | MD5 signature (see [Signature Generation](#signature-generation)) |

### Signature Generation

The signature ensures request integrity. Generate it with the following rules:

1. Collect all request parameters with **non-empty values** (`''` and `null` are excluded)
2. Exclude the `signature` field itself
3. Sort parameters by key name in ASCII order (dictionary order)
4. Build the string in `key=value&key=value` format
5. Append your `api_auth_token` **directly to the end** of that string — **do not** add `&` or `=`
6. Compute the **MD5** hash of the full string and convert it to **lowercase**

#### Example

Given these parameters:

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

**Step 1 — Sort alphabetically:**

```
amount, notify_url, order_id, redirect_url
```

**Step 2 — Build the sorted parameter string:**

```
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirect
```

**Step 3 — Append the token directly at the end:**

```
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirectepusdt_password_xasddawqe
```

**Step 4 — Compute lowercase MD5:**

```
md5(above) = 1cd4b52df5587cfb1968b0c0c6e156cd
```

#### Rules

- Exclude empty parameters from signing
- Exclude the `signature` field itself
- MD5 output must be lowercase

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
    "checkout_url": "http://your-server:8000/pay/checkout-counter/EP20240101XXXXXXXX"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `trade_id` | string | Epusdt internal trade ID |
| `order_id` | string | Your original order ID |
| `amount` | float | Original fiat amount |
| `actual_amount` | float | Actual USDT amount the customer needs to pay |
| `token` | string | Cryptocurrency type (e.g. `usdt`) |
| `network` | string | Blockchain network (e.g. `TRON`) |
| `receive_address` | string | USDT wallet address for the customer to send to |
| `expiration_time` | int | Order expiration time in minutes |
| `checkout_url` | string | URL of the hosted payment page |

## Payment Flow

After creating a transaction, follow this flow:

```
1. Your server calls Create Transaction API
2. Epusdt returns trade_id, receive_address, checkout_url
3. Redirect customer to checkout_url (or display QR code yourself)
4. Customer sends USDT to receive_address
5. Epusdt detects payment on-chain
6. Epusdt POSTs callback to your notify_url
7. Your server verifies signature and returns "ok"
8. (Optional) Customer is redirected to redirect_url
```

## Checkout Page

Redirect the customer to the hosted payment page:

```
GET /pay/checkout-counter/:trade_id
```

**Example:**

```
https://pay.example.com/pay/checkout-counter/EP20240101XXXXXXXX
```

The checkout page displays:
- USDT amount to pay
- Wallet address (with copy button)
- QR code for wallet apps
- Countdown timer
- Real-time payment status

## Check Order Status

Query the current status of an order:

```
GET /pay/check-status/:trade_id
```

**Example:**

```
GET https://pay.example.com/pay/check-status/EP20240101XXXXXXXX
```

**Response:**

```json
{
  "status": 1,
  "message": "ok",
  "data": {
    "trade_id": "EP20240101XXXXXXXX",
    "order_id": "ORDER_20240101_001",
    "status": 2
  }
}
```

### Order Status Values

| Status | Meaning |
|--------|---------|
| `1` | Waiting for payment |
| `2` | Payment confirmed (paid) |
| `3` | Order expired |

## Callback / Webhook

When a payment is confirmed on-chain, Epusdt sends a POST request to the `notify_url` you specified when creating the transaction.

### Callback Payload

```json
{
  "trade_id": "EP20240101XXXXXXXX",
  "order_id": "ORDER_20240101_001",
  "amount": 100.00,
  "actual_amount": 14.28,
  "token": "usdt",
  "network": "TRON",
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
| `actual_amount` | float | Actual USDT amount paid |
| `token` | string | Cryptocurrency type |
| `network` | string | Blockchain network |
| `status` | int | Order status (`2` = paid) |
| `signature` | string | MD5 signature for verification |

### Verifying the Callback Signature

Always verify the `signature` in the callback to ensure it came from your Epusdt server:

1. Extract all callback fields with **non-empty values**, except `signature`
2. Sort them alphabetically by key
3. Build the `key=value&key=value` string
4. Append your `api_auth_token` directly to the end of the string
5. Compute the lowercase **MD5** and compare it with the received `signature`

Use the same [signature generation](#signature-generation) logic shown above.

### Responding to the Callback

::: danger Important
Your server **must** return the exact plain-text response `ok` (HTTP 200) to acknowledge the callback.

If Epusdt does not receive `ok`, it will **retry the callback** until either:
- Your server responds with `ok`, or
- The `callback_timeout` configured in your `.env` is exceeded
:::

**Example callback handler:**

::: code-group

```python [Python / Flask]
from flask import Flask, request
import hashlib

app = Flask(__name__)

def epusdt_sign(params: dict, token: str) -> str:
    filtered = {k: v for k, v in params.items() if v != '' and v is not None and k != 'signature'}
    sorted_str = '&'.join(f"{k}={v}" for k, v in sorted(filtered.items()))
    return hashlib.md5((sorted_str + token).encode()).hexdigest()

@app.route("/callback", methods=["POST"])
def payment_callback():
    data = request.json

    # 1. Verify signature
    expected_sig = epusdt_sign(data, "your_api_auth_token")
    if data.get("signature") != expected_sig:
        return "signature mismatch", 400

    # 2. Check status
    if data.get("status") == 2:
        order_id = data["order_id"]
        # Mark order as paid in your database
        mark_order_paid(order_id)

    # 3. Return "ok" — this is mandatory
    return "ok"
```

```javascript [Node.js / Express]
const express = require("express");
const crypto = require("crypto");
const app = express();
app.use(express.json());

function epusdtSign(params, token) {
  const filtered = Object.entries(params)
    .filter(([key, value]) => key !== "signature" && value !== "" && value !== null)
    .sort(([a], [b]) => a.localeCompare(b));

  const sortedStr = filtered
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("md5")
    .update(sortedStr + token)
    .digest("hex");
}

app.post("/callback", (req, res) => {
  const data = req.body;

  // 1. Verify signature
  const expectedSig = epusdtSign(data, "your_api_auth_token");
  if (data.signature !== expectedSig) {
    return res.status(400).send("signature mismatch");
  }

  // 2. Check status
  if (data.status === 2) {
    const orderId = data.order_id;
    // Mark order as paid in your database
    markOrderPaid(orderId);
  }

  // 3. Return "ok" — this is mandatory
  res.send("ok");
});
```

```php [PHP]
<?php
$data = json_decode(file_get_contents('php://input'), true);

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

// 1. Verify signature
$expectedSig = epusdtSign($data, 'your_api_auth_token');
if ($data['signature'] !== $expectedSig) {
    http_response_code(400);
    echo 'signature mismatch';
    exit;
}

// 2. Check status
if ($data['status'] == 2) {
    $orderId = $data['order_id'];
    // Mark order as paid in your database
    markOrderPaid($orderId);
}

// 3. Return "ok" — this is mandatory
echo 'ok';
```

:::

## Full Integration Example

Here is a complete example in Python showing the entire flow:

```python
import hashlib
import requests

API_BASE = "https://pay.example.com"
API_TOKEN = "your_api_token"
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
        headers={"Authorization": f"Bearer {API_TOKEN}"},
    )
    result = response.json()

    if result["status"] == 1:
        data = result["data"]
        print(f"Trade ID:     {data['trade_id']}")
        print(f"USDT Amount:  {data['actual_amount']}")
        print(f"Address:      {data['receive_address']}")
        print(f"Checkout URL: {data['checkout_url']}")
        return data
    else:
        print(f"Error: {result['message']}")
        return None

# Create an order
create_order("ORDER_001", 100.00, "https://example.com/callback")
```

## Error Handling

| Status Code | Message | How to Fix |
|-------------|---------|------------|
| `400` | `invalid params` | Check required fields and data types |
| `401` | `unauthorized` | Verify your API token |
| `10003` | `duplicate order` | Use a unique `order_id` |
| `10004` | `amount out of range` | Check amount limits in your config |
| `10005` | `no available address` | Add more wallet addresses |
| `10008` | `signature failed` | Verify your signature logic and secret key |
