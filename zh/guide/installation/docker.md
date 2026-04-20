# Docker 部署（推荐）

本教程使用 Docker Compose 方式运行 Epusdt，适合大多数场景，是最简单的部署方式。

## 前置条件

- 已安装 Docker 和 Docker Compose

## 步骤

### 1. 创建目录

```bash
mkdir epusdt && cd epusdt
```

### 2. 创建 `.env` 配置文件

将以下内容写入 `env` 文件，**必须修改**的项目已标注：

```bash
cat <<EOF > env
app_name=epusdt
# ⚠️ 必填：你的收银台域名
app_uri=https://your-domain.com
log_level=info
http_access_log=false
sql_debug=false
http_listen=:8000

static_path=/static
runtime_root_path=/runtime

log_save_path=/logs
log_max_size=32
log_max_age=7
max_backups=3

# 数据库类型：支持 postgres / mysql / sqlite（默认 sqlite）
db_type=sqlite

# SQLite 配置（使用 sqlite 时生效）
sqlite_database_filename=
sqlite_table_prefix=

# MySQL 配置（使用 mysql 时填写）
mysql_host=127.0.0.1
mysql_port=3306
mysql_user=mysql_user
mysql_passwd=mysql_password
mysql_database=database_name
mysql_table_prefix=
mysql_max_idle_conns=10
mysql_max_open_conns=100
mysql_max_life_time=6

# 运行时 SQLite
runtime_sqlite_filename=epusdt-runtime.db

# 队列配置
queue_concurrency=10
queue_poll_interval_ms=1000
callback_retry_base_seconds=5

# Telegram 机器人（选填）
tg_bot_token=
tg_proxy=
tg_manage=

# ⚠️ 必填：API 认证 token，用于签名验证，请勿泄露
api_auth_token=

# 订单过期时间（分钟）
order_expiration_time=10
order_notice_max_retry=0
forced_usdt_rate=

# ⚠️ 推荐填写：汇率接口 URL（动态获取汇率）
api_rate_url=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/

tron_grid_api_key=
# 选填，可在 https://www.trongrid.io/ 申请 API Key，提高 TRON 网络请求稳定性
EOF
```

### 3. 创建 `docker-compose.yaml`

```bash
cat <<EOF > docker-compose.yaml
services:
  epusdt:
    image: gmwallet/epusdt:alpine
    restart: always
    volumes:
      - ./env:/app/.env
    ports:
      - "8000:8000"
EOF
```

### 4. 启动服务

```bash
docker compose up -d
```

### 5. 配置独角数卡后台

在独角数卡后台支付插件中填写：

| 配置项 | 值 |
|--------|-----|
| 商户密钥 | `api_auth_token` 的值 |
| API 地址 | `https://your-domain.com/payments/epusdt/v1/order/create-transaction` |

> 💡 如果独角数卡和 Epusdt 在同一服务器，可用 `http://127.0.0.1:8000/payments/epusdt/v1/order/create-transaction`

## 注意事项

- 修改 `.env` 配置后需重启容器：`docker compose restart`
- `api_auth_token` 是 API 签名密钥，请妥善保管
