# 独角数卡集成指南

Epusdt 通过独角数卡支付插件接入。本文只保留和当前源码一致的配置方式、接口路径与回调说明。

## 前置条件

| 条件 | 说明 |
| --- | --- |
| 独角数卡版本 | Epusdt 仓库里的官方插件目录明确注明只适用于 **2.0.4 以下** 的独角数卡；`2.0.4+` 版本通常已经内置该插件。 |
| 旧版本插件文件 | 如果你使用较老版本独角数卡，需要按 `plugins/dujiaoka/README.md` 的说明，把插件里的 `app` 和 `routes` 目录覆盖到独角数卡站点根目录。 |
| Epusdt | 独角数卡服务器可以访问到 Epusdt；如果两者在同机或同网段，也可以直接走内网/本机地址。 |
| API Token | Epusdt `.env` 中的 `api_auth_token`。 |
| 回调可达 | Epusdt 必须能够回 POST 到独角数卡插件自动生成的通知地址。 |

## 独角数卡插件实际会提交什么

官方插件创建订单时会向 Epusdt 提交：

- `amount`
- `order_id`
- `notify_url`
- `redirect_url`
- `signature`

也就是说，`notify_url` 和 `redirect_url` 不是你在 Epusdt 里手动填写的，而是由独角数卡按订单自动生成。

## 独角数卡后台配置

在独角数卡里新增或编辑 **Epusdt** 支付方式。官方插件 README 里使用的后台字段名如下：

| 独角数卡字段 | 填写值 |
| --- | --- |
| 支付选项 | `Epusdt` |
| 商户 ID | Epusdt 的 `api_auth_token` |
| 商户 Key | 留空 |
| 商户密钥 | 完整的 Epusdt 下单地址：`https://your-epusdt-domain/payments/epusdt/v1/order/create-transaction` |

说明：

- 从插件源码看，**商户 ID** 会被当作签名密钥使用，**商户密钥** 会被当作请求地址（`merchant_pem`）使用。
- 这里要填的是**完整请求地址**，不是单纯域名。
- 如果独角数卡和 Epusdt 在同一台机器上，可直接使用 `http://127.0.0.1:8000/payments/epusdt/v1/order/create-transaction`，避免额外的反代问题。
- 插件仓库 README 里仍展示旧路径 `/api/v1/order/create-transaction`，那是旧写法；对应当前 Epusdt 源码，建议改成 `/payments/epusdt/v1/order/create-transaction`。

## 回调与返回页

官方独角数卡插件在创建订单时，会在独角数卡侧生成这些路由：

- 异步通知：`POST /pay/epusdt/notify_url`
- 同步返回：`GET /pay/epusdt/return_url?order_id=...`

然后把它们作为以下字段提交给 Epusdt：

- `notify_url` → 由独角数卡支付处理路由自动生成
- `redirect_url` → 由独角数卡返回页路由自动生成，并附带 `order_id`

Epusdt 支付完成后会向通知地址发起回调。独角数卡校验签名并完成业务处理后，应返回纯文本 `ok`；否则 Epusdt 会把这次回调视为失败。

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
