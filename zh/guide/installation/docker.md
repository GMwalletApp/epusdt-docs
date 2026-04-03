# Docker 部署

本文介绍如何使用 Docker Compose 快速部署 Epusdt。这种方式适合大多数用户：依赖清晰、部署简单、升级方便。

## 前置条件

- 已安装 Docker 和 Docker Compose（参考 [Docker 官方文档](https://docs.docker.com/engine/install/)）
- 一个指向服务器的域名（用于收银台页面）
- TronGrid API Key（[前往注册](https://www.trongrid.io/)）

## 第一步：创建工作目录

```bash
mkdir epusdt && cd epusdt
```

## 第二步：创建 `.env` 配置文件

将以下内容保存为 `env`（注意：文件名就是 `env`，没有点，docker-compose 会挂载为 `/app/.env`）：

```dotenv
app_name=epusdt
app_uri=https://pay.example.com
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

# 数据库类型：sqlite（默认）、mysql、postgres
db_type=sqlite

# SQLite 配置（默认，无需额外数据库服务）
sqlite_database_filename=
sqlite_table_prefix=

# MySQL 配置（如需使用 MySQL 请填写）
mysql_host=127.0.0.1
mysql_port=3306
mysql_user=mysql_user
mysql_passwd=mysql_password
mysql_database=database_name
mysql_table_prefix=

# PostgreSQL 配置（如需使用 PostgreSQL 请填写）
postgres_host=127.0.0.1
postgres_port=5432
postgres_user=postgres_user
postgres_passwd=postgres_password
postgres_database=database_name
postgres_table_prefix=

# SQLite 运行时存储
runtime_sqlite_filename=epusdt-runtime.db

# 队列配置
queue_concurrency=10
queue_poll_interval_ms=1000
callback_retry_base_seconds=5

# Telegram 机器人
tg_bot_token=
tg_proxy=
tg_manage=

# API 鉴权 Token（请修改为随机字符串）
api_auth_token=

# 订单配置
order_expiration_time=10
order_notice_max_retry=0
forced_usdt_rate=
api_rate_url=
tron_grid_api_key=
```

**必须修改的字段：**

| 字段 | 说明 |
|------|------|
| `app_uri` | 你的公网域名，例如 `https://pay.example.com` |
| `api_auth_token` | API 鉴权 Token，建议设置为随机字符串 |
| `tron_grid_api_key` | TronGrid API Key，链上监听必需 |
| `tg_bot_token` | Telegram 机器人 Token（推荐） |
| `tg_manage` | Telegram 管理员用户 ID（推荐） |

## 第三步：创建 `docker-compose.yaml`

```yaml
services:
  epusdt:
    image: gmwallet/epusdt:alpine
    restart: always
    volumes:
      - ./env:/app/.env
    ports:
      - "8000:8000"
```

> 默认使用 SQLite，无需额外的数据库或 Redis 服务。如需使用 MySQL 或 PostgreSQL，在 `env` 中修改 `db_type` 并自行配置对应数据库服务。

## 第四步：启动服务

```bash
docker compose up -d
```

查看运行状态：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f epusdt
```

## 第五步：配置反向代理（推荐）

**Nginx 示例：**

```nginx
server {
    listen 443 ssl http2;
    server_name pay.example.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Caddy 示例（自动 HTTPS）：**

```
pay.example.com {
    reverse_proxy 127.0.0.1:8000
}
```

## 配置说明

| 字段 | 说明 | 是否必须 |
|------|------|----------|
| `app_uri` | 公网访问域名 | ✅ |
| `api_auth_token` | API 鉴权 Token | ✅ |
| `tg_bot_token` | Telegram 机器人 Token | 推荐 |
| `tg_manage` | Telegram 管理员 ID | 推荐 |
| `tron_grid_api_key` | TronGrid API Key | 推荐 |
| `db_type` | 数据库类型（sqlite/mysql/postgres） | 可选 |
| `order_expiration_time` | 订单过期时间（分钟，默认 10） | 可选 |
| `forced_usdt_rate` | 强制指定汇率 | 可选 |
| `api_rate_url` | 自定义汇率 API | 可选 |

## 更新

```bash
docker compose pull && docker compose up -d
```

## 常见问题

### 容器启动失败

查看日志排查：

```bash
docker compose logs epusdt
```

### 端口冲突

修改 `docker-compose.yaml` 中的端口映射：

```yaml
ports:
  - "9000:8000"
```

### 使用 MySQL 或 PostgreSQL

在 `env` 中修改 `db_type` 为 `mysql` 或 `postgres`，并填写对应数据库配置字段。如使用 Docker Compose 管理数据库，`db_host` 填写服务名即可。
