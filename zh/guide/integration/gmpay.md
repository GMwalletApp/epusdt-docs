# GMPay 接入（推荐）

如果你要使用原生多网络 API，对接时推荐使用 GMPay 路由。

::: tip
接口地址：`POST /payments/gmpay/v1/order/create-transaction`
:::

## 配置说明

在 `.env` 中配置 `api_auth_token`。

```dotenv
api_auth_token=your-secret-token
```

::: info
与旧版兼容的 Epusdt 路由不同，GMPay 不会自动补默认值。你必须显式传 `currency`、`token`、`network`。
:::

## 支持的网络和币种

当前源码和已有文档对外暴露了这些组合：

| Network | Token |
|---|---|
| `tron` | `usdt` |
| `solana` | `usdt` |
| `solana` | `usdc` |
| `ethereum` | `usdt` |
| `ethereum` | `usdc` |

## 签名算法

签名规则和 Epusdt 一致。

1. 保留所有非空参数，排除 `signature`
2. 按参数名 ASCII 升序排序
3. 按 `key=value&key=value` 形式拼接
4. 末尾拼接 `api_auth_token`
5. 计算小写 MD5

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

## 创建订单

### 请求

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

### 请求字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `order_id` | string | ✅ | 商户订单号，最长 32 字符 |
| `currency` | string | ✅ | 法币币种，例如 `cny` |
| `token` | string | ✅ | 代币符号，例如 `usdt`、`usdc` |
| `network` | string | ✅ | 小写网络值：`tron`、`solana`、`ethereum` |
| `amount` | float | ✅ | 法币金额，必须大于 `0.01` |
| `notify_url` | string | ✅ | 异步回调地址 |
| `redirect_url` | string | ❌ | 支付成功后的浏览器跳转地址 |
| `signature` | string | ✅ | MD5 签名 |
| `name` | string | ❌ | 可选商品名称 |
| `payment_type` | string | ❌ | 可选来源标记 |

### 响应

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

::: warning
当前创建订单响应里不包含 `network`，即使请求里 `network` 是必填。
:::

## 网络切换子订单机制

托管收银台支持切换支付路线。

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

### 请求字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `trade_id` | string | ✅ | 父订单 trade_id |
| `token` | string | ✅ | 目标代币 |
| `network` | string | ✅ | 目标网络 |

### 机制说明

- 如果请求的 `token + network` 与父订单一致，源码直接返回当前收银台数据
- 如果该路线已经存在有效子订单，源码会直接复用
- 否则源码会创建新的子订单，并在目标网络上预留一个钱包地址
- 当前源码每个父订单最多允许 `2` 个有效子订单
- 某一条路线支付成功后，其它兄弟子订单会被置为过期并释放锁定

## 异步回调

回调处理方式与 Epusdt 一致。

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

使用相同的 MD5 规则和 `api_auth_token` 验签，处理成功后返回 HTTP 200 且响应体精确为 `ok`。

## 完整代码示例

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

## 参见

- [/zh/api/reference](/zh/api/reference)
- [/zh/api/payment](/zh/api/payment)
