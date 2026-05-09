# EPay-Compatible Integration (Redirect Checkout)

Use this flow only when your upstream system expects an EPay-style redirect order entry.

## Route

```text
GET /payments/epay/v1/order/create-transaction/submit.php
POST /payments/epay/v1/order/create-transaction/submit.php
```

## Merchant credential requirement

Incoming requests are **not** validated with deprecated env keys like `epay_pid` or `epay_key`.

Current source does this instead:

1. Read incoming `pid`
2. Find the enabled `api_keys` row with that PID
3. Verify `sign` with that row's `secret_key`
4. Apply optional IP whitelist check

## Required incoming fields

- `pid`
- `money`
- `out_trade_no`
- `notify_url`
- `sign`

Optional common fields:

- `return_url`
- `name`
- `type`
- `sign_type`

`type` is currently only a compatibility-style inbound field. Current source accepts it, but does not persist it into the shared order payload used later in processing.

## EPay defaults

After signature verification succeeds, current source builds the internal shared order payload with admin settings:

- `epay.default_token`
- `epay.default_currency`
- `epay.default_network`

So update those values from the admin settings page if your redirect flow should target a different token, fiat currency, or network.

## Success behavior

On success, the endpoint redirects the browser to:

```text
/pay/checkout-counter/{trade_id}
```

In current source, that path is now the redirect entry for the hosted cashier SPA. The checkout page data is served through:

```text
/pay/checkout-counter-resp/{trade_id}
```

## Callback verification

When the created order carries `payment_type = Epay`, the worker later calls your `notify_url` with EPay-style query parameters and signs them with the **same merchant `secret_key`**.

One important current-source detail: the callback `type` value is currently fixed to `alipay`. It does **not** replay the merchant's inbound create-order `type` field.

Do not verify those callbacks with an old standalone `epay_key`.
