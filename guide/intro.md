# Introduction

**Epusdt** (Easy Payment USDT) is a self-hosted payment middleware for **USDT checkout flows on TRON**.

It is designed for developers, merchants, and operators who want to run their own payment service, create orders through HTTP APIs, host a checkout page on their own domain, and receive asynchronous payment callbacks without relying on a custodial third-party gateway.

> Epusdt is open source under the [GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.html).

## What Epusdt does

A typical payment flow looks like this:

1. Your system calls the create-order API.
2. Epusdt allocates a receiving address and payable amount.
3. The API returns a `payment_url` for the hosted checkout page.
4. The customer pays on-chain.
5. Epusdt detects the matching transfer and marks the order as paid.
6. Epusdt sends an asynchronous callback to your merchant system.

## Core capabilities

- **Self-hosted service** — deploy on your own server and keep payment infrastructure under your control.
- **Hosted checkout page** — built-in `/pay/checkout-counter/{trade_id}` page for end-user payment.
- **HTTP create-order APIs** — current routes live under `/payments/...`, including `/payments/epusdt/v1/order/create-transaction`.
- **Multi-wallet polling** — supports multiple receiving addresses to improve concurrency.
- **Asynchronous callbacks** — notifies your business system after successful payment.
- **Telegram bot support** — optional notification and management workflow integration.
- **Flexible deployment** — Docker-first, with source builds also possible.

## Current scope and limitations

The current source code is intentionally focused:

- **Primary payment scenario:** USDT on **TRON / TRC20**
- **Hosted routes:** root-relative paths such as `/payments/...` and `/pay/...`
- **Public base URL:** `app_uri` is used to generate absolute checkout links; it is **not** an internal route prefix
- **Subpath deployments:** if you want `/epusdt`-style URLs, handle that in a reverse proxy and test carefully

## Supported runtime facts

Based on the current source and deployment examples:

- **Language/runtime:** Go application
- **HTTP listen default:** `:8000`
- **Database options:** `sqlite`, `mysql`, or `postgres`
- **Recommended external dependency:** TronGrid API access for TRON/TRC20 chain queries
- **Deployment style:** Docker example is provided; source builds are also supported

## Important integration note

Keep these paths separate in your integration:

- **Create order API** → `/payments/...`
- **Hosted checkout page** → `/pay/checkout-counter/{trade_id}`
- **Checkout status polling** → `/pay/check-status/{trade_id}`

The API returns a `payment_url`; the service does not redirect your create-order request directly into checkout.

## Next steps

- [Installation Overview](/guide/installation/)
- [Docker Deployment](/guide/installation/docker)
- [Manual Deployment](/guide/installation/manual)
- [API Reference](/api/reference)
