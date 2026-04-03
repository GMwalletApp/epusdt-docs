# API 参考

本节介绍 Epusdt 的 HTTP API，帮助你将 USDT 支付能力集成到自己的系统中。

## 基础地址

所有 API 请求都以你部署的 Epusdt 服务地址作为基础 URL：

```
http://your-server:8000
```

生产环境建议通过 Nginx、Caddy 等反向代理启用 HTTPS：

```
https://pay.example.com
```

## 鉴权方式

Epusdt 使用共享 Token 进行 API 鉴权。该 Token 通常在 `.env` 中配置为 `app_token`。

你可以通过以下任意一种方式传递 Token：

### 1. Authorization 请求头（推荐）

```http
Authorization: Bearer YOUR_API_TOKEN
```

### 2. 查询参数

```
POST /payments/epusdt/v1/order/create-transaction?token=YOUR_API_TOKEN
```

### 3. 请求体字段

在 JSON 请求体中加入 `token` 字段。

::: warning
请妥善保管 API Token，不要将其暴露在前端代码、移动端应用或公开仓库中。
:::

## 请求格式

- 所有 POST 请求支持 `application/json` 或 `application/x-www-form-urlencoded`
- 所有 GET 请求使用标准查询参数
- 字符编码：UTF-8

## 响应格式

所有接口都返回统一结构的 JSON 对象：

### 成功响应

```json
{
  "status": 1,
  "message": "ok",
  "data": {
    // 业务数据
  }
}
```

### 错误响应

```json
{
  "status": 400,
  "message": "invalid params",
  "data": null
}
```

## 状态码说明

| 代码 | 含义 |
|------|------|
| `1` | 请求成功 |
| `400` | 请求错误 / 参数非法 |
| `401` | 未授权（Token 缺失或无效） |
| `10001` | 订单不存在 |
| `10002` | 订单已过期 |
| `10003` | 订单号重复 |
| `10004` | 金额超出允许范围 |
| `10005` | 无可用钱包地址 |
| `10006` | 不支持的币种 |
| `10007` | 不支持的网络 |
| `10008` | 签名校验失败 |
| `10009` | 订单已支付 |
| `10010` | 系统繁忙，请稍后重试 |

::: tip
`status = 1` 表示请求成功，其他值都应视为错误。接入时请同时检查 `message` 字段以获取详细原因。
:::

## 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/payments/epusdt/v1/order/create-transaction` | [创建支付订单](/zh/api/payment) |
| GET | `/pay/checkout-counter/:trade_id` | 跳转到支付收银台 |
| GET | `/pay/check-status/:trade_id` | 查询订单支付状态 |
| POST | `/api/v1/order/create-transaction` | [旧版创建订单接口](/zh/api/legacy)（已废弃） |
| GET | `/api/v1/rate` | [旧版汇率接口](/zh/api/legacy#exchange-rate) |

## 安全建议

- 生产环境务必使用 **HTTPS** 并配置有效证书
- API Token 只保存在服务端，不要暴露给前端
- 在你的业务系统中校验回调签名
- 合理设置 `order_expiration_time` 与 `callback_timeout`
- 限制管理后台和 `.env` 文件的访问权限
- 如条件允许，可对回调地址增加 IP 白名单保护

## 下一步

- [支付接口](/zh/api/payment) — 完整接入流程与示例代码
- [旧版接口](/zh/api/legacy) — 废弃接口说明与迁移指南
