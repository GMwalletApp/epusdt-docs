# Epusdt 文档

<p align="center">
  <img src="https://raw.githubusercontent.com/GMwalletApp/epusdt-docs/main/public/logo.png" width="120" alt="Epusdt">
</p>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0.html"><img src="https://img.shields.io/badge/license-GPLV3-blue" alt="License"></a>
  <a href="https://t.me/epusdt"><img src="https://img.shields.io/badge/Telegram-Channel-blue" alt="Telegram"></a>
</p>

**中文** | **[English](README.md)**

---

这个仓库是 **Epusdt** 的 VitePress 文档站。

**Epusdt** 是一个面向 TRON 支付流程的自托管 USDT 支付中间件。它提供创建订单 API，返回托管收银台链接，并在支付成功后通过异步回调通知商户系统。

## 文档入口

- 📖 文档站：https://epusdt-docs.gmwallet.app
- 🐙 官方源码：https://github.com/GMwalletApp/epusdt
- 💬 Telegram 频道：https://t.me/epusdt
- 👥 Telegram 群组：https://t.me/epusdt_group

## 产品摘要

- 部署在你自己的服务器上
- 内置收银台页面 `/pay/checkout-counter/{trade_id}`
- 创建订单接口位于 `/payments/...`
- 支持多钱包轮询，提高订单并发能力
- 可选 Telegram 机器人通知 / 基础管理流程
- 提供 Docker 部署示例，也支持源码构建

## 本地开发

```bash
bun install
bun run docs:dev
bun run docs:build
```
