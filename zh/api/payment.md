# 支付介面

## 1. GMPay 建立訂單

**路由**

```text
POST /payments/gmpay/v1/order/create-transaction
```

**必要欄位**

| 欄位 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- |
| `pid` | string / integer | ✅ | 商戶識別碼。驗籤中介層必填。 |
| `order_id` | string | ✅ | 最長 32 字元 |
| `currency` | string | ✅ | 例如 `cny` |
| `token` | string | ✅ | 例如 `usdt` |
| `network` | string | ✅ | 例如 `tron` |
| `amount` | number | ✅ | 必須大於 `0.01` |
| `notify_url` | string | ✅ | 非同步回撥地址 |
| `signature` | string | ✅ | 使用商戶 `secret_key` 計算的 MD5 簽名 |
| `redirect_url` | string | ❌ | 支付完成後跳轉網址 |
| `name` | string | ❌ | 商品顯示名稱 |
| `payment_type` | string | ❌ | 可選來源標記 |

**請求示例**

```json
{
  "pid": "1000",
  "order_id": "ORD20260424001",
  "currency": "cny",
  "token": "usdt",
  "network": "tron",
  "amount": 100,
  "notify_url": "https://merchant.example.com/notify",
  "redirect_url": "https://merchant.example.com/return",
  "name": "VIP Plan",
  "signature": "md5(...)"
}
```

**成功回應補充**

目前原始碼在建單成功回應中也會返回 `payment_url`，因此呼叫端可以直接把它當成託管收銀臺跳轉地址使用。

## 2. GMPay 公開配置

```text
GET /payments/gmpay/v1/config
```

目前原始碼會一次返回前端可用的支付配置。

`data` 內的重要欄位包括：

- `supported_assets` —— 目前後臺已啟用、且該鏈上至少存在一個可用錢包地址的鏈 / 代幣組合
- `site` —— 收銀臺公開品牌資訊：cashier 名稱、logo URL、網站標題、支援連結、`background_color`（背景色）、`background_image_url`（背景圖片 URL）
- `epay` —— EPay 預設代幣 / 法幣 / 網路
- `okpay` —— 公開的 OkPay 開關與可用代幣設定
- `amount_precision` —— 計算加密貨幣金額時使用的小數位數（範圍 2–6，預設 2；透過後臺 `system.amount_precision` 設定）

所以如果前端需要動態展示鏈 / 代幣，應該從 `data.supported_assets` 讀取，而不是把文件裡某個固定清單當成永遠正確。

## 3. EPay 相容跳轉建單

```text
GET /payments/epay/v1/order/create-transaction/submit.php
POST /payments/epay/v1/order/create-transaction/submit.php
```

**入站引數**

| 欄位 | 必填 | 說明 |
| --- | --- | --- |
| `pid` | ✅ | 商戶 PID，會在 `api_keys` 中查找 |
| `money` | ✅ | 法幣金額 |
| `out_trade_no` | ✅ | 商戶訂單號 |
| `notify_url` | ✅ | 回撥地址 |
| `return_url` | ❌ | 瀏覽器返回地址 |
| `name` | ❌ | 商品名稱 |
| `type` | ❌ | 相容欄位；目前原始碼會接受它，但不會把它寫入後續共用訂單資料 |
| `sign` | ✅ | 使用商戶 `secret_key` 計算的 MD5 簽名 |
| `sign_type` | ❌ | 一般為 `MD5` |

目前原始碼會先校驗 `sign`，檢查 API key 白名單，然後用後臺設定補出共用訂單欄位：

- `epay.default_token`
- `epay.default_currency`
- `epay.default_network`

成功後會 302 跳轉到 `/pay/checkout-counter/{trade_id}`。

在目前原始碼中，這條路徑現在是託管收銀臺 SPA 的跳轉入口；真正的收銀臺資料會從 `/pay/checkout-counter-resp/{trade_id}` 取得。

## 4. 回撥行為

### 標準回撥（GMPay / 一般 JSON 流程）

鏈上確認成功後，Epusdt 會向 `notify_url` 發送 **POST JSON**。

重要欄位包括：

- `pid`
- `trade_id`
- `order_id`
- `amount`
- `actual_amount`
- `receive_address`
- `token`
- `block_transaction_id`
- `status`
- `signature`

使用同一商戶的 `secret_key` 驗 `signature`，處理完成後返回純文字 `ok`。

### EPay 回撥

當訂單 `payment_type = Epay` 時，當前 worker 會對 `notify_url` 發起 **GET** 請求，附帶以下查詢引數：

- `pid`
- `trade_no`
- `out_trade_no`
- `type` *（目前固定為 `alipay`，不會沿用建單入站時傳入的 `type`）*
- `name`
- `money`
- `trade_status`
- `sign`
- `sign_type=MD5`

這裡的 `sign` 同樣使用該商戶的 `secret_key` 驗證，成功後返回純文字 `ok`。

要注意：目前原始碼雖然接受入站 EPay `type` 參數，但不會把它寫進後續共用訂單資料。之後 EPay 成功回撥裡送出的 `type` 目前是固定 `alipay`，不是沿用商戶最初傳入的值。

## 5. 切換支付網路

```text
POST /pay/switch-network
```

JSON 範例：

```json
{
  "trade_id": "T2026041612345678",
  "token": "USDT",
  "network": "ethereum"
}
```

這個介面主要給託管收銀臺使用，用來切換到另一個可用的鏈 / 代幣組合。

目前原始碼也接受特殊值 `network=okpay`；此時會建立或重用一筆 OkPay 子訂單，並回傳它的 `payment_url`。

## 6. OkPay 回撥入口

```text
POST /payments/okpay/v1/notify
```

這是目前原始碼中供 OkPay 支付流程使用的伺服器端回撥入口；正常商戶前端不需要直接從瀏覽器呼叫它。
