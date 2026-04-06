# EPUSDT Batch 0 Baseline

Source repo reviewed: `../epusdt`

This file records source-grounded facts from the official codebase before any docs edits.

## 1. Actual HTTP routes in source

Registered in `src/route/router.go`:

- `ANY /` → health/info text
- `GET /pay/checkout-counter/:trade_id` → checkout page
- `GET /pay/check-status/:trade_id` → polling endpoint for checkout page
- `POST /payments/epusdt/v1/order/create-transaction` → create transaction, with legacy defaults injected for `token/currency/network`
- `POST /payments/gmpay/v1/order/create-transaction` → create transaction

Not registered in current source:

- `POST /api/v1/order/create-transaction`

So `/api/v1/...` is a legacy doc path, not a live route in current code.

## 2. Route prefix vs deployment base URL

Important distinction from source:

- Runtime routes are registered at root-relative paths like `/payments/...` and `/pay/...`.
- `app_uri` is **not** a router prefix. It is used to build absolute URLs returned to clients, especially:
  - `payment_url = {app_uri}/pay/checkout-counter/{trade_id}` in `src/model/service/order_service.go`
- The server does **not** register a global base path such as `/epusdt` or `/api`.

Implication:

- If docs mention a deployment subpath, that would have to be handled by a reverse proxy / ingress rewrite outside the app.
- Source only proves root-mounted app routes plus externally configured `app_uri`.

## 3. Create-transaction request reality

### Current live endpoints

- `POST /payments/epusdt/v1/order/create-transaction`
- `POST /payments/gmpay/v1/order/create-transaction`

### Validation rules from `src/model/request/order_request.go`

Required fields:

- `order_id`
- `currency`
- `token`
- `network`
- `amount`
- `notify_url`
- `signature`

Optional:

- `redirect_url`

### Legacy compatibility behavior

On `/payments/epusdt/v1/order/create-transaction`, middleware wrapper injects defaults before validation if omitted:

- `token = "usdt"`
- `currency = "cny"`
- `network = "TRON"`

On `/payments/gmpay/v1/order/create-transaction`, no such defaults are injected.

## 4. Signature algorithm actually used

From `src/util/sign/sign.go` and `src/middleware/check_sign.go`:

- Algorithm: MD5
- Input: all non-empty parameters except `signature`
- Ordering: sorted by key ascending (`sort.Strings` on `key=value` pairs)
- Final string: `joined_params + api_auth_token`
- Output: lowercase hex MD5 string

Notes from code behavior:

- Empty string values are excluded from signing.
- `nil` values are excluded.
- Numbers are stringified before signing.
- Incoming API signature is checked against `config.GetApiAuthToken()`.

## 5. Payment flow facts confirmed in source

From `src/model/service/order_service.go`, `src/task/listen.go`, `src/task/listen_trc20_job.go`, `src/model/service/task_service.go`:

1. Client creates order through `/payments/.../order/create-transaction`.
2. Service computes token amount from configured rate source.
3. System finds an available wallet address.
4. System locks `address + token + amount` for the order window.
5. If same amount is occupied, it increments by `0.01` and retries, up to 100 attempts.
6. Order is created with status `1` (waiting for payment).
7. Background task runs every 5 seconds and scans configured wallet addresses.
8. Current implemented chain listeners are TRON-based:
   - TRX native transfers
   - TRC20 USDT transfers
9. When matching payment is found, order becomes status `2` (paid).
10. Callback queue then posts payment notification to merchant.
11. Expired unpaid orders are moved to status `3` and their transaction locks are released.

## 6. Callback behavior actually implemented

From `src/mq/worker.go`:

### Outbound callback trigger

- Callback processing only targets orders already marked `StatusPaySuccess`.
- Callback body contains:
  - `trade_id`
  - `order_id`
  - `amount`
  - `actual_amount`
  - `receive_address`
  - `token`
  - `block_transaction_id`
  - `status` = `2`
  - `signature`

### Success condition

Merchant callback is considered successful only when both are true:

- HTTP status is `200 OK`
- response body is exactly `ok`

Anything else is treated as failure and retried subject to retry settings.

### Retry behavior

Retry logic is **not** a fixed “always retry 5 times” in current source.

Actual behavior is controlled by config:

- `order_notice_max_retry` → maximum retry count after first attempt
- `callback_retry_base_seconds` → exponential backoff base delay
- queue poll loop interval from `queue_poll_interval_ms`

Current defaults from `src/.env.example`:

- `order_notice_max_retry=0`
- `callback_retry_base_seconds=5`
- `queue_poll_interval_ms=1000`

Meaning with default config:

- first callback attempt still happens
- no extra retries after that failed first attempt

Backoff algorithm in code:

- attempt 1 retry delay: 5s
- attempt 2 retry delay: 10s
- attempt 3 retry delay: 20s
- doubles until capped at 5 minutes

## 7. Docker / container facts confirmed

From `Dockerfile` and `wiki/docker-RUN.md`:

### Dockerfile facts

- Multi-stage build
- Builder clones `https://github.com/GMwalletApp/epusdt.git` and builds binary from `/app/src`
- Runtime entrypoint: `./epusdt http start`
- Working dir: `/app`
- Declares `VOLUME /app/conf`
- Static assets copied to `/app/static` and `/static`

### Network exposure facts

- App listens by config `http_listen`, default `:8000` in `src/.env.example`
- Official docker run guide example maps `8000:8000`
- Official guide mounts env file to `/app/.env`

Important doc note:

- Source repo does **not** include an official committed `docker-compose.yml`; the compose file in `wiki/docker-RUN.md` is documentation/example, not a tracked root deployment manifest.

## 8. Checkout / redirect behavior

From `src/model/service/order_service.go`, `src/model/service/pay_service.go`, `src/static/payment.js`:

- API returns `payment_url`, not a server-side redirect.
- `payment_url` points to `/pay/checkout-counter/{trade_id}`.
- Checkout page polls `/pay/check-status/{trade_id}`.
- On successful payment, frontend redirects to `redirect_url` after about 3 seconds if `redirect_url` exists.

## 9. Status values confirmed

From `src/model/mdb/orders_mdb.go`:

- `1` = waiting for payment
- `2` = payment success
- `3` = expired

## 10. Important implementation caveats for doc review

These are source-grounded and matter when reviewing docs:

- Current live API prefix is `/payments/...`, not `/api/...`.
- `app_uri` is an external absolute base URL, not a server route prefix.
- Callback success requires exact response body `ok`.
- Current retry behavior is config-driven; default config does **not** match old “retry up to 5 times” wording.
- Current runtime implementation is TRON-focused; code actively listens for TRX and TRC20 USDT.
- `network` is required by request validation, but current `/payments/epusdt/...` route injects `TRON` when omitted.
