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
| `signature` | string | ✅ | HMAC-SHA256 signature (see [Signature Generation](#signature-generation)) |

### Signature Generation

The signature ensures request integrity. To generate it:

1. Collect all request parameters **except** `signature` itself
2. Sort parameters alphabetically by key name
3. Build a query string in `key=value&key=value` format
4. Compute HMAC-SHA256 using your **app secret key** as the HMAC key
5. The result (hex-encoded) is your `signature`

#### Example

Given these parameters:

```
order_id = "ORDER_20240101_001"
amount = 100.00
notify_url = "https://example.com/callback"
redirect_url = "https://example.com/success"
```

**Step 1 — Sort alphabetically:**

```
amount, notify_url, order_id, redirect_url
```

**Step 2 — Build query string:**

```
amount=100.00&notify_url=https://example.com/callback&order_id=ORDER_20240101_001&redirect_url=https://example.com/success
```

**Step 3 — HMAC-SHA256 with your secret key:**

```
signature = HMAC-SHA256(query_string, your_app_secret)
```

#### Code Examples

::: code-group

```python [Python]
import hmac
import hashlib
from urllib.parse import urlencode

def generate_signature(params: dict, secret: str) -> str:
    """Generate HMAC-SHA256 signature for Epusdt API."""
    # Remove signature field if present
    filtered = {k: v for k, v in params.items() if k != "signature"}
    # Sort by key name
    sorted_params = sorted(filtered.items())
    # Build query string
    query_string = urlencode(sorted_params)
    # Compute HMAC-SHA256
    return hmac.new(
        secret.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

# Usage
params = {
    "order_id": "ORDER_20240101_001",
    "amount": 100.00,
    "notify_url": "https://example.com/callback",
    "redirect_url": "https://example.com/success",
}
secret = "your_app_secret_key"
params["signature"] = generate_signature(params, secret)
```

```javascript [Node.js]
const crypto = require("crypto");

function generateSignature(params, secret) {
  // Remove signature field if present
  const filtered = Object.entries(params)
    .filter(([key]) => key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b));

  // Build query string
  const queryString = filtered
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  // Compute HMAC-SHA256
  return crypto
    .createHmac("sha256", secret)
    .update(queryString)
    .digest("hex");
}

// Usage
const params = {
  order_id: "ORDER_20240101_001",
  amount: 100.0,
  notify_url: "https://example.com/callback",
  redirect_url: "https://example.com/success",
};
const secret = "your_app_secret_key";
params.signature = generateSignature(params, secret);
```

```php [PHP]
<?php
function generateSignature(array $params, string $secret): string {
    // Remove signature field if present
    unset($params['signature']);
    // Sort by key name
    ksort($params);
    // Build query string
    $queryString = http_build_query($params);
    // Compute HMAC-SHA256
    return hash_hmac('sha256', $queryString, $secret);
}

// Usage
$params = [
    'order_id'     => 'ORDER_20240101_001',
    'amount'       => 100.00,
    'notify_url'   => 'https://example.com/callback',
    'redirect_url' => 'https://example.com/success',
];
$secret = 'your_app_secret_key';
$params['signature'] = generateSignature($params, $secret);
```

```go [Go]
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/url"
	"sort"
)

func generateSignature(params map[string]string, secret string) string {
	// Collect and sort keys (exclude "signature")
	keys := make([]string, 0, len(params))
	for k := range params {
		if k != "signature" {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)

	// Build query string
	values := url.Values{}
	for _, k := range keys {
		values.Set(k, params[k])
	}
	queryString := values.Encode()

	// Compute HMAC-SHA256
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(queryString))
	return hex.EncodeToString(mac.Sum(nil))
}

func main() {
	params := map[string]string{
		"order_id":     "ORDER_20240101_001",
		"amount":       "100.00",
		"notify_url":   "https://example.com/callback",
		"redirect_url": "https://example.com/success",
	}
	secret := "your_app_secret_key"
	sig := generateSignature(params, secret)
	fmt.Println("Signature:", sig)
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
    "checkout_url": "http://your-server:8080/pay/checkout-counter/EP20240101XXXXXXXX"
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
| `signature` | string | HMAC-SHA256 signature for verification |

### Verifying the Callback Signature

Always verify the `signature` in the callback to ensure it came from your Epusdt server:

1. Extract all fields from the callback **except** `signature`
2. Sort them alphabetically by key
3. Build the query string
4. Compute HMAC-SHA256 with your app secret
5. Compare the result with the received `signature`

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

app = Flask(__name__)

@app.route("/callback", methods=["POST"])
def payment_callback():
    data = request.json

    # 1. Verify signature
    expected_sig = generate_signature(data, "your_app_secret_key")
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
const app = express();
app.use(express.json());

app.post("/callback", (req, res) => {
  const data = req.body;

  // 1. Verify signature
  const expectedSig = generateSignature(data, "your_app_secret_key");
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

// 1. Verify signature
$expectedSig = generateSignature($data, 'your_app_secret_key');
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
import hmac
import hashlib
import requests
from urllib.parse import urlencode

API_BASE = "https://pay.example.com"
API_TOKEN = "your_api_token"
APP_SECRET = "your_app_secret_key"

def generate_signature(params: dict, secret: str) -> str:
    filtered = {k: v for k, v in params.items() if k != "signature"}
    sorted_params = sorted(filtered.items())
    query_string = urlencode(sorted_params)
    return hmac.new(
        secret.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

def create_order(order_id: str, amount: float, notify_url: str):
    params = {
        "order_id": order_id,
        "amount": amount,
        "notify_url": notify_url,
    }
    params["signature"] = generate_signature(params, APP_SECRET)

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
