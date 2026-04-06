# Epusdt Documentation

<p align="center">
  <img src="https://raw.githubusercontent.com/GMwalletApp/epusdt-docs/main/public/logo.png" width="120" alt="Epusdt">
</p>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0.html"><img src="https://img.shields.io/badge/license-GPLV3-blue" alt="License"></a>
  <a href="https://t.me/epusdt"><img src="https://img.shields.io/badge/Telegram-Channel-blue" alt="Telegram"></a>
</p>

**[中文文档](README.zh.md)** | **English**

---

This repository contains the VitePress documentation site for **Epusdt**.

**Epusdt** is a self-hosted TRON / TRC20 USDT payment middleware. It exposes create-order APIs under `/payments/...`, returns hosted checkout URLs, and notifies merchant systems with asynchronous callbacks after successful payment.

## Documentation site

- 📖 Docs: https://epusdt-docs.gmwallet.app
- 🐙 Source project: https://github.com/GMwalletApp/epusdt
- 💬 Telegram Channel: https://t.me/epusdt
- 👥 Telegram Group: https://t.me/epusdt_group

## Product summary

- Self-hosted deployment on your own server
- Hosted checkout page at `/pay/checkout-counter/{trade_id}`
- Create-order APIs under `/payments/...`
- Multi-address polling plus unique-amount reservation for higher order concurrency
- Optional Telegram bot notifications / basic operational flows
- Docker deployment example, plus source-build flexibility

## Local development

```bash
bun install
bun run docs:dev
bun run docs:build
```
