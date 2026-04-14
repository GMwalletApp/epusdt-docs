# GMPay Integration (Recommended)

Use GMPay when you want the native multi-network API flow.

::: tip
Endpoint: `POST /payments/gmpay/v1/order/create-transaction`
:::

## Configuration

Configure `api_auth_token` in your `.env`.

```dotenv
api_auth_token=your-secret-token
```

::: info
Unlike the legacy-compatible Epusdt route, GMPay does not inject default values. You must explicitly send `currency`, `token`, and `network`.
:::

## Supported Networks and Tokens

Current source and docs expose these combinations for hosted checkout switching:

| Network | Token |
|---|---|
| `tron` | `usdt` |
| `solana` | `usdt` |
| `solana` | `usdc` |
| `ethereum` | `usdt` |
| `ethereum` | `usdc` |

## Signature Algorithm

The signing rule is the same as Epusdt.

1. Keep all non-empty parameters except `signature`
2. Sort parameter names in ASCII ascending order
3. Join them as `key=value&key=value`
4. Append `api_auth_token`
5. Compute lowercase MD5

::: code-group

```php [PHP]
<?php
function gmpaySign(array $params, string $token): string {
    ksort($params);
    $parts = [];
    foreach ($params as $key => $value) {
        if ($value === '' || $value === null || $key === 'signature') continue;
        $parts[] = $key . '=' . $value;
    }
    return md5(implode('&', $parts) . $token);
}
```

```python [Python]
import hashlib


def gmpay_sign(params: dict, token: str) -> str:
    filtered = {k: v for k, v in params.items() if v not in ('', None) and k != 'signature'}
    raw = '&'.join(f"{k}={v}" for k, v in sorted(filtered.items()))
    return hashlib.md5((raw + token).encode()).hexdigest()
```

```go [Go]
package main

import (
    "crypto/md5"
    "fmt"
    "sort"
    "strings"
)

func GMPaySign(params map[string]string, token string) string {
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

## Create Order

### Request

```http
POST /payments/gmpay/v1/order/create-transaction
Content-Type: application/json
```

```json
{
  "order_id": "ORDER_10002",
  "currency": "cny",
  "token": "usdt",
  "network": "tron",
  "amount": 100,
  "notify_url": "https://merchant.example.com/notify",
  "redirect_url": "https://merchant.example.com/return",
  "signature": "e5f5d7f78516d5b51f8ef0dfec6177dd"
}
```

### Request Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `order_id` | string | ✅ | Merchant order ID, max 32 chars |
| `currency` | string | ✅ | Fiat currency, for example `cny` |
| `token` | string | ✅ | Token symbol, for example `usdt` or `usdc` |
| `network` | string | ✅ | Lowercase network name: `tron`, `solana`, `ethereum` |
| `amount` | float | ✅ | Fiat amount, must be greater than `0.01` |
| `notify_url` | string | ✅ | Async callback URL |
| `redirect_url` | string | ❌ | Browser redirect URL after payment |
| `signature` | string | ✅ | MD5 signature |
| `name` | string | ❌ | Optional product name |
| `payment_type` | string | ❌ | Optional source marker |

### Response

```json
{
  "status_code": 200,
  "message": "success",
  "data": {
    "trade_id": "EP20240101XXXXXXXX",
    "order_id": "ORDER_10002",
    "amount": 100,
    "currency": "CNY",
    "actual_amount": 14.28,
    "receive_address": "TXXXXXXXXXXXXXXXXXXxx",
    "token": "USDT",
    "expiration_time": 1712500000,
    "payment_url": "https://pay.example.com/pay/checkout-counter/EP20240101XXXXXXXX"
  },
  "request_id": "b1344d70-ff19-4543-b601-37abfb3b3686"
}
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `trade_id` | string | Epusdt trade ID |
| `order_id` | string | Your original order ID |
| `amount` | float | Original fiat amount |
| `currency` | string | Fiat currency |
| `actual_amount` | float | Token amount the customer needs to pay |
| `receive_address` | string | Payment address |
| `token` | string | Token symbol |
| `expiration_time` | int | Expiration Unix timestamp in seconds |
| `payment_url` | string | Hosted checkout URL |

::: warning
Current create-order response does not include `network`, even though `network` is required in the request.
:::

