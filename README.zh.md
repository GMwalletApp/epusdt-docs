# Epusdt 文档

<p align="center">
  <img src="https://raw.githubusercontent.com/GMwalletApp/epusdt-docs/main/public/logo.png" width="120" alt="Epusdt">
</p>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0.html"><img src="https://img.shields.io/badge/license-GPLV3-blue" alt="License"></a>
  <a href="https://golang.org"><img src="https://img.shields.io/badge/Golang-1.16+-red" alt="Go"></a>
  <a href="https://t.me/epusdt"><img src="https://img.shields.io/badge/Telegram-Channel-blue" alt="Telegram"></a>
</p>

**中文** | **[English](README.md)**

---

**Epusdt**（Easy Payment USDT）是一个由 Go 语言编写的私有化 USDT 支付中间件，支持 TRC20 网络。

部署在自己的服务器上，无需额外手续费，钱包安全由自己掌控。

## 快速开始

- 📖 [文档站](https://epusdt-docs.gmwallet.app)
- 🐙 [GitHub](https://github.com/GMwalletApp/epusdt)
- 💬 [Telegram 频道](https://t.me/epusdt)
- 👥 [Telegram 交流群](https://t.me/epusdt_group)

## 功能特点

- 私有化部署，无吞单风险
- 多钱包地址轮询，提高并发
- 异步队列，优雅高性能
- HTTP API 接入
- Telegram 机器人通知
- 跨平台支持：x86 / ARM，Windows / Linux

## 本地开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run docs:dev

# 构建
bun run docs:build
```
