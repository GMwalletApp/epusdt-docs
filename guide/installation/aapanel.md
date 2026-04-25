# aaPanel Deployment

This guide shows how to run the Epusdt service itself with aaPanel.

**No manual `.env` is required for first boot.** Start the binary, then finish setup in the browser wizard.

## Basic flow

1. Create a site in aaPanel for your payment domain
2. Upload the Epusdt release package or binary
3. Reverse proxy the site to `http://127.0.0.1:8000`
4. Fix program permissions before starting it with Supervisor
5. Use aaPanel Supervisor with the correct working directory and command
6. Open the bound domain to finish the install wizard

## Recommended permissions before Supervisor

If aaPanel Supervisor runs the process as `www`, make sure the deployment directory is executable and owned correctly first:

```bash
cd /www/wwwroot/epusdt
chmod +x epusdt
chown -R www:www /www/wwwroot/epusdt
```

## Recommended Supervisor settings

- **Working directory:** `/www/wwwroot/epusdt`
- **Command:** `./epusdt http start`

Using only `epusdt http start` can fail when the working directory is wrong, because the config file path is resolved relative to the current directory.

## Finish the install wizard

- Recommended: open the bound domain directly, such as `https://pay.example.com`
- Only if you are connecting to the program port directly, open `http://server-ip:8000`

## Verification

Use your deployed domain as the API base URL, for example:

```text
https://pay.example.com
```

Recommended order route:

```text
POST /payments/gmpay/v1/order/create-transaction
```

## Notes

- Admin panel settings now own merchant credentials and EPay defaults
- Do not follow old docs that still mention `/payments/epusdt/v1/order/create-transaction`