## Switch-Network Child Order Mechanism

Hosted checkout supports switching payment routes.

```http
POST /pay/switch-network
Content-Type: application/json
```

```json
{
  "trade_id": "EP20240101XXXXXXXX",
  "token": "usdc",
  "network": "solana"
}
```

### Request Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `trade_id` | string | ✅ | Parent trade ID |
| `token` | string | ✅ | Target token |
| `network` | string | ✅ | Target network |

### Behavior

- If requested `token + network` matches the parent order, source returns the current checkout data
- If an active child order for that route already exists, source reuses it
- Otherwise source creates a new child order and reserves a wallet on the target network
- Current source allows at most `2` active child orders per parent order
- When one route is paid, sibling child orders are expired and their locks are released

## Async Callback

Callback handling is the same as Epusdt.

```json
{
  "trade_id": "202203251648208648961728",
  "order_id": "ORDER_10002",
  "amount": 100,
  "actual_amount": 15.625,
  "receive_address": "TNEns8t9jbWENbStkQdVQtHMGpbsYsQjZK",
  "token": "USDT",
  "block_transaction_id": "123333333321232132131",
  "signature": "xsadaxsaxsa",
  "status": 2
}
```

Verify the callback with the same MD5 rules and `api_auth_token`, then return exact plain text `ok` with HTTP 200.

## Full Code Example

::: code-group

```php [PHP]
<?php
$apiUrl = 'https://pay.example.com/payments/gmpay/v1/order/create-transaction';
$token = 'your-api-auth-token';

function gmpaySign(array $params, string $token): string {
    ksort($params);
    $parts = [];
    foreach ($params as $key => $value) {
        if ($value === '' || $value === null || $key === 'signature') continue;
        $parts[] = $key . '=' . $value;
    }
    return md5(implode('&', $parts) . $token);
}

$params = [
    'order_id' => 'ORDER_10002',
    'currency' => 'cny',
    'token' => 'usdt',
    'network' => 'tron',
    'amount' => 100,
    'notify_url' => 'https://merchant.example.com/notify',
    'redirect_url' => 'https://merchant.example.com/return',
];
$params['signature'] = gmpaySign($params, $token);

$ch = curl_init($apiUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($params, JSON_UNESCAPED_SLASHES),
    CURLOPT_RETURNTRANSFER => true,
]);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
```

```python [Python]
import hashlib
import requests

API_URL = 'https://pay.example.com/payments/gmpay/v1/order/create-transaction'
API_TOKEN = 'your-api-auth-token'


def gmpay_sign(params: dict, token: str) -> str:
    filtered = {k: v for k, v in params.items() if v not in ('', None) and k != 'signature'}
    raw = '&'.join(f"{k}={v}" for k, v in sorted(filtered.items()))
    return hashlib.md5((raw + token).encode()).hexdigest()


payload = {
    'order_id': 'ORDER_10002',
    'currency': 'cny',
    'token': 'usdt',
    'network': 'tron',
    'amount': 100,
    'notify_url': 'https://merchant.example.com/notify',
    'redirect_url': 'https://merchant.example.com/return',
}
payload['signature'] = gmpay_sign(payload, API_TOKEN)
response = requests.post(API_URL, json=payload, timeout=15)
print(response.json())
```

```go [Go]
package main

import (
    "bytes"
    "crypto/md5"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "sort"
    "strings"
)

const apiURL = "https://pay.example.com/payments/gmpay/v1/order/create-transaction"
const apiToken = "your-api-auth-token"

func gmpaySign(params map[string]string, token string) string {
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

func main() {
    payload := map[string]string{
        "order_id":     "ORDER_10002",
        "currency":     "cny",
        "token":        "usdt",
        "network":      "tron",
        "amount":       "100",
        "notify_url":   "https://merchant.example.com/notify",
        "redirect_url": "https://merchant.example.com/return",
    }
    payload["signature"] = gmpaySign(payload, apiToken)

    body, _ := json.Marshal(payload)
    req, _ := http.NewRequest(http.MethodPost, apiURL, bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    raw, _ := io.ReadAll(resp.Body)
    fmt.Println(string(raw))
}
```

:::

## See Also

- [/api/reference](/api/reference)
- [/api/payment](/api/payment)
