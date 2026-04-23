# Dujiaoka Plugin

> ⚠️ **Note:** This plugin is only for Dujiaoka versions **below 2.0.4**. Version 2.0.4 and above have Epusdt built-in — no additional plugin needed.

## Installation

1. Copy the `app` and `routes` directories from the plugin folder into your Dujiaoka site root
2. In the Dujiaoka admin panel → Payment Methods → Add a payment method

## Configuration

| Field | Value |
|-------|-------|
| Payment Option | Epusdt |
| Merchant ID | Value of `api_auth_token` |
| Merchant Key | (leave empty) |
| Merchant Secret | `https://your-epusdt-domain.com/payments/epusdt/v1/order/create-transaction` |

> 💡 If Dujiaoka and Epusdt are on the same server: `http://127.0.0.1:8000/payments/epusdt/v1/order/create-transaction`

## For Dujiaoka 2.0.4+

Configure the API URL directly in the payment plugin settings:

```
https://your-epusdt-domain.com/payments/epusdt/v1/order/create-transaction
```

## Plugin Source

The plugin source is in the `plugins/dujiaoka/` directory of the Epusdt repository:

[https://github.com/GMwalletApp/epusdt/tree/main/plugins/dujiaoka](https://github.com/GMwalletApp/epusdt/tree/main/plugins/dujiaoka)
