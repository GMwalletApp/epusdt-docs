# API Route Mapping (Source → Docs Baseline)

Source of truth: `../epusdt/src/route/router.go`

## Live routes in current source

| Method | Live route | Purpose | Notes |
|---|---|---|---|
| ANY | `/` | health/info text | returns plain text greeting |
| GET | `/pay/checkout-counter/:trade_id` | checkout page | returned as `payment_url` base path |
| GET | `/pay/check-status/:trade_id` | order status polling | used by checkout frontend |
| POST | `/payments/epusdt/v1/order/create-transaction` | create transaction | injects defaults for omitted `token/currency/network` |
| POST | `/payments/gmpay/v1/order/create-transaction` | create transaction | no default injection |

## Legacy / doc paths that should not be treated as current live routes

| Legacy/doc path | Current replacement | Status |
|---|---|---|
| `/api/v1/order/create-transaction` | `/payments/epusdt/v1/order/create-transaction` | legacy only; not registered in current router |

This matches `wiki/LEGACY_API_MIGRATION.md`, which explicitly says dujiaoka users should change prefix from `/api` to `/payments/epusdt`.

## Prefix distinctions that docs must keep separate

### 1. API prefix

Current API prefixes are:

- `/payments/epusdt/v1`
- `/payments/gmpay/v1`

### 2. Checkout app prefix

Checkout/UI endpoints live under:

- `/pay/...`

These are not API-create routes.

### 3. External base URL (`app_uri`)

`app_uri` is used to build absolute URLs such as:

- `{app_uri}/pay/checkout-counter/{trade_id}`

It is **not** a registered server prefix and should not be documented as if the app internally mounts all routes under `app_uri`.

## Request compatibility notes by route

### `POST /payments/epusdt/v1/order/create-transaction`

If omitted, wrapper injects:

```json
{
  "token": "usdt",
  "currency": "cny",
  "network": "TRON"
}
```

Then request continues into the shared create-transaction handler.

### `POST /payments/gmpay/v1/order/create-transaction`

No wrapper defaults. Request must satisfy normal validation directly.

## Callback and frontend-related non-route facts worth tying to route docs

- Merchant creates payment through `/payments/.../order/create-transaction`
- API response includes `payment_url`
- `payment_url` targets `/pay/checkout-counter/{trade_id}`
- Checkout page polls `/pay/check-status/{trade_id}`
- Merchant `notify_url` is called asynchronously after payment success
- Merchant must return exact body `ok` with HTTP 200 for callback success

## Suggested doc corrections to verify later

When editing docs pages, check for and correct these patterns:

- Any example using `/api/v1/order/create-transaction` as current route
- Any wording that conflates `app_uri` with API prefix
- Any wording that presents `/pay/...` as the create-order API
- Any callback section claiming a hardcoded 5 retries without mentioning current config-driven behavior
