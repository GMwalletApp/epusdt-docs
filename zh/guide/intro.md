# 项目简介

**Epusdt**（Easy Payment USDT）是一个面向 **TRON / TRC20 USDT 收款流程** 的自托管支付中间件。

它适合希望自己部署支付服务的开发者、商户和站点运营者：通过 HTTP API 创建订单，在自己的域名下提供收银台页面，并在支付成功后异步回调业务系统，而不是依赖第三方托管式网关。

> Epusdt 遵守 [GPLv3 开源协议](https://www.gnu.org/licenses/gpl-3.0.html)。

## Epusdt 能做什么

一个典型流程如下：

1. 你的业务系统调用创建订单接口。
2. Epusdt 分配收款地址和应付金额。
3. 接口返回收银台链接 `payment_url`。
4. 用户在链上完成支付。
5. Epusdt 检测到匹配转账后，将订单标记为已支付。
6. Epusdt 异步回调你的商户系统。

## 核心能力

- **自托管服务**：部署在你自己的服务器上，支付基础设施由你自己掌控。
- **托管收银台页面**：内置 `/pay/checkout-counter/{trade_id}` 收银台页面供终端用户支付。
- **HTTP 下单接口**：当前源码中的创建订单接口位于 `/payments/...`，包括 `/payments/epusdt/v1/order/create-transaction`。
- **多地址轮询**：支持多个收款地址参与轮询，并结合唯一金额保留机制提高并发处理能力。
- **异步支付回调**：支付成功后通知你的业务系统；回调成功条件应按 HTTP `200` 且响应体精确等于 `ok` 理解。
- **Telegram 机器人支持**：可选的通知和基础运营流程能力。
- **灵活部署**：优先推荐 Docker，也支持源码构建。

## 当前能力边界

当前源码的能力范围比较明确：

- **主要支付场景**：**TRON / TRC20** 下的 USDT 收款
- **服务路由**：使用 `/payments/...`、`/pay/...` 这类根路径路由
- **公网地址配置**：`app_uri` 用于生成绝对收银台链接，**不是** 应用内部路由前缀
- **子路径部署**：如果你要挂在 `/epusdt` 之类子路径后面，需要由反向代理处理并自行充分验证

## 当前运行事实

根据当前源码与部署示例，可确认：

- **应用语言 / 运行时**：Go
- **HTTP 默认监听地址**：`:8000`
- **数据库支持**：`sqlite`、`mysql`、`postgres`
- **推荐外部依赖**：需要可访问的 TronGrid API 来查询 TRON / TRC20 链上数据
- **部署方式**：提供 Docker 示例，也支持源码构建

## 一个容易混淆的点

接入时请把下面几类路径分开理解：

- **创建订单 API** → `/payments/...`
- **收银台页面** → `/pay/checkout-counter/{trade_id}`
- **收银台状态轮询** → `/pay/check-status/{trade_id}`

创建订单接口会返回 `payment_url`，而不是由服务端直接把你的下单请求重定向到收银台。

## 下一步

- [安装概览](/zh/guide/installation/)
- [Docker 部署](/zh/guide/installation/docker)
- [手动部署](/zh/guide/installation/manual)
- [API 参考](/zh/api/reference)
