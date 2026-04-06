# 支付接口

本页说明当前版本的支付接入流程：创建订单、跳转收银台、处理回调，以及查询订单状态。

## 创建交易

创建新的支付订单。Epusdt 会在订单有效期内锁定一个收款地址和应付金额。

**当前线上接口：**

```
POST /payments/epusdt/v1/order/create-transaction
```

**同时可用：**

```
POST /payments/gmpay/v1/order/create-transaction
```

::: tip
当前源码中的真实 API 前缀是 `/payments/...`。旧文档中的 `/api/v1/order/create-transaction` 属于历史路径，不是当前注册路由。
:::

### 请求参数

创建订单接口请求方式：

- `POST`
- `application/json`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `order_id` | string | ✅ | 业务订单号，最长 32 个字符 |
| `amount` | float | ✅ | 法币金额，必须大于 `0.01` |
| `notify_url` | string | ✅ | 异步通知地址，支付成功后会向此地址发起 POST |
| `redirect_url` | string | ❌ | 用户支付成功后的跳转地址 |
| `currency` | string | ✅* | 法币币种 |
| `token` | string | ✅* | 支付币种 |
| `network` | string | ✅* | 区块链网络 |
| `signature` | string | ✅ | MD5 签名 |

`*` 共享请求校验器要求 `currency`、`token`、`network` 必填。但当前 `/payments/epusdt/v1/...` 路由会在缺省时自动补默认值：

- `currency = cny`
- `token = usdt`
- `network = TRON`

而 `/payments/gmpay/v1/...` 路由**不会**补这些默认值。

### 签名生成

`signature` 生成规则：

1. 收集所有非空参数，排除 `signature`
2. 按参数名 ASCII 升序排序
3. 拼成 `key=value&key=value`
4. 直接在末尾追加 `api_auth_token`
5. 计算小写 MD5

#### 示例

已知：

```
order_id = "20220201030210321"
amount = 42
notify_url = "http://example.com/notify"
redirect_url = "http://example.com/redirect"
```

Token：

```
api_auth_token = "epusdt_password_xasddawqe"
```

排序后字符串：

```
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirect
```

末尾追加 Token：

```
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirectepusdt_password_xasddawqe
```

MD5：

```
1cd4b52df5587cfb1968b0c0c6e156cd
```

#### 代码示例

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

### 响应示例

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

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `trade_id` | string | Epusdt 内部交易号 |
| `order_id` | string | 你的业务订单号 |
| `amount` | float | 原始法币金额 |
| `currency` | string | 法币币种 |
| `actual_amount` | float | 用户实际需要支付的代币金额 |
| `receive_address` | string | 收款地址 |
| `token` | string | 代币符号，例如 `usdt` |
| `expiration_time` | int | 过期时间，Unix 秒级时间戳 |
| `payment_url` | string | 托管收银台地址 |

当前创建订单响应中**不包含** `network` 字段。

## 支付流程

```
1. 你的服务端调用创建交易接口
2. Epusdt 返回 `trade_id`、`receive_address`、`payment_url`
3. 将用户跳转到 `payment_url`，或自行展示地址 / 二维码
4. 用户向 `receive_address` 转账
5. Epusdt 监听到链上到账
6. Epusdt 向 `notify_url` 发起 POST 回调
7. 你的服务端验签并返回精确的 `ok`
8. 如果配置了 `redirect_url`，托管收银台会在支付成功后跳转
```

## 收银台页面

托管收银台路由：

```
GET /pay/checkout-counter/:trade_id
```

示例：

```
https://pay.example.com/pay/checkout-counter/EP20240101XXXXXXXX
```

## 查询订单状态

状态轮询路由：

```
GET /pay/check-status/:trade_id
```

示例：

```
GET https://pay.example.com/pay/check-status/EP20240101XXXXXXXX
```

响应示例：

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

### 订单状态值

| 状态值 | 含义 |
|--------|------|
| `1` | 等待支付 |
| `2` | 支付成功 |
| `3` | 已过期 |

## 回调 / Webhook

当链上确认支付成功后，Epusdt 会向创建订单时传入的 `notify_url` 发起 POST 请求。

回调体使用与创建订单相同的 MD5 算法和 `api_auth_token` 进行签名。

### 回调数据格式

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

### 回调字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `trade_id` | string | Epusdt 内部交易号 |
| `order_id` | string | 你的业务订单号 |
| `amount` | float | 原始法币金额 |
| `actual_amount` | float | 实际到账代币金额 |
| `receive_address` | string | 收款地址 |
| `token` | string | 代币符号 |
| `block_transaction_id` | string | 链上交易 ID |
| `status` | int | 订单状态，`2` 表示已支付 |
| `signature` | string | 用于验签的 MD5 签名 |

当前回调体中**不包含** `network` 字段。

### 如何校验回调签名

规则与创建订单签名完全一致：

1. 保留所有非空字段，排除 `signature`
2. 按 key 排序
3. 拼成 `key=value&key=value`
4. 末尾追加 `api_auth_token`
5. 计算小写 MD5 后比对

### 回调响应要求

::: danger 重要
你的服务端**必须**返回 **HTTP 200**，且响应体必须是精确的纯文本 `ok`。

当前源码中的重试行为由配置决定，不是固定写死的重试次数：

- `order_notice_max_retry`：首次尝试之后允许的最大重试次数
- `callback_retry_base_seconds`：指数退避的基础秒数

`.env.example` 默认值为：

- `order_notice_max_retry=0`
- `callback_retry_base_seconds=5`

所以在默认配置下，会执行第一次回调；如果失败，不会继续额外重试。
:::

## 完整接入示例

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
        print(f"USDT 金额:     {data['actual_amount']}")
        print(f"收款地址:      {data['receive_address']}")
        print(f"收银台链接:    {data['payment_url']}")
        return data
    else:
        print(f"错误: {result['message']}")
        return None

create_order("ORDER_001", 100.00, "https://example.com/callback")
```

## 错误处理建议

| 状态码 | 消息 | 处理建议 |
|--------|------|----------|
| `400` | system / validation error | 检查请求体和必填字段 |
| `401` | `signature verification failed` | 检查签名逻辑与 `api_auth_token` |
| `10002` | `order already exists` | 使用未重复的 `order_id` |
| `10003` | `no available wallet address` | 增加更多钱包地址 |
| `10004` | `invalid payment amount` | 检查金额限制和最小值 |
| `10005` | `no available amount channel` | 更换金额重试，或检查金额通道分配 |
| `10008` | `order does not exist` | 检查查询的 `trade_id` 是否正确 |
