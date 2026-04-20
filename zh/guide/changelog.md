# 版本日志

本文基于 `GMwalletApp/epusdt` 仓库中实际存在的 GitHub Releases、Tag、Release Note 和代码差异整理，不凭空编写未发布特性。

## v0.0.8

- 发布标签：`v0.0.8`
- 发布时间：`2026-04-15T10:44:56Z`
- 官方发布说明：`- Enable polygon,plasma supports`

### 用户可见变更

- 新增 `polygon` 与 `plasma` 网络支持
- 支付页的网络选择逻辑有调整
- EVM 钱包地址存储逻辑得到修正

### 部署与配置变更

- 发布说明与对比差异中未见明确新增的环境变量

### 接口变更

- 官方发布说明中未明确声明新的公共 API 路由
- 支持网络相关能力延续自 `v0.0.7` 这一轮开发

### 依据

- GitHub Release `v0.0.8`
- 对比差异 `v0.0.7...v0.0.8`
- 提交 `f7c5f67`、`097c716`

## v0.0.7

- 发布标签：`v0.0.7`
- 发布时间：`2026-04-15T06:00:55Z`
- 官方发布说明：`suport bsc, plasma, polygon......` + `support epay submit form params` + `Dev payment`

### 用户可见变更

- 新增 `bsc`、`polygon`、`plasma` 网络支持
- 新增 EPay 兼容 submit form 参数，提升对接兼容性
- Telegram 交互与支付相关处理在这一轮支付开发中有更新

### 部署与配置变更

- 支持网络的这一轮开发在源码中新增了多条 EVM 监听路径
- 官方发布说明中未明确给出新的 `.env` 变量

### 接口变更

- 源码历史中可见 supported-chain / supported-asset 相关接口能力
- 路由层更新了 EPay 兼容提交流程，对 `GET` 和 `POST` 方式都提供支持

### 依据

- GitHub Release `v0.0.7`
- 对比差异 `v0.0.6...v0.0.7`
- 提交 `9c003fb`、`8cd816c`、`786c5e8`、`70f8ed4`

## v0.0.6

- 发布标签：`v0.0.6`
- 发布时间：`2026-04-12T20:06:08Z`
- 官方发布说明：对比 `v0.0.5...v0.0.6`

### 用户可见变更

- Hosted checkout 改为两步支付流程
- 支持多网络支付切换
- Solana 扫链支持 `USDT` 与 `USDC`
- 新增 Ethereum ERC-20 的 `USDT` 与 `USDC` 扫链能力
- Telegram 支付通知新增网络信息
- Telegram 钱包地址校验增强，适配多网络地址

### 部署与配置变更

- 新增 `solana_rpc_url`
- 新增 `ethereum_ws_url`
- 新增 `epay_pid`
- 新增 `epay_key`
- 订单锁定与金额匹配逻辑加入 `network` 维度

### 接口变更

- 新增钱包管理接口 `/payments/gmpay/v1/wallet/*`
- 新增 `POST /pay/switch-network`
- 新增 EPay 兼容入口 `GET /payments/epay/v1/order/create-transaction/submit.php`
- checkout 返回结构新增 `is_selected`
- 下单流程新增可选字段 `name` 与 `payment_type`
- 当前源码的网络标识使用小写值，例如 `tron`、`solana`、`ethereum`

### 依据

- GitHub Release `v0.0.6`
- 对比差异 `v0.0.5...v0.0.6`
- 提交 `3f071e6`、`32ca778`、`5e4d5df`

## v0.0.5

- 发布标签：`v0.0.5`
- 发布时间：`2026-04-03T17:05:30Z`
- 官方发布说明：`test: fix macOS path assertion and wallet address unique index`

### 用户可见变更

- 官方发布说明里没有明确的终端用户新功能

### 部署与配置变更

- 官方发布说明里没有明确的新部署变量

### 接口变更

- 代码历史可见钱包地址唯一索引相关调整

### 依据

- GitHub Release `v0.0.5`
- 对比差异 `v0.0.4...v0.0.5`

## v0.0.4

- 发布标签：`v0.0.4`
- 发布名：`New UI Update`
- 发布时间：`2026-04-03T16:05:23Z`
- 官方发布说明：`feat: change payment ui`

### 用户可见变更

- 支付 UI 更新

### 部署与配置变更

- 发布说明中未声明部署侧变化

### 接口变更

- 发布说明中未声明接口侧变化

### 依据

- GitHub Release `v0.0.4`
- 官方发布说明正文
