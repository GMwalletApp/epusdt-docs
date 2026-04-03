# 旧版接口

::: warning 已废弃
本页中的旧版 API 接口已被**废弃**，目前仅为兼容旧系统而保留。新接入请优先使用 [支付接口](/zh/api/payment)。
:::

## 概览

Epusdt 早期接口使用 `/api/v1/` 作为路径前缀。现在这些接口仍然可以通过兼容层继续使用，但功能比新的 `/payments/epusdt/v1/` 接口更少。

**主要区别如下：**

| 功能 | 旧版接口 | 新版接口 |
|------|----------|----------|
| 路径前缀 | `/api/v1/` | `/payments/epusdt/v1/` |
| 法币选择 | 固定为 CNY | 可通过 `currency` 指定 |
| 币种选择 | 固定为 USDT | 可通过 `token` 指定 |
| 网络选择 | 固定为 TRON | 可通过 `network` 指定 |
| 后续功能更新 | 不再新增 | 持续维护 |

## 创建交易（旧版）

```
POST /api/v1/order/create-transaction
```

这个接口会使用以下默认值创建订单：

- `currency` = `cny`
- `token` = `usdt`
- `network` = `TRON`

### 请求参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `order_id` | string | ✅ | 你的业务订单号 |
| `amount` | float | ✅ | CNY 金额 |
| `notify_url` | string | ✅ | 支付成功异步通知地址 |
| `redirect_url` | string | ❌ | 支付完成后跳转地址 |
| `signature` | string | ✅ | HMAC-SHA256 签名 |

签名算法与新版接口完全一致，详见 [签名生成](/zh/api/payment#签名生成)。

### 响应示例

响应结构与新版接口保持一致：

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

### 回调说明

回调机制与新版接口相同，详见 [回调 / Webhook](/zh/api/payment#回调--webhook)。

## 汇率接口 {#exchange-rate}

获取当前 Epusdt 使用的 USDT/CNY 汇率。

```
GET /api/v1/rate
```

### 响应示例

```json
{
  "status": 1,
  "message": "ok",
  "data": {
    "rate": "7.12"
  }
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `rate` | string | 当前 USDT 对 CNY 汇率 |

### 调用示例

::: code-group

```bash [cURL]
curl -X GET https://pay.example.com/api/v1/rate
```

```python [Python]
import requests

response = requests.get("https://pay.example.com/api/v1/rate")
data = response.json()

if data["status"] == 1:
    rate = float(data["data"]["rate"])
    print(f"当前 USDT/CNY 汇率: {rate}")
    usdt_amount = 100 / rate
    print(f"100 CNY ≈ {usdt_amount:.4f} USDT")
```

```javascript [Node.js]
const response = await fetch("https://pay.example.com/api/v1/rate");
const data = await response.json();

if (data.status === 1) {
  const rate = parseFloat(data.data.rate);
  console.log(`当前 USDT/CNY 汇率: ${rate}`);
  const usdtAmount = (100 / rate).toFixed(4);
  console.log(`100 CNY ≈ ${usdtAmount} USDT`);
}
```

:::

::: tip
该汇率会被 Epusdt 用于将法币金额换算成 USDT 金额。你可以在前端或订单确认页中调用此接口，向用户展示预估的 USDT 支付金额。
:::

## 迁移指南

从旧版接口迁移到新版接口非常直接，整体流程和签名算法都不需要大改。

### 第 1 步：修改接口地址

将调用地址从：

```
POST /api/v1/order/create-transaction
```

改为：

```
POST /payments/epusdt/v1/order/create-transaction
```

### 第 2 步：按需增加可选字段

新版接口支持更多可选字段。你可以根据需要添加，也可以省略以沿用默认值：

```json
{
  "order_id": "ORDER_001",
  "amount": 100.00,
  "notify_url": "https://example.com/callback",
  "redirect_url": "https://example.com/success",
  "currency": "cny",
  "token": "usdt",
  "network": "TRON",
  "signature": "..."
}
```

如果省略 `currency`、`token`、`network`，它们的默认值仍然分别是 `cny`、`usdt`、`TRON`，与旧版接口一致。

### 第 3 步：验证迁移结果

1. 先在测试环境调用新版接口
2. 检查签名是否正确
3. 确认异步回调仍然能正常接收和处理
4. 再切换生产流量到新版路径

### 快速对比

```diff
- POST /api/v1/order/create-transaction
+ POST /payments/epusdt/v1/order/create-transaction

  {
    "order_id": "ORDER_001",
    "amount": 100.00,
    "notify_url": "https://example.com/callback",
+   "currency": "cny",      // 可选，默认 cny
+   "token": "usdt",        // 可选，默认 usdt
+   "network": "TRON",      // 可选，默认 TRON
    "signature": "..."
  }
```

::: info
旧版接口与新版接口的回调格式、验签方式保持一致，因此你的回调处理逻辑通常无需改动。
:::
