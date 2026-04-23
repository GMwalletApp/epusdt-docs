# 接口迁移说明

本文档说明 Epusdt 的路由变更及相关配置项。

## 路由变更

旧路由 `/api/v1/order/create-transaction` 已**移除**，请使用新路由：

| 接入方式 | 新路由 |
|----------|--------|
| GMPay（推荐） | `POST /payments/gmpay/v1/order/create-transaction` |
| Epusdt（旧版兼容） | `POST /payments/epusdt/v1/order/create-transaction` |
| EPay 兼容 | `GET/POST /payments/epay/v1/order/create-transaction/submit.php` |

> ⚠️ 旧路由 `/api/v1/order/create-transaction` 在当前版本中**已不存在**，请立即更新接入地址。

## 独角数卡用户

**只需修改一个地方**：在独角数卡后台支付插件配置中，将 API 地址改为：

```
https://your-domain.com/payments/epusdt/v1/order/create-transaction
```

---

## 配置项说明

### `api_rate_url` — 汇率接口 URL

```bash
api_rate_url=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/
```

系统请求 `{api_rate_url}/{currency}.json`，返回格式示例：

```json
{
  "cny": {
    "usdt": 0.1389,
    "trx": 0.0123
  }
}
```

支持自建汇率 API，按上述格式返回即可。

---

### `tron_grid_api_key` — TRON Grid API Key

```bash
tron_grid_api_key=your-api-key-here
```

在 [https://www.trongrid.io/](https://www.trongrid.io/) 注册获取，可提高请求限额和稳定性。

---

## 配置参考

```bash
order_expiration_time=15
order_notice_max_retry=0
api_rate_url=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/
tron_grid_api_key=your-api-key-here
```
