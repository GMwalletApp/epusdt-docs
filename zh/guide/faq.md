# 常見問題

## 三種路由該怎麼選？

- **新接入一律優先 GMPay**。
- **只有當上游系統要求 EPay 風格跳轉收銀臺時** 才使用 EPay 相容入口。
- **不要** 再以 `/payments/epusdt/v1/order/create-transaction` 為新接入基礎，因為當前原始碼已不再註冊它。

## `pid` 和簽名金鑰從哪裡來？

來自管理後臺建立的 API key。每個商戶都有自己的 `pid` 與對應 `secret_key`。

## 為什麼不同環境看到的 GMPay config 不一樣？

因為 `GET /payments/gmpay/v1/config` 是根據你自己後臺資料即時計算的。

其中 `data.supported_assets` 會受到已啟用的 chains、chain_tokens 與可用 wallet_address 影響。
