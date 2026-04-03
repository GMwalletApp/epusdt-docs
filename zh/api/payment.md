# 支付接口

本页说明完整的支付接入流程：创建订单、跳转收银台、处理回调以及查询订单状态。

## 创建交易

创建一个新的支付订单。Epusdt 会为该订单锁定一个钱包地址和应付金额。

**接口地址：**

```
POST /payments/epusdt/v1/order/create-transaction
```

同时也支持以下别名路径：

```
POST /payments/gmpay/v1/order/create-transaction
```

### 请求参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `order_id` | string | ✅ | 你的业务订单号，必须唯一，不能重复使用 |
| `amount` | float | ✅ | 法币金额，默认按 CNY 处理 |
| `notify_url` | string | ✅ | 支付成功后的异步通知地址 |
| `redirect_url` | string | ❌ | 支付完成后用户跳转地址 |
| `currency` | string | ❌ | 法币币种，默认：`cny` |
| `token` | string | ❌ | 支付币种，默认：`usdt` |
| `network` | string | ❌ | 区块链网络，默认：`TRON` |
| `signature` | string | ✅ | HMAC-SHA256 签名，见下文 |

### 签名生成

`signature` 用于保证请求未被篡改，生成方式如下：

1. 收集所有请求参数，**不要包含** `signature` 本身
2. 按参数名的字母顺序升序排序
3. 组成 `key=value&key=value` 形式的查询字符串
4. 使用你的 **app secret key** 作为密钥，计算 HMAC-SHA256
5. 将结果转为十六进制字符串，即为 `signature`

#### 示例

假设请求参数如下：

```
order_id = "ORDER_20240101_001"
amount = 100.00
notify_url = "https://example.com/callback"
redirect_url = "https://example.com/success"
```

**第 1 步：按字母排序后顺序为：**

```
amount, notify_url, order_id, redirect_url
```

**第 2 步：拼接查询字符串：**

```
amount=100.00&notify_url=https://example.com/callback&order_id=ORDER_20240101_001&redirect_url=https://example.com/success
```

**第 3 步：使用 app secret 计算 HMAC-SHA256：**

```
signature = HMAC-SHA256(query_string, your_app_secret)
```

#### 代码示例

::: code-group

```python [Python]
import hmac
import hashlib
from urllib.parse import urlencode

def generate_signature(params: dict, secret: str) -> str:
    """为 Epusdt API 生成 HMAC-SHA256 签名"""
    filtered = {k: v for k, v in params.items() if k != "signature"}
    sorted_params = sorted(filtered.items())
    query_string = urlencode(sorted_params)
    return hmac.new(
        secret.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

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
  const filtered = Object.entries(params)
    .filter(([key]) => key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b));

  const queryString = filtered
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHmac("sha256", secret)
    .update(queryString)
    .digest("hex");
}

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
    unset($params['signature']);
    ksort($params);
    $queryString = http_build_query($params);
    return hash_hmac('sha256', $queryString, $secret);
}

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
	keys := make([]string, 0, len(params))
	for k := range params {
		if k != "signature" {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)

	values := url.Values{}
	for _, k := range keys {
		values.Set(k, params[k])
	}
	queryString := values.Encode()

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

### 响应示例

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

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `trade_id` | string | Epusdt 内部交易号 |
| `order_id` | string | 你的业务订单号 |
| `amount` | float | 原始法币金额 |
| `actual_amount` | float | 用户实际需要支付的 USDT 金额 |
| `token` | string | 币种，例如 `usdt` |
| `network` | string | 区块链网络，例如 `TRON` |
| `receive_address` | string | 用户付款使用的钱包地址 |
| `expiration_time` | int | 订单过期时间，单位：分钟 |
| `checkout_url` | string | 托管收银台页面地址 |

## 支付流程

创建交易后，推荐按以下流程接入：

```
1. 你的服务端调用创建交易接口
2. Epusdt 返回 trade_id、receive_address、checkout_url
3. 将用户跳转到 checkout_url（或者你自行展示地址与二维码）
4. 用户向 receive_address 转入 USDT
5. Epusdt 监听到链上到账
6. Epusdt 向 notify_url 发起 POST 回调
7. 你的服务端验签并返回 "ok"
8. （可选）用户跳转到 redirect_url
```

## 收银台页面

你可以将用户直接跳转到 Epusdt 托管的支付页面：

```
GET /pay/checkout-counter/:trade_id
```

**示例：**

```
https://pay.example.com/pay/checkout-counter/EP20240101XXXXXXXX
```

收银台页面通常包含：
- 需要支付的 USDT 金额
- 收款地址（支持复制）
- 钱包扫码二维码
- 倒计时
- 实时支付状态

## 查询订单状态

查询某个订单当前的支付状态：

```
GET /pay/check-status/:trade_id
```

**示例：**

```
GET https://pay.example.com/pay/check-status/EP20240101XXXXXXXX
```

**响应示例：**

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

### 订单状态值

| 状态值 | 含义 |
|--------|------|
| `1` | 等待支付 |
| `2` | 已确认支付成功 |
| `3` | 订单已过期 |

## 回调 / Webhook

当链上确认支付成功后，Epusdt 会向你创建订单时提供的 `notify_url` 发起一个 POST 请求。

### 回调数据格式

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

### 回调字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `trade_id` | string | Epusdt 内部交易号 |
| `order_id` | string | 你的业务订单号 |
| `amount` | float | 原始法币金额 |
| `actual_amount` | float | 实际支付的 USDT 金额 |
| `token` | string | 支付币种 |
| `network` | string | 区块链网络 |
| `status` | int | 订单状态，`2` 表示已支付 |
| `signature` | string | HMAC-SHA256 签名，用于验签 |

### 如何校验回调签名

务必对回调中的 `signature` 进行验证，确保请求确实来自你的 Epusdt 服务：

1. 取回调中的全部字段，**不要包含** `signature`
2. 按字段名升序排序
3. 拼接成查询字符串
4. 使用 app secret 计算 HMAC-SHA256
5. 与回调中的 `signature` 做比对

验签逻辑与前面介绍的 [签名生成](#签名生成) 完全一致。

### 回调响应要求

::: danger 重要
你的服务端**必须**返回纯文本 `ok`（HTTP 200）作为回调成功确认。

如果 Epusdt 没有收到精确的 `ok` 响应，它会持续重试回调，直到：
- 你的服务端返回 `ok`
- 或者超过 `.env` 中配置的 `callback_timeout`
:::

**回调处理示例：**

::: code-group

```python [Python / Flask]
from flask import Flask, request

