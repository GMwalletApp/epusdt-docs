# API 参考

本节说明当前源码中的 Epusdt HTTP API 基线，便于你按真实实现接入。

## 基础地址

所有接口都以你的 Epusdt 部署地址作为基础 URL，例如：

```text
http://your-server:8000
```

生产环境建议放到 HTTPS 反向代理之后：

```text
https://pay.example.com
```

## 鉴权与签名

当前源码的支付创建接口并没有单独实现 Bearer Token、查询参数 Token 或请求体 `token` 鉴权。

实际校验的是请求里的 `signature`，签名密钥来自 `.env` 中的 `api_auth_token`。

::: warning
请妥善保管 `api_auth_token`，不要暴露到前端、移动端或公开仓库。
:::

## 请求签名规则

签名算法为 **MD5**，规则如下：

1. 收集所有非空参数，排除 `signature`
2. 按 key 的 ASCII 升序排序
3. 拼接为 `key=value&key=value`
4. 直接在末尾追加 `api_auth_token`
5. 计算小写 MD5，结果即为 `signature`

示例：

```text
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirect
```

拼接 token：

```text
amount=42&notify_url=http://example.com/notify&order_id=20220201030210321&redirect_url=http://example.com/redirectepusdt_password_xasddawqe
```

## 请求格式

- Method：`POST` 或 `GET`
- POST 支持 `application/json` 或 `application/x-www-form-urlencoded`
- 编码：UTF-8

## 响应格式

成功响应统一为：

```json
{
  "status_code": 200,
  "message": "success",
  "data": {
    "trade_id": "202203271648380592218340",
    "order_id": "9",
    "amount": 53,
    "currency": "cny",
    "actual_amount": 7.9104,
    "receive_address": "TNEns8t9jbWENbStkQdVQtHMGpbsYsQjZK",
    "token": "usdt",
    "expiration_time": 1648381192,
    "payment_url": "http://example.com/pay/checkout-counter/202203271648380592218340"
  },
  "request_id": "b1344d70-ff19-4543-b601-37abfb3b3686"
}
```

## 状态码说明

当前源码使用顶层 `status_code` 表示接口结果：

| 代码 | 含义 |
|------|------|
| `200` | 成功 |
| `400` | 系统错误或请求校验失败 |
| `401` | 签名校验失败 |
| `10001` | 钱包地址已存在 |
| `10002` | 订单已存在 |
| `10003` | 无可用钱包地址 |
| `10004` | 支付金额不合法 |
| `10005` | 无可用金额通道 |
| `10006` | 汇率计算失败 |
| `10007` | 区块交易已处理 |
| `10008` | 订单不存在 |
| `10009` | 请求参数解析失败 |
| `10010` | 订单状态已变化 |

## 接口列表

| Method | Endpoint | 说明 |
|--------|----------|------|
| `POST` | `/payments/epusdt/v1/order/create-transaction` | 创建支付订单；缺省时会补 `token=usdt`、`currency=cny`、`network=TRON` |
| `POST` | `/payments/gmpay/v1/order/create-transaction` | 创建支付订单；不做旧兼容默认值补充 |
| `GET` | `/pay/checkout-counter/:trade_id` | 托管收银台页面 |
| `GET` | `/pay/check-status/:trade_id` | 收银台轮询状态接口 |

::: tip
当前真实 API 前缀是 `/payments/...`。旧文档中的 `/api/v1/order/create-transaction` 仅可视为历史路径说明，不应再当作当前可用接口。
:::

## 路由前缀说明

需要区分三类路径：

- `/payments/...`：真实 API 创建订单路由
- `/pay/...`：收银台与状态轮询页面路由
- `app_uri`：仅用于拼接返回的绝对地址，例如 `payment_url`

`app_uri` 不是服务内部统一挂载前缀。

## 安全建议

- `api_auth_token` 只保存在服务端
- 生产环境务必启用 HTTPS
- 支付成功后先验签，再更新业务订单
- 回调成功条件应按 **HTTP 200 + 响应体精确等于 `ok`** 处理
- 限制 `.env` 与后台管理入口访问权限
- 为 TRC20 监听准备稳定的 `tron_grid_api_key`

## 下一步

- [支付接口](/zh/api/payment) — 创建订单、回调、状态查询与完整示例
