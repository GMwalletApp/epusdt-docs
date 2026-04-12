# 接口迁移说明

本文档说明 Epusdt 的路由变更及新增配置项，帮助旧版用户完成迁移。

## 路由变更

| 旧路由 | 新路由 | 说明 |
|--------|--------|------|
| `POST /api/v1/order/create-transaction` | `POST /payments/epusdt/v1/order/create-transaction` | 创建交易订单 |

> 旧路由仍然可用（向后兼容），但建议迁移到新路由。

## 独角数卡用户迁移

**只需修改一个地方**：在独角数卡后台支付插件配置中，将 API 地址前缀从 `/api` 改为 `/payments/epusdt`。

```
旧配置：https://your-domain.com/api/v1/order/create-transaction
新配置：https://your-domain.com/payments/epusdt/v1/order/create-transaction
```

其他配置（密钥、回调地址等）完全不需要修改。

---

## 新增配置项

### `api_rate_url` — 汇率接口 URL

用于获取实时汇率的 API 地址，系统会动态获取各币种汇率。

```bash
api_rate_url=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/
```

**API 格式要求：** 系统请求 `{api_rate_url}/{currency}.json`，例如：
- `https://your-rate-api.com/cny.json`

**返回格式示例：**

```json
{
  "cny": {
    "usdt": 0.1389,
    "trx": 0.0123
  }
}
```

其中 `0.1389` 表示 1 CNY = 0.1389 USDT（即约 7.2 CNY/USDT）。支持自建汇率 API，按上述格式返回数据即可。

---

### `tron_grid_api_key` — TRON Grid API Key

TRON Grid API 密钥，用于提高 API 请求限额和稳定性。

```bash
tron_grid_api_key=your-api-key-here
```

**如何获取：**

1. 访问 [https://www.trongrid.io/](https://www.trongrid.io/)
2. 注册并登录
3. 在控制台创建 API Key

**为什么推荐配置：**
- 提高 API 调用配额，避免公共节点限流
- 为后续支持 TRX 等其他代币提供基础

---

## 完整配置示例

```bash
# 订单过期时间（分钟）
order_expiration_time=15

# 回调失败最大重试次数（0 = 不限）
order_notice_max_retry=0

# 汇率接口 URL
api_rate_url=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/

# TRON Grid API Key（推荐）
tron_grid_api_key=your-api-key-here
```
