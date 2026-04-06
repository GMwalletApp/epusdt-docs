# 独角数卡集成指南

Epusdt 通过独角数卡支付插件接入。本文只保留和当前源码一致的配置方式、接口路径与回调说明。

## 前置条件

| 条件 | 说明 |
| --- | --- |
| 独角数卡 | 管理后台可正常访问。旧版本可能需要手动覆盖插件文件；较新版本可能已内置。 |
| Epusdt | 独角数卡服务器可以访问到 Epusdt。 |
| API Token | Epusdt `.env` 中的 `api_auth_token`。 |
| 回调可达 | Epusdt 必须能够回 POST 到独角数卡的通知地址。 |

## 独角数卡插件实际会提交什么

官方插件创建订单时会向 Epusdt 提交：

- `amount`
- `order_id`
- `notify_url`
- `redirect_url`
- `signature`

也就是说，`notify_url` 和 `redirect_url` 不是你在 Epusdt 里手动填写的，而是由独角数卡按订单自动生成。

## 独角数卡后台配置

在独角数卡里新增或编辑 **Epusdt** 支付方式，字段映射如下：

| 独角数卡字段 | 填写值 |
| --- | --- |
| 商户 ID | Epusdt 的 `api_auth_token` |
| 商户 Key | 留空 |
| 商户密钥 / 接口地址 | `https://your-epusdt-domain/payments/epusdt/v1/order/create-transaction` |

说明：

- 这里要填的是**完整请求地址**，不是单纯域名。
- 如果独角数卡和 Epusdt 在同一台机器上，可直接使用 `http://127.0.0.1:8000/payments/epusdt/v1/order/create-transaction`，避免额外的反代问题。
- 旧路径 `/api/v1/order/create-transaction` 目前仍有兼容转发，但新部署建议直接使用 `/payments/epusdt/v1/order/create-transaction`。

## 回调与返回页

官方独角数卡插件侧使用的路由为：

- 异步通知：`POST /pay/epusdt/notify_url`
- 同步返回：`GET /pay/epusdt/return_url?order_id=...`

Epusdt 支付完成后会向通知地址发起回调。独角数卡校验签名并完成业务处理后，应返回纯文本 `ok`；否则 Epusdt 会按失败通知进行重试。

## 测试检查项

下一个小额测试单，确认：

- 独角数卡能正常跳转到 Epusdt 返回的 `payment_url`
- 链上到账后支付状态会更新
- 独角数卡能收到回调并把订单标记为已支付
- 用户会被带回独角数卡订单详情页

## 常见问题

### 签名校验失败

独角数卡里的 **商户 ID** 必须填写 Epusdt 的 `api_auth_token` 原值。多一个空格、少一个字符都会导致签名失败。

### 回调没有收到

检查独角数卡通知地址是否能被 Epusdt 所在服务器公网访问，并确认防火墙、反向代理没有拦截该 POST 请求。

### 接口地址填错

如果现在仍然配置的是 `/api/v1/order/create-transaction`，建议更新为：

```text
/payments/epusdt/v1/order/create-transaction
```

### 订单过期太快

如果用户转账时间偏长，可适当调大 Epusdt 中的 `order_expiration_time`。
