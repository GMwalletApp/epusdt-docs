# Introduction

**Epusdt** (Easy Payment USDT) is a private, self-hosted USDT payment middleware written in **Go**, operating on the **TRC20 network**.

Site operators and developers can integrate USDT payment functionality into any system via the HTTP API provided by Epusdt — with minimal configuration and lightweight dependencies.

> Epusdt is open source and licensed under the [GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.html).

## Key Features

- ✅ **Private deployment** — no wallet tampering risk, no order skimming; USDT goes directly to your wallet
- ✅ **Cross-platform** — Go binary supports x86/ARM, Windows/Linux
- ✅ **Multi-wallet polling** — improves concurrent order throughput
- ✅ **Async queue** — elegant, high-performance order processing
- ✅ **Zero extra dependencies** — just one compiled binary
- ✅ **HTTP API** — integrate into any system
- ✅ **Telegram bot** — wallet management and payment notifications
- ✅ **Built-in admin panel** — web UI for monitoring orders and wallets

## How It Works

Epusdt monitors the TRC20 network (via TronGrid API) for incoming USDT transactions. It uses **amount uniqueness** and **time windows** to match payments to orders:

```
1. Customer needs to pay 20.05 USDT
2. Server checks if address_1: 20.05 is already locked
3. If free → return that wallet + amount to customer (locked for 10 min)
4. If occupied → increment by 0.0001 and retry (up to 100 times)
5. Background thread watches for incoming USDT matching pending amounts
6. Match found → order marked as paid → async callback triggered
```

## Project Structure

```
epusdt/
├── plugins/    # Integrated plugins (e.g. dujiaoka)
├── src/        # Core source code
├── sdk/        # Integration SDKs
├── sql/        # SQL schema files
└── wiki/       # Documentation
```

## System Requirements

| Component | Requirement |
|-----------|-------------|
| OS | Linux (recommended), Windows, macOS |
| Architecture | x86_64 or ARM |
| Database | SQLite (default), MySQL, or PostgreSQL |
| Network | Outbound HTTPS access to TronGrid API |
| Domain | Required for the payment checkout page |
| Telegram Bot | Recommended for management & notifications |

## Community

- Telegram Channel: [https://t.me/epusdt](https://t.me/epusdt)
- Telegram Group: [https://t.me/epusdt_group](https://t.me/epusdt_group)
- GitHub: [https://github.com/GMwalletApp/epusdt](https://github.com/GMwalletApp/epusdt)

## Next Steps

- [Installation Overview](/guide/installation/) — choose your deployment method
- [Docker Deployment](/guide/installation/docker) — fastest way to get started
- [BaoTa Panel Deployment](/guide/installation/baota)
- [Manual Deployment](/guide/installation/manual)
- [API Reference](/api/reference)
