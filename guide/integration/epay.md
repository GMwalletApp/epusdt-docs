# EPay-Compatible Integration (Redirect Checkout)

Use this route when you want an EPay-style redirect flow.

::: tip
Endpoint: `GET /payments/epay/v1/order/create-transaction/submit.php`
:::

## Configuration

Current `.env.example` includes these EPay-related settings:

```dotenv
epay_pid=
epay_key=
```

::: info
Current source uses `epay_pid` when building EPay-compatible parameters and uses `epay_key` for outbound EPay-format callbacks.

For the incoming create-order request on `/payments/epay/v1/order/create-transaction/submit.php`, current router code verifies `sign` with `api_auth_token`.
:::

## Integration Method

This is a browser redirect flow. Build a GET URL with query parameters, then redirect the customer to it.

```text
GET /payments/epay/v1/order/create-transaction/submit.php?pid=1001&type=alipay&out_trade_no=ORDER_10003&notify_url=https%3A%2F%2Fmerchant.example.com%2Fnotify&return_url=https%3A%2F%2Fmerchant.example.com%2Freturn&name=VIP%20Order&money=100&sign=xxxx&sign_type=MD5
```

After Epusdt creates the order, current source redirects the browser to hosted checkout:

```text
/pay/checkout-counter/{trade_id}
```

## Request Parameters

| Field | Type | Required | Description |
|---|---|---:|---|
| `pid` | int | ✅ | Merchant PID, should match configured `epay_pid` |
| `type` | string | ✅ | Payment type label used by EPay clients, current callback uses `alipay` |
| `out_trade_no` | string | ✅ | Merchant order ID |
| `notify_url` | string | ✅ | Async callback URL |
| `return_url` | string | ❌ | Browser return URL |
| `name` | string | ❌ | Product name |
| `money` | string | ✅ | Order amount |
| `sign` | string | ✅ | MD5 signature |
| `sign_type` | string | ✅ | Signature type, use `MD5` |

::: warning
Current router code reads `money`, `name`, `notify_url`, `out_trade_no`, `return_url`, and `sign` from the query string, then internally forces `currency=cny`, `token=usdt`, and `network=tron` before creating the order.
:::

## Signature Rules

EPay-compatible signing still follows the same MD5 parameter-sorting algorithm.

1. Keep all non-empty parameters except `sign` or `signature`
2. Sort parameter names in ASCII ascending order
3. Join as `key=value&key=value`
4. Append the signing key directly to the end
5. Compute lowercase MD5

### Current Source Notes

- Incoming create-order request: current router code signs `money + name + notify_url + out_trade_no + pid + return_url` with `api_auth_token`
- Outbound EPay callback: current worker signs EPay callback fields with `epay_key`

### Example String

```text
money=100&name=VIP Order&notify_url=https://merchant.example.com/notify&out_trade_no=ORDER_10003&pid=1001&return_url=https://merchant.example.com/returnYOUR_SIGN_KEY
```

::: code-group

```php [PHP]
<?php
function epaySign(array $params, string $signKey): string {
    ksort($params);
    $parts = [];
    foreach ($params as $key => $value) {
        if ($value === '' || $value === null || in_array($key, ['sign', 'signature'], true)) {
            continue;
        }
        $parts[] = $key . '=' . $value;
    }
    return md5(implode('&', $parts) . $signKey);
}
```

```python [Python]
import hashlib


def epay_sign(params: dict, sign_key: str) -> str:
    filtered = {
        k: v for k, v in params.items()
        if v not in ('', None) and k not in ('sign', 'signature')
    }
    raw = '&'.join(f"{k}={v}" for k, v in sorted(filtered.items()))
    return hashlib.md5((raw + sign_key).encode()).hexdigest()
```

:::

## Callback

Current source sends outbound EPay-format callbacks when `payment_type = epay`.

### Callback Fields

| Field | Type | Description |
|---|---|---|
| `pid` | int | Merchant PID |
| `trade_no` | string | Platform trade ID |
| `out_trade_no` | string | Merchant order ID |
| `type` | string | Payment type, current source uses `alipay` |
| `name` | string | Product name |
| `money` | string | Order amount with 4 decimals |
| `trade_status` | string | Current source uses `TRADE_SUCCESS` |
| `sign` | string | MD5 signature |
| `sign_type` | string | `MD5` |

Verify the callback signature with `epay_key`, then return exact plain text `ok` with HTTP 200.

## Code Example

::: code-group

```php [PHP]
<?php
$baseUrl = 'https://pay.example.com/payments/epay/v1/order/create-transaction/submit.php';
$pid = 1001;
$apiAuthToken = 'your-api-auth-token'; // Current source uses this for inbound request verification
$epayKey = 'your-epay-key'; // Current source uses this for outbound callback verification

function epaySign(array $params, string $signKey): string {
    ksort($params);
    $parts = [];
    foreach ($params as $key => $value) {
        if ($value === '' || $value === null || in_array($key, ['sign', 'signature'], true)) continue;
        $parts[] = $key . '=' . $value;
    }
    return md5(implode('&', $parts) . $signKey);
}

$query = [
    'pid' => $pid,
    'type' => 'alipay',
    'out_trade_no' => 'ORDER_10003',
    'notify_url' => 'https://merchant.example.com/notify',
    'return_url' => 'https://merchant.example.com/return',
    'name' => 'VIP Order',
    'money' => '100',
    'sign_type' => 'MD5',
];
$query['sign'] = epaySign($query, $apiAuthToken);

$redirectUrl = $baseUrl . '?' . http_build_query($query);
header('Location: ' . $redirectUrl);
exit;

// EPay callback example
$callback = $_POST;
if (($callback['sign'] ?? '') !== epaySign($callback, $epayKey)) {
    http_response_code(400);
    exit('invalid sign');
}

// Mark your business order as paid here
http_response_code(200);
echo 'ok';
```

```python [Python]
import hashlib
from flask import Flask, redirect, request
from urllib.parse import urlencode

BASE_URL = 'https://pay.example.com/payments/epay/v1/order/create-transaction/submit.php'
PID = 1001
API_AUTH_TOKEN = 'your-api-auth-token'  # Current source uses this for inbound request verification
EPAY_KEY = 'your-epay-key'  # Current source uses this for outbound callback verification


def epay_sign(params: dict, sign_key: str) -> str:
    filtered = {
        k: v for k, v in params.items()
        if v not in ('', None) and k not in ('sign', 'signature')
    }
    raw = '&'.join(f"{k}={v}" for k, v in sorted(filtered.items()))
    return hashlib.md5((raw + sign_key).encode()).hexdigest()


app = Flask(__name__)


@app.get('/create-epay-order')
def create_epay_order():
    query = {
        'pid': PID,
        'type': 'alipay',
        'out_trade_no': 'ORDER_10003',
        'notify_url': 'https://merchant.example.com/notify',
        'return_url': 'https://merchant.example.com/return',
        'name': 'VIP Order',
        'money': '100',
        'sign_type': 'MD5',
    }
    query['sign'] = epay_sign(query, API_AUTH_TOKEN)
    return redirect(f"{BASE_URL}?{urlencode(query)}")


@app.post('/notify')
def notify():
    data = request.form.to_dict()
    if data.get('sign') != epay_sign(data, EPAY_KEY):
        return 'invalid sign', 400

    # Mark your business order as paid here
    return 'ok', 200
```

:::

## See Also

- [/api/reference](/api/reference)
- [/api/payment](/api/payment)
