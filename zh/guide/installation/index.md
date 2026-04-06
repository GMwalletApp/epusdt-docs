# 安装概览

Epusdt 提供多种部署方式。对绝大多数用户来说，**Docker 部署**是最省事、也最稳妥的起点。

## 推荐部署方式

### 1. Docker 部署

**适合大多数用户。**

适合这些场景：

- 希望快速上线
- 希望运行环境隔离清晰
- 后续升级尽量简单
- 希望生产环境结构更稳定

→ [查看 Docker 部署指南](/zh/guide/installation/docker)

### 2. 宝塔面板部署

**适合习惯面板化运维的用户。**

适合这些场景：

- 喜欢图形化管理网站和数据库
- 需要方便地配置 SSL 和反向代理
- 已经在用宝塔管理服务器

→ [查看宝塔面板部署指南](/zh/guide/installation/baota)

### 3. 手动部署

**适合希望完全掌控环境的运维或开发者。**

适合这些场景：

- 需要源码构建
- 需要自己接 systemd / supervisor
- 需要与现有 Linux 运维体系深度整合

→ [查看手动部署指南](/zh/guide/installation/manual)

### 4. Cloudflare Pages 部署

**仅用于部署文档站。**

Cloudflare Pages 可以托管静态的 `epusdt-docs` 文档站。

> 它**不能**用来运行 Epusdt 支付服务本体。

→ [查看 Cloudflare Pages 指南](/zh/guide/installation/cloudflare)

## 部署前先准备这些信息

- Epusdt 对外访问使用的域名或服务器地址
- TronGrid API Key
- 如果使用 MySQL 或 PostgreSQL，对应的数据库连接信息
- 一个 `api_auth_token`
- 可选的 Telegram Bot Token 和管理员 ID

## 重要说明

### `app_uri` 是公网地址，不是路由前缀

当前源码里，Epusdt 的实际路由是直接挂在根路径下的，例如：

- `/payments/epusdt/v1/order/create-transaction`
- `/payments/gmpay/v1/order/create-transaction`
- `/pay/checkout-counter/:trade_id`
- `/pay/check-status/:trade_id`

`app_uri` 的作用，是让程序生成对外可访问的绝对地址，尤其是收银台链接。它**不会**让应用自动挂载到 `/xxx` 这样的子路径下。

如果你想把 Epusdt 放在 `/epusdt` 之类的子路径后面，需要由 Nginx、Caddy、Ingress 等反向代理自己处理重写和转发。

### API 路径和收银台路径要分开理解

部署时最容易混淆的是这两组路径：

- **创建订单 API**：`/payments/...`
- **收银台页面**：`/pay/...`

`/pay/...` 不是下单接口。

## 常见核心配置项

| 配置项 | 说明 |
|-----|-------------|
| `app_name` | 后台显示的应用名称 |
| `app_uri` | 用于生成收银台绝对链接的公网地址 |
| `http_listen` | HTTP 监听地址，默认 `:8000` |
| `db_type` | `sqlite`、`mysql` 或 `postgres` |
| `db_*` | 数据库连接配置 |
| `tron_grid_api_key` | TronGrid API 凭证 |
| `api_auth_token` | API 签名 / 鉴权密钥 |
| `order_expiration_time` | 未支付订单过期分钟数 |
| `callback_retry_base_seconds` | 回调重试的基础延迟 |
| `order_notice_max_retry` | 首次失败后的额外回调重试次数 |

## 该怎么选？

- **全新部署** → Docker
- **服务器本来就用宝塔** → 宝塔面板
- **需要自定义 Linux 运行方式** → 手动部署
- **只是公开托管文档站** → Cloudflare Pages
