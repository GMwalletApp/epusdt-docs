# 手动部署

本文介绍如何从源码编译并手动部署 Epusdt，适合需要完全掌控构建、配置和服务管理的用户。

## 前置条件

- **Go 1.16+**（[安装 Go](https://go.dev/doc/install)）
- **Git**
- **MySQL** 或 **PostgreSQL**（可选 — 默认使用 SQLite，无需额外数据库）
- 一台 Linux 服务器（生产环境推荐）
- 一个指向服务器的公网域名
- TronGrid API Key（[前往注册](https://www.trongrid.io/)）

## 一、克隆源码并编译

```bash
git clone https://github.com/GMwalletApp/epusdt.git
cd epusdt/src
```

编译：

```bash
go build -o ../epusdt .
```

编译完成后，`epusdt` 二进制文件会生成在项目根目录。

::: tip
也可以直接从 [GitHub Releases](https://github.com/GMwalletApp/epusdt/releases) 下载预编译的二进制文件，跳过编译步骤。
:::

## 二、配置 `.env`

复制示例配置文件并编辑：

```bash
cd ..
cp src/.env.example .env
```

打开 `.env`，根据实际环境修改。以下是完整的配置示例：

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

# SQLite 配置
sqlite_database_filename=
sqlite_table_prefix=

# PostgreSQL 配置
postgres_host=127.0.0.1
postgres_port=5432
postgres_user=epusdt
postgres_passwd=change-this-db-password
postgres_database=epusdt
postgres_table_prefix=
postgres_max_idle_conns=10
postgres_max_open_conns=100
postgres_max_life_time=6

# MySQL 配置
mysql_host=127.0.0.1
mysql_port=3306
mysql_user=epusdt
mysql_passwd=change-this-db-password
mysql_database=epusdt
mysql_table_prefix=
mysql_max_idle_conns=10
mysql_max_open_conns=100
mysql_max_life_time=6

# 运行时 SQLite 存储
runtime_sqlite_filename=epusdt-runtime.db

# 队列配置
queue_concurrency=10
queue_poll_interval_ms=1000
callback_retry_base_seconds=5

# Telegram 机器人
tg_bot_token=
tg_proxy=
tg_manage=

# API 鉴权 Token（务必修改为随机字符串！）
api_auth_token=replace-with-a-long-random-secret

# 订单配置
order_expiration_time=10
order_notice_max_retry=0
forced_usdt_rate=
usdt_rate=
cny_rate=
callback_timeout=30
api_rate_url=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/
tron_grid_api_key=replace-with-your-trongrid-api-key
```

### 必须修改的字段

- `app_uri` — 你的公网访问域名
- `api_auth_token` — API 鉴权密钥
- `tron_grid_api_key` — TronGrid API Key

### 数据库说明

- **SQLite**（默认）：无需安装额外数据库服务，最简单的选择
- **MySQL**：将 `db_type` 改为 `mysql`，并填写 `mysql_*` 相关字段
- **PostgreSQL**：将 `db_type` 改为 `postgres`，并填写 `postgres_*` 相关字段

完整配置字段说明请参考 [Docker 部署 — 配置说明](/zh/guide/installation/docker#配置说明)。

## 三、前台测试启动

赋予执行权限并启动：

```bash
chmod +x epusdt
./epusdt http start
```

启动成功后，可以通过以下地址验证服务是否正常运行：

- `http://your-server:8000` — 收银台页面
- `http://your-server:8000/admin` — 管理后台

确认功能正常后，按 `Ctrl+C` 停止前台进程，继续配置 systemd 进行后台托管。

## 四、配置 systemd 开机自启

生产环境建议使用 systemd 管理 Epusdt 进程，实现开机自启和异常自动重启。

创建服务文件：

```bash
sudo nano /etc/systemd/system/epusdt.service
```

写入以下内容：

```ini
[Unit]
Description=Epusdt USDT Payment Middleware
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/epusdt
ExecStart=/opt/epusdt/epusdt http start
Restart=always
RestartSec=5
Environment=TZ=UTC

[Install]
WantedBy=multi-user.target
```

::: warning
请根据实际部署路径调整 `WorkingDirectory` 和 `ExecStart`。`.env` 文件必须位于工作目录中。
:::

启用并启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable epusdt
sudo systemctl start epusdt
```

查看服务状态：

```bash
sudo systemctl status epusdt
```

查看实时日志：

```bash
sudo journalctl -u epusdt -f
```

## 五、配置 Nginx 反向代理

生产环境建议通过 Nginx 反向代理对外提供 HTTPS 访问，而不是直接暴露应用端口。

创建 Nginx 配置文件（例如 `/etc/nginx/sites-available/epusdt`）：

```nginx
server {
    listen 80;
    server_name pay.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pay.example.com;

    ssl_certificate     /etc/letsencrypt/live/pay.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pay.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用站点并重载 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/epusdt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

确保 `.env` 中的 `app_uri` 使用 HTTPS 地址：

```dotenv
app_uri=https://pay.example.com
```

然后重启服务：

```bash
sudo systemctl restart epusdt
```

## 六、更新程序

源码构建方式的更新流程：

```bash
cd /opt/epusdt
sudo systemctl stop epusdt

# 拉取最新代码并重新编译
git pull
cd src && go build -o ../epusdt . && cd ..

sudo systemctl start epusdt
```

也可以直接从 [GitHub Releases](https://github.com/GMwalletApp/epusdt/releases) 下载新版本二进制文件替换后重启服务。

## 常见问题

### 二进制文件无法启动

确认已赋予执行权限：

```bash
chmod +x epusdt
```

确认 `.env` 文件与二进制文件在同一目录中。

### Nginx 返回 502 Bad Gateway

确认 Epusdt 正在监听预期端口：

```bash
sudo systemctl status epusdt
sudo journalctl -u epusdt -f
```

### Telegram 机器人无响应

请检查：

- `tg_bot_token` 是否正确
- `tg_manage` 是否为你的 Telegram 数字用户 ID
- 如果服务器无法直接访问 `api.telegram.org`，需要设置 `tg_proxy`

### TRC20 支付未被检测到

确认 `tron_grid_api_key` 已填写且有效。没有可用的 API Key，Epusdt 无法监控 TRC20 链上交易。
