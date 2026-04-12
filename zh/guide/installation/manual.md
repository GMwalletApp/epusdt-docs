# 手动部署

本文说明如何在普通 Linux 服务器上直接部署 Epusdt，本体服务不依赖文档站、VitePress 或 Cloudflare Pages。

## 前置条件

- 如果准备从源码编译，需要与当前源码仓库 `src/go.mod` 兼容的 Go 工具链（当前为 `Go 1.25.0`）
- 或者直接使用 [GitHub Releases](https://github.com/GMwalletApp/epusdt/releases) 发布包
- 一台 Linux 服务器
- 一个用于收银台和 API 的公网域名，例如 `pay.example.com`
- 生产环境建议使用 Nginx 或其他反向代理提供 HTTPS
- 一个安全的 `api_auth_token`
- 可选但推荐填写 `tron_grid_api_key`

## 1. 准备应用目录

```bash
mkdir -p /opt/epusdt
cd /opt/epusdt
```

可以选择以下两种方式之一安装。

### 方式 A，使用发布包

```bash
wget https://github.com/GMwalletApp/epusdt/releases/latest/download/epusdt_Linux_x86_64.tar.gz -O epusdt.tar.gz

tar -xzf epusdt.tar.gz
rm epusdt.tar.gz
```

### 方式 B，从源码编译

```bash
git clone https://github.com/GMwalletApp/epusdt.git
cd epusdt/src
go build -o /opt/epusdt/epusdt .
cp .env.example /opt/epusdt/.env
```

如果你使用的是发布包，且包内带有 `.env.example`，同样可以复制成 `.env`。如果没有，就手动创建。

## 2. 创建 `.env`

当前源码支持 `sqlite`、`mysql`、`postgres` 三种数据库方案。

最小 SQLite 示例：

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

db_type=sqlite
sqlite_database_filename=
sqlite_table_prefix=

runtime_sqlite_filename=epusdt-runtime.db

queue_concurrency=10
queue_poll_interval_ms=1000
callback_retry_base_seconds=5

tg_bot_token=
tg_proxy=
tg_manage=

api_auth_token=请替换为高强度随机密钥
order_expiration_time=10
order_notice_max_retry=0
forced_usdt_rate=
api_rate_url=
tron_grid_api_key=
```

如果你使用 MySQL：

```dotenv
db_type=mysql
mysql_host=127.0.0.1
mysql_port=3306
mysql_user=your_user
mysql_passwd=your_password
mysql_database=epusdt
mysql_table_prefix=
mysql_max_idle_conns=10
mysql_max_open_conns=100
mysql_max_life_time=6
```

如果你使用 PostgreSQL：

```dotenv
db_type=postgres
postgres_host=127.0.0.1
postgres_port=5432
postgres_user=your_user
postgres_passwd=your_password
postgres_database=epusdt
postgres_table_prefix=
postgres_max_idle_conns=10
postgres_max_open_conns=100
postgres_max_life_time=6
```

> 这里部署的是 Epusdt 支付服务本体，不是 `epusdt-docs` 文档站。

## 3. 先直接启动测试

```bash
chmod +x /opt/epusdt/epusdt
cd /opt/epusdt
./epusdt http start
```

默认会监听 `:8000`。

## 4. 配置 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name pay.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pay.example.com;

    ssl_certificate     /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

重载 Nginx：

```bash
nginx -t && systemctl reload nginx
```

## 5. 用 Supervisor 托管

```ini
[program:epusdt]
process_name=epusdt
directory=/opt/epusdt
command=/opt/epusdt/epusdt http start
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/supervisor/epusdt.log
```

应用配置：

```bash
supervisorctl reread
supervisorctl update
supervisorctl start epusdt
supervisorctl tail epusdt
```

## 6. 验证服务与接入地址

对外接入时，使用你部署后的 Epusdt 域名作为基础地址，例如：

```text
https://pay.example.com
```

创建订单接口例如：

```text
POST /payments/epusdt/v1/order/create-transaction
```

## 注意事项

- 修改 `.env` 后需要重启进程，`supervisorctl restart epusdt`
- 生产环境建议始终放在 HTTPS 反代之后
- `api_auth_token` 必须保密
- `tron_grid_api_key` 推荐配置，可提高链上查询稳定性
