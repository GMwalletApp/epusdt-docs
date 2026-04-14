# EPay 兼容接入（跳转式）

如果你需要 EPay 风格的跳转式支付流程，可以使用这个兼容入口。

::: tip
接口地址：`GET /payments/epay/v1/order/create-transaction/submit.php`
:::

## 配置说明

当前 `.env.example` 中包含以下 EPay 相关配置：

```dotenv
epay_pid=
epay_key=
```

::: info
当前源码会在 EPay 兼容参数中使用 `epay_pid`，并在 EPay 格式回调时使用 `epay_key` 进行签名。

但对于 `/payments/epay/v1/order/create-transaction/submit.php` 这个入站创建订单请求，当前路由代码实际使用 `api_auth_token` 来校验 `sign`。
:::

## 接入方式说明

这是浏览器跳转模式。你需要先拼接 GET 请求 URL，然后把用户重定向到这个地址。

```text
GET /payments/epay/v1/order/create-transaction/submit.php?pid=1001&type=alipay&out_trade_no=ORDER_10003&notify_url=https%3A%2F%2Fmerchant.example.com%2Fnotify&return_url=https%3A%2F%2Fmerchant.example.com%2Freturn&name=VIP%20Order&money=100&sign=xxxx&sign_type=MD5
```

Epusdt 创建订单后，当前源码会把浏览器继续跳转到托管收银台：

```text
/pay/checkout-counter/{trade_id}
```

## 请求参数

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `pid` | int | ✅ | 商户 PID，应与配置的 `epay_pid` 一致 |
| `type` | string | ✅ | EPay 客户端使用的支付类型标识，当前回调使用 `alipay` |
| `out_trade_no` | string | ✅ | 商户订单号 |
| `notify_url` | string | ✅ | 异步回调地址 |
| `return_url` | string | ❌ | 浏览器返回地址 |
| `name` | string | ❌ | 商品名称 |
| `money` | string | ✅ | 订单金额 |
| `sign` | string | ✅ | MD5 签名 |
| `sign_type` | string | ✅ | 签名类型，使用 `MD5` |

::: warning
当前路由代码从查询参数中读取 `money`、`name`、`notify_url`、`out_trade_no`、`return_url` 和 `sign`，然后在内部强制使用 `currency=cny`、`token=usdt`、`network=tron` 创建订单。
:::

## 签名规则

EPay 兼容签名依然使用相同的 MD5 排序规则。

1. 保留所有非空参数，排除 `sign` 或 `signature`
2. 按参数名 ASCII 升序排序
3. 按 `key=value&key=value` 形式拼接
4. 在末尾直接拼接签名密钥
5. 计算小写 MD5

### 当前源码说明

- 入站创建订单请求：当前路由代码使用 `money + name + notify_url + out_trade_no + pid + return_url` 配合 `api_auth_token` 计算签名
- 出站 EPay 回调：当前 worker 使用 `epay_key` 对 EPay 回调字段签名

### 示例字符串

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

## 回调说明

当 `payment_type = epay` 时，当前源码会发送 EPay 格式的异步回调。

### 回调字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `pid` | int | 商户 PID |
| `trade_no` | string | 平台交易号 |
| `out_trade_no` | string | 商户订单号 |
| `type` | string | 支付类型，当前源码使用 `alipay` |
| `name` | string | 商品名称 |
| `money` | string | 保留 4 位小数的订单金额 |
| `trade_status` | string | 当前源码使用 `TRADE_SUCCESS` |
| `sign` | string | MD5 签名 |
| `sign_type` | string | `MD5` |

使用 `epay_key` 校验回调签名，处理成功后返回 HTTP 200 且响应体精确为纯文本 `ok`。

## 代码示例

::: code-group

```php [PHP]
<?php
$baseUrl = 'https://pay.example.com/payments/epay/v1/order/create-transaction/submit.php';
$pid = 1001;
$apiAuthToken = 'your-api-auth-token'; // 当前源码入站请求验签实际使用这个
$epayKey = 'your-epay-key'; // 当前源码出站回调验签使用这个

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

// EPay 回调处理示例
$callback = $_POST;
if (($callback['sign'] ?? '') !== epaySign($callback, $epayKey)) {
    http_response_code(400);
    exit('invalid sign');
}

// 在这里更新你的业务订单状态
http_response_code(200);
echo 'ok';
```

```python [Python]
import hashlib
from flask import Flask, redirect, request
from urllib.parse import urlencode

BASE_URL = 'https://pay.example.com/payments/epay/v1/order/create-transaction/submit.php'
PID = 1001
API_AUTH_TOKEN = 'your-api-auth-token'  # 当前源码入站请求验签实际使用这个
EPAY_KEY = 'your-epay-key'  # 当前源码出站回调验签使用这个


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

    # 在这里更新你的业务订单状态
    return 'ok', 200
```

:::

## 参见

- [/zh/api/reference](/zh/api/reference)
- [/zh/api/payment](/zh/api/payment)
