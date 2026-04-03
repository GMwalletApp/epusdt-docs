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
| `signature` | string | ✅ | MD5 签名，见下文 |

### 签名生成

`signature` 用于保证请求未被篡改，生成规则如下：

1. 收集所有请求参数中**值不为空**的字段（`''` 和 `null` 不参与签名）
2. 排除 `signature` 字段本身
3. 按参数名的 ASCII 码升序排列（字典序）
4. 拼接成 `key=value&key=value` 格式的字符串
5. 将你的 `api_auth_token` **直接追加**到字符串末尾，**不加** `&` 或 `=`
6. 对完整字符串计算 **MD5** 哈希，转为**小写**即为 `signature`（32 位）

#### 示例

假设请求参数如下：

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

**第 1 步：按字母排序后顺序为：**

```
amount, notify_url, order_id, redirect_url
```

**第 2 步：拼接参数字符串：**

```
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirect
```

**第 3 步：在末尾直接追加 Token：**

```
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirectepusdt_password_xasddawqe
```

**第 4 步：计算小写 MD5：**

```
md5(上述字符串) = 1cd4b52df5587cfb1968b0c0c6e156cd
```

#### 签名规则

- 值为空的参数不参与签名
- `signature` 字段本身不参与签名
- MD5 结果必须为小写

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
| `signature` | string | MD5 签名，用于验签 |

### 如何校验回调签名

务必对回调中的 `signature` 进行验证，确保请求确实来自你的 Epusdt 服务：

1. 取回调中所有**值不为空**的字段，排除 `signature`
2. 按字段名 ASCII 码升序排列
3. 拼接成 `key=value&key=value` 格式的字符串
4. 在末尾直接追加 `api_auth_token`
5. 计算小写 **MD5**，与回调中的 `signature` 做比对

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
import hashlib

app = Flask(__name__)

def epusdt_sign(params: dict, token: str) -> str:
    filtered = {k: v for k, v in params.items() if v != '' and v is not None and k != 'signature'}
    sorted_str = '&'.join(f"{k}={v}" for k, v in sorted(filtered.items()))
    return hashlib.md5((sorted_str + token).encode()).hexdigest()

@app.route("/callback", methods=["POST"])
def payment_callback():
    data = request.json

    # 1. 验签
    expected_sig = epusdt_sign(data, "your_api_auth_token")
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

  // 1. 验签
  const expectedSig = epusdtSign(data, "your_api_auth_token");
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

$expectedSig = epusdtSign($data, 'your_api_auth_token');
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
