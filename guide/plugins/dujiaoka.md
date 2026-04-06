# Dujiaoka Integration

[Dujiaoka](https://github.com/assimon/dujiaoka) is supported through the Epusdt payment plugin. This page covers the actual fields used by the plugin and the current Epusdt endpoint.

## Prerequisites

| Requirement | Details |
| --- | --- |
| Dujiaoka | Admin panel available. Older versions may require manually copying the plugin files; newer versions may already include it. |
| Epusdt | Publicly reachable from the Dujiaoka server. |
| API token | `api_auth_token` from Epusdt `.env`. |
| Callback reachability | Epusdt must be able to POST back to your Dujiaoka notify URL. |

## What the Dujiaoka plugin actually sends

The official plugin sends these fields to Epusdt when an order is created:

- `amount`
- `order_id`
- `notify_url`
- `redirect_url`
- `signature`

You do **not** manually configure `notify_url` or `redirect_url` inside Epusdt. Dujiaoka generates them for each order.

## Dujiaoka configuration

In Dujiaoka, add or edit the **Epusdt** payment method and map the fields like this:

| Dujiaoka field | Value |
| --- | --- |
| Merchant ID | Your Epusdt `api_auth_token` |
| Merchant Key | Leave empty |
| Merchant Secret / Endpoint URL | `https://your-epusdt-domain/payments/epusdt/v1/order/create-transaction` |

Notes:

- Use the **full request URL**, not only the domain.
- If Dujiaoka and Epusdt are on the same server, a local address such as `http://127.0.0.1:8000/payments/epusdt/v1/order/create-transaction` can avoid proxy issues.
- The old legacy path `/api/v1/order/create-transaction` is still compatibility-routed, but new installs should use `/payments/epusdt/v1/order/create-transaction`.

## Callback / return behavior

The official Dujiaoka plugin uses these routes on the Dujiaoka side:

- Notify URL: `POST /pay/epusdt/notify_url`
- Return URL: `GET /pay/epusdt/return_url?order_id=...`

Epusdt posts payment results to the notify URL. Dujiaoka verifies the signature and should return plain text `ok` after successful processing; otherwise Epusdt will retry failed notifications.

## Test checklist

Place a small test order and confirm:

- Dujiaoka can open the Epusdt `payment_url`
- Payment status updates after the on-chain transfer is confirmed
- Dujiaoka receives the notify callback and marks the order paid
- The buyer is redirected back to the Dujiaoka order page

## Troubleshooting

### Signature verification failed

Use the exact Epusdt `api_auth_token` as Dujiaoka's **Merchant ID**. Extra spaces or the wrong token will break signing.

### Callback not delivered

Check that your Dujiaoka notify route is publicly reachable by the Epusdt server and not blocked by firewall or reverse proxy rules.

### Wrong endpoint

If the plugin is still configured with `/api/v1/order/create-transaction`, update it to:

```text
/payments/epusdt/v1/order/create-transaction
```

### Order expires too quickly

Adjust `order_expiration_time` in Epusdt if your customers need more time to complete the transfer.