app = Flask(__name__)

@app.route("/callback", methods=["POST"])
def payment_callback():
    data = request.json

    # 1. 验签
    expected_sig = generate_signature(data, "your_app_secret_key")
    if data.get("signature") != expected_sig:
        return "signature mismatch", 400

    # 2. 处理支付成功
    if data.get("status") == 2:
        order_id = data["order_id"]
        # 在你的数据库中将订单标记为已支付
        mark_order_paid(order_id)

    # 3. 必须返回 ok
    return "ok"
```

```javascript [Node.js / Express]
const express = require("express");
const app = express();
app.use(express.json());

app.post("/callback", (req, res) => {
  const data = req.body;

  // 1. 验签
  const expectedSig = generateSignature(data, "your_app_secret_key");
  if (data.signature !== expectedSig) {
    return res.status(400).send("signature mismatch");
  }

  // 2. 处理支付成功
  if (data.status === 2) {
    const orderId = data.order_id;
    // 在你的数据库中将订单标记为已支付
    markOrderPaid(orderId);
  }

  // 3. 必须返回 ok
  res.send("ok");
});
```

```php [PHP]
<?php
$data = json_decode(file_get_contents('php://input'), true);

$expectedSig = generateSignature($data, 'your_app_secret_key');
if ($data['signature'] !== $expectedSig) {
    http_response_code(400);
    echo 'signature mismatch';
    exit;
}

if ($data['status'] == 2) {
    $orderId = $data['order_id'];
    // 在你的数据库中将订单标记为已支付
    markOrderPaid($orderId);
}

echo 'ok';
```

:::

## 完整接入示例

下面是一个完整的 Python 示例，演示如何创建订单：

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
        print(f"USDT 金额:     {data['actual_amount']}")
        print(f"收款地址:      {data['receive_address']}")
        print(f"收银台链接:    {data['checkout_url']}")
        return data
    else:
        print(f"错误: {result['message']}")
        return None

create_order("ORDER_001", 100.00, "https://example.com/callback")
```

## 错误处理建议

| 状态码 | 常见消息 | 处理建议 |
|--------|----------|----------|
| `400` | `invalid params` | 检查必填字段和数据类型 |
| `401` | `unauthorized` | 检查 API Token 是否正确 |
| `10003` | `duplicate order` | 使用未重复的 `order_id` |
| `10004` | `amount out of range` | 检查金额是否超出配置限制 |
| `10005` | `no available address` | 添加更多钱包地址 |
| `10008` | `signature failed` | 检查签名逻辑与密钥是否正确 |
