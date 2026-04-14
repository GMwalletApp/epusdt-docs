# Epusdt 接入（旧版兼容）

当你需要兼容旧版 Epusdt 插件行为时，使用这个路由。

::: tip
接口地址：`POST /payments/epusdt/v1/order/create-transaction`
:::

## 配置说明

在 `.env` 中配置 `api_auth_token`。它同时用于请求签名和异步回调验签。

```dotenv
api_auth_token=your-secret-token
```

::: info
当前源码会保留与旧版 `POST /api/v1/order/create-transaction` 一致的兼容行为。如果你不传 `currency`、`token`、`network`，包装路由会自动补：

- `currency = cny`
- `token = usdt`
- `network = tron`
:::

## 签名算法

签名规则与旧版 API 一致。

1. 保留所有非空参数，排除 `signature`
2. 按参数名 ASCII 升序排序
3. 按 `key=value&key=value` 形式拼接
4. 在末尾直接拼接 `api_auth_token`
5. 计算小写 MD5

### 示例

假设参数如下：

```text
order_id=20220201030210321
amount=42
notify_url=http://example.com/notify
redirect_url=http://example.com/redirect
```

Token：

```text
api_auth_token=epusdt_password_xasddawqe
```

待签名字符串：

```text
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirectepusdt_password_xasddawqe
```

签名结果：

```text
1cd4b52df5587cfb1968b0c0c6e156cd
```

::: code-group

```php [PHP]
<?php
function epusdtSign(array $params, string $token): string {
    ksort($params);
    $parts = [];
    foreach ($params as $key => $value) {
        if ($value === '' || $value === null || $key === 'signature') {
            continue;
        }
        $parts[] = $key . '=' . $value;
    }
    return md5(implode('&', $parts) . $token);
}
```

```python [Python]
import hashlib


def epusdt_sign(params: dict, token: str) -> str:
    filtered = {
        k: v for k, v in params.items()
        if v not in ('', None) and k != 'signature'
    }
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

## 创建订单

### 请求

```http
POST /payments/epusdt/v1/order/create-transaction
Content-Type: application/json
```

```json
{
  "order_id": "2022123321312321321",
  "amount": 100,
  "notify_url": "https://merchant.example.com/notify",
  "redirect_url": "https://merchant.example.com/return",
  "signature": "1cd4b52df5587cfb1968b0c0c6e156cd"
}
```

### 请求字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `order_id` | string | ✅ | 商户订单号，最长 32 字符 |
| `amount` | float | ✅ | 法币金额，必须大于 `0.01` |
| `notify_url` | string | ✅ | 异步回调地址 |
| `redirect_url` | string | ❌ | 支付成功后的浏览器跳转地址 |
| `signature` | string | ✅ | MD5 签名 |

::: warning
当前源码会在兼容包装层补默认值之前先验签。如果你省略了 `currency`、`token`、`network`，就只对你实际发送的字段做签名。
:::

### 响应

```json
{
  "status_code": 200,
  "message": "success",
  "data": {
    "trade_id": "202203271648380592218340",
    "order_id": "2022123321312321321",
    "amount": 100,
    "currency": "CNY",
    "actual_amount": 14.28,
    "receive_address": "TNEns8t9jbWENbStkQdVQtHMGpbsYsQjZK",
    "token": "USDT",
    "expiration_time": 1712500000,
    "payment_url": "https://pay.example.com/pay/checkout-counter/202203271648380592218340"
  },
  "request_id": "b1344d70-ff19-4543-b601-37abfb3b3686"
}
```

### 响应字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `trade_id` | string | Epusdt 交易号 |
| `order_id` | string | 你的原始订单号 |
| `amount` | float | 原始法币金额 |
| `currency` | string | 法币币种 |
| `actual_amount` | float | 用户实际需要支付的代币金额 |
| `receive_address` | string | 收款地址 |
| `token` | string | 代币符号 |
| `expiration_time` | int | 过期时间，Unix 秒级时间戳 |
| `payment_url` | string | 托管收银台地址 |

## 异步回调处理

支付成功后，Epusdt 会向你的 `notify_url` 发送 HTTP POST。

```json
{
  "trade_id": "202203251648208648961728",
  "order_id": "2022123321312321321",
  "amount": 100,
  "actual_amount": 15.625,
  "receive_address": "TNEns8t9jbWENbStkQdVQtHMGpbsYsQjZK",
  "token": "USDT",
  "block_transaction_id": "123333333321232132131",
  "signature": "xsadaxsaxsa",
  "status": 2
}
```

### 回调字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `trade_id` | string | Epusdt 交易号 |
| `order_id` | string | 你的业务订单号 |
| `amount` | float | 原始法币金额 |
| `actual_amount` | float | 实际到账代币金额 |
| `receive_address` | string | 收款地址 |
| `token` | string | 代币符号 |
| `block_transaction_id` | string | 链上交易 ID |
| `status` | int | `1` 待支付，`2` 已支付，`3` 已过期 |
| `signature` | string | MD5 签名 |

### 验签规则

使用相同的 MD5 签名步骤和 `api_auth_token` 验证回调，然后再更新你的业务订单。

::: warning
处理成功后必须返回 HTTP 200，且响应体精确为纯文本 `ok`。返回其他内容会被视为回调失败。
:::

## 完整代码示例

::: code-group

```php [PHP]
<?php
$apiUrl = 'https://pay.example.com/payments/epusdt/v1/order/create-transaction';
$token = 'your-api-auth-token';

