# Introduction

## Epusdt (Easy Payment Usdt)

`Epusdt` is a self-hosted **USDT payment middleware** written in **Go**, operating on the TRC20 network.

Developers and site owners can integrate USDT payment collection into any system via the `Epusdt` HTTP API — no complex setup required. It only needs **MySQL/SQLite** (and optionally Redis) to handle online USDT payments and async payment callbacks.

With private deployment, there are **no transaction fees** and no third-party custody — USDT goes directly to your wallet. 💰

## Features

- ✅ **Private deployment** — no risk of wallet hijacking or missed orders
- ✅ **Cross-platform Go binary** — x86 and ARM, Windows and Linux
- ✅ **Multi-wallet polling** — higher concurrency for simultaneous orders
- ✅ **Async queue** — elegant, high-performance callback processing
- ✅ **Single binary** — no runtime dependencies
- ✅ **HTTP API** — integrate with any system
- ✅ **Telegram bot** — instant payment notifications

## Project Structure

```
Epusdt
├── plugins   # Integrated plugins (e.g. Dujiaoka)
├── src       # Core source code
├── sdk       # Integration SDK
├── sql       # Database SQL files
└── wiki      # Documentation
```

## How It Works

Epusdt monitors the TRC20 network via public API or RPC nodes, watching for incoming USDT transactions on configured wallet addresses. It uses **amount matching** and **time-locking** to attribute payments to orders.

```
Flow:
1. Customer needs to pay 20.05 USDT
2. Server locks wallet address_1 → 20.05 (for 10 minutes)
3. If that amount is already taken (concurrent order), increment by 0.0001 and retry (up to 100x)
4. Background thread monitors all wallet inflows;
   when an incoming amount matches a locked order, payment is confirmed → callback triggered
```

## Community

- Telegram Channel: [https://t.me/epusdt](https://t.me/epusdt)
- Telegram Group: [https://t.me/epusdt_group](https://t.me/epusdt_group)
- GitHub: [https://github.com/GMwalletApp/epusdt](https://github.com/GMwalletApp/epusdt)
- GitHub Stars: [![GitHub Stars](https://img.shields.io/github/stars/GMwalletApp/epusdt?style=flat&logo=github)](https://github.com/GMwalletApp/epusdt/stargazers)

## License

[GPLv3](https://www.gnu.org/licenses/gpl-3.0.html)

> ⚠️ This project is for educational and technical purposes only. Users are responsible for compliance with local laws and regulations. Crypto assets carry high risk; GMwallet makes no guarantees regarding asset safety or outcomes.
