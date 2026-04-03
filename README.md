# Epusdt Documentation

<p align="center">
  <img src="https://raw.githubusercontent.com/GMwalletApp/epusdt-docs/main/public/logo.png" width="120" alt="Epusdt">
</p>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0.html"><img src="https://img.shields.io/badge/license-GPLV3-blue" alt="License"></a>
  <a href="https://golang.org"><img src="https://img.shields.io/badge/Golang-1.16+-red" alt="Go"></a>
  <a href="https://t.me/epusdt"><img src="https://img.shields.io/badge/Telegram-Channel-blue" alt="Telegram"></a>
</p>

**[中文文档](README.zh.md)** | **English**

---

**Epusdt** (Easy Payment USDT) is a private USDT payment middleware written in Go, supporting the TRC20 network.

Deploy on your own server — no extra fees, no wallet tampering risk.

## Quick Start

- 📖 [Documentation](https://epusdt-docs.gmwallet.app)
- 🐙 [GitHub](https://github.com/GMwalletApp/epusdt)
- 💬 [Telegram Channel](https://t.me/epusdt)
- 👥 [Telegram Group](https://t.me/epusdt_group)

## Features

- Private deployment — no third-party custody
- Multi-wallet address polling for high concurrency
- Async queue for elegant, high-performance processing
- HTTP API for easy integration
- Telegram bot for notifications
- Cross-platform: x86 / ARM, Windows / Linux

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run docs:dev

# Build
bun run docs:build
```