function epusdtSign(array $params, string $token): string {
    ksort($params);
    $parts = [];
    foreach ($params as $key => $value) {
        if ($value === '' || $value === null || $key === 'signature') continue;
        $parts[] = $key . '=' . $value;
    }
    return md5(implode('&', $parts) . $token);
}

$params = [
    'order_id' => 'ORDER_10001',
    'amount' => 100,
    'notify_url' => 'https://merchant.example.com/notify',
    'redirect_url' => 'https://merchant.example.com/return',
];
$params['signature'] = epusdtSign($params, $token);

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

// 回调处理示例
$callback = json_decode(file_get_contents('php://input'), true);
$localSign = epusdtSign($callback, $token);
if (($callback['signature'] ?? '') !== $localSign) {
    http_response_code(400);
    exit('invalid sign');
}

// 在这里更新你的业务订单状态
http_response_code(200);
echo 'ok';
```

```python [Python]
import hashlib
import requests
from flask import Flask, request

API_URL = 'https://pay.example.com/payments/epusdt/v1/order/create-transaction'
API_TOKEN = 'your-api-auth-token'


def epusdt_sign(params: dict, token: str) -> str:
    filtered = {
        k: v for k, v in params.items()
        if v not in ('', None) and k != 'signature'
    }
    raw = '&'.join(f"{k}={v}" for k, v in sorted(filtered.items()))
    return hashlib.md5((raw + token).encode()).hexdigest()


payload = {
    'order_id': 'ORDER_10001',
    'amount': 100,
    'notify_url': 'https://merchant.example.com/notify',
    'redirect_url': 'https://merchant.example.com/return',
}
payload['signature'] = epusdt_sign(payload, API_TOKEN)
response = requests.post(API_URL, json=payload, timeout=15)
print(response.json())

app = Flask(__name__)


@app.post('/notify')
def notify():
    data = request.get_json(force=True)
    if data.get('signature') != epusdt_sign(data, API_TOKEN):
        return 'invalid sign', 400

    # 在这里更新你的业务订单状态
    return 'ok', 200
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

const apiURL = "https://pay.example.com/payments/epusdt/v1/order/create-transaction"
const apiToken = "your-api-auth-token"

func epusdtSign(params map[string]string, token string) string {
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
        "order_id":     "ORDER_10001",
        "amount":       "100",
        "notify_url":   "https://merchant.example.com/notify",
        "redirect_url": "https://merchant.example.com/return",
    }
    payload["signature"] = epusdtSign(payload, apiToken)

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

## 参见

- [/zh/api/reference](/zh/api/reference)
- [/zh/api/payment](/zh/api/payment)
