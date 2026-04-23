# 独角数卡插件

> ⚠️ **注意**：此插件仅适用于独角数卡 **2.0.4 版本以下**。2.0.4 及以上版本已内置 Epusdt 支付方式，无需额外配置。

## 安装方法

1. 将插件目录中的 `app` 和 `routes` 文件夹覆盖到独角数卡网站根目录
2. 在独角数卡后台 → 支付方式 → 添加一个支付方式

## 配置参数

| 字段 | 值 |
|------|----|
| 支付选项 | Epusdt |
| 商户 ID | `api_auth_token` 的值 |
| 商户 Key | 留空 |
| 商户密钥 | `https://your-epusdt-domain.com/payments/epusdt/v1/order/create-transaction` |

> 💡 若独角数卡与 Epusdt 在同一服务器：`http://127.0.0.1:8000/payments/epusdt/v1/order/create-transaction`

## 2.0.4+ 版本配置

直接在后台支付插件配置中填写 API 地址：

```
https://your-epusdt-domain.com/payments/epusdt/v1/order/create-transaction
```

## 插件源码

插件源码位于 Epusdt 仓库的 `plugins/dujiaoka/` 目录：

[https://github.com/GMwalletApp/epusdt/tree/main/plugins/dujiaoka](https://github.com/GMwalletApp/epusdt/tree/main/plugins/dujiaoka)
