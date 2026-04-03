# Dujiaoka Integration

[Dujiaoka](https://github.com/assimon/dujiaoka) (独角数卡) is a popular open-source digital goods automated selling platform widely used in the Chinese-speaking community. It supports multiple payment gateways, including USDT via Epusdt.

This guide walks you through connecting Epusdt as a payment gateway in your Dujiaoka store.

## Prerequisites

Before you begin, make sure the following are ready:

| Requirement | Details |
|-------------|---------|
| Dujiaoka | Installed and running with admin panel accessible |
| Epusdt | Deployed and reachable from the Dujiaoka server |
| Epusdt API token | The `api_auth_token` value from your Epusdt `.env` or `.env` |
| Network access | Dujiaoka server can reach the Epusdt API endpoint; Epusdt can reach Dujiaoka's callback URL |

## Integration Steps

### 1. Log in to the Dujiaoka Admin Panel

Open the Dujiaoka admin panel in your browser and sign in with an administrator account.

### 2. Navigate to Payment Gateway Settings

Go to **System Settings → Payment Gateway** (系统设置 → 支付设置) in the left sidebar.

### 3. Add Epusdt as a Payment Gateway

Click **Add Payment** or look for the Epusdt payment option. If Epusdt is listed as a built-in plugin, select it directly. Otherwise, choose **Custom** and configure the fields manually.

### 4. Fill in the Configuration

Enter the following values:

| Field | Value | Description |
|-------|-------|-------------|
| Gateway URL | Public base URL of the running Epusdt service | Use the full base URL that Dujiaoka can reach. A default direct deployment commonly listens on port `8000`. |
| API Endpoint | `/payments/epusdt/v1/order/create-transaction` | The order creation endpoint. This is the current recommended route. |
| App Token / Secret Key | The exact `api_auth_token` value from Epusdt | Must match the `api_auth_token` configured in your Epusdt `.env` or `.env`. |
| Callback URL (notify_url) | Automatic | Epusdt handles callback delivery automatically based on the `notify_url` passed during order creation. Dujiaoka sets this field when creating orders. |

### 5. Enable the Payment Gateway

Toggle the Epusdt payment method to **Enabled** so it appears as a checkout option for your customers.

### 6. Test with a Small Order

Create a test product with a low price (e.g., 0.01 USDT equivalent) and complete a purchase to verify:

- The checkout page loads correctly and displays a wallet address
- Payment is detected after sending USDT
- The callback is received by Dujiaoka and the order is marked as paid
- The digital goods are delivered to the buyer

## Migration from Old Plugin

If you previously used the Dujiaoka Epusdt plugin that pointed to the old API route:

```text
/api/v1/order/create-transaction
```

Be aware of the following:

- **The old route still works.** Epusdt includes a compatibility wrapper that forwards requests from the legacy path to the new handler.
- **Update recommended.** Switch your gateway configuration to the new endpoint for long-term compatibility:

```text
/payments/epusdt/v1/order/create-transaction
```

To migrate, simply update the API endpoint field in your Dujiaoka payment gateway settings. No other changes are needed — the request and response formats remain the same.

## Troubleshooting

### Signature Mismatch Error

**Symptom:** Order creation fails with a signature verification error.

**Cause:** The secret key configured in Dujiaoka does not match the `api_auth_token` in your Epusdt deployment.

**Fix:** Open your Epusdt `.env` or `.env`, copy the exact value of `api_auth_token`, and paste it into the Dujiaoka payment gateway settings. Make sure there are no extra spaces or line breaks.

### Callback Not Received

**Symptom:** Payment is confirmed on-chain but Dujiaoka still shows the order as unpaid.

**Cause:** Epusdt cannot reach the `notify_url` provided by Dujiaoka.

**Fix:**
1. Ensure the Dujiaoka domain is publicly accessible from the server running Epusdt.
2. Check firewall rules — the Epusdt server needs outbound HTTP/HTTPS access to the Dujiaoka callback URL.
3. Verify that the `app_uri` in your Epusdt configuration is set to the correct public domain.
4. Check Epusdt logs for callback delivery errors.

### Order Expires Before Payment

**Symptom:** The customer sends USDT but the order has already expired.

**Cause:** The `order_expiration_time` in Epusdt is too short for the customer to complete payment.

**Fix:** Increase the `order_expiration_time` value in your Epusdt `.env` or `.env`. The default is typically 10 minutes. For slower networks or manual transfers, consider setting it to 15–30 minutes.

### Checkout Page Does Not Load

**Symptom:** Customer clicks "Pay with USDT" but sees a blank page or connection error.

**Cause:** The gateway URL configured in Dujiaoka is incorrect or the Epusdt service is not running.

**Fix:**
1. Verify the Epusdt service is running: check process status or try accessing the admin panel.
2. Confirm the gateway URL in Dujiaoka points to the correct Epusdt address and port.
3. If using a reverse proxy (Nginx, Caddy), ensure it forwards requests to the Epusdt backend correctly.
