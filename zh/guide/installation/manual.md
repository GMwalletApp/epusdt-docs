# 手动部署

本文说明如何不用 Docker、也不用宝塔，直接从源码构建并手动部署 Epusdt。

## 前置条件

- **与当前源码仓库 `src/go.mod` 兼容的 Go 工具链**（本次审阅时为 **Go 1.25.0**）
- **Git**
- 一台 Linux 服务器
- 生产环境建议准备 **Nginx** 或其他反向代理
- 一个已解析到服务器的公网域名
- 有效的 **TronGrid API Key**

当前源码支持的数据库方案：

- **SQLite**：默认、最简单
- **MySQL**：可选
- **PostgreSQL**：可选

::: warning
当前源码 **不依赖 Redis**，也不以“手工导入 SQL”作为标准安装步骤。应用启动时会自动完成表迁移。
:::

## 一、克隆源码

```bash
git clone https://github.com/GMwalletApp/epusdt.git
cd epusdt/src
```

## 二、编译二进制

```bash
go build -o ../epusdt .
```

编译后文件位于：

```text
epusdt/epusdt
```

::: tip
如果你不想自己编译，也可以使用官方发布的预编译二进制。
:::

## 三、创建 `.env`

在项目根目录执行：

```bash
cd ..
cp src/.env.example .env
```

然后编辑 `.env`：

```dotenv
app_name=epusdt
app_uri=https://pay.example.com
log_level=info
http_access_log=false
sql_debug=false
http_listen=:8000

static_path=/static
runtime_root_path=runtime
log_save_path=logs
log_max_size=32
log_max_age=7
max_backups=3

# supported values: postgres,mysql,sqlite
db_type=sqlite

# sqlite primary database config
sqlite_database_filename=
sqlite_table_prefix=

# postgres config
postgres_host=127.0.0.1
postgres_port=5432
postgres_user=epusdt
postgres_passwd=change-this-db-password
postgres_database=epusdt
postgres_table_prefix=
postgres_max_idle_conns=10
postgres_max_open_conns=100
postgres_max_life_time=6

# mysql config
mysql_host=127.0.0.1
mysql_port=3306
mysql_user=epusdt
mysql_passwd=change-this-db-password
mysql_database=epusdt
mysql_table_prefix=
mysql_max_idle_conns=10
mysql_max_open_conns=100
mysql_max_life_time=6

# sqlite runtime store config
runtime_sqlite_filename=epusdt-runtime.db

# background scheduler config
queue_concurrency=10
queue_poll_interval_ms=1000
callback_retry_base_seconds=5

tg_bot_token=
tg_proxy=
tg_manage=

api_auth_token=replace-with-a-long-random-secret
order_expiration_time=10
order_notice_max_retry=0
forced_usdt_rate=
api_rate_url=
tron_grid_api_key=replace-with-your-trongrid-api-key
```

至少重点确认这些字段：

- `app_uri`：最终公网 HTTPS 地址
- `api_auth_token`：商户 API 请求签名密钥
- `tron_grid_api_key`：TRON / TRC20 监听必需
- `db_type`：数据库类型

## 四、运行时和数据库说明

### 静态资源

建议把 `epusdt`、`.env`、`static/` 放在同一级目录。默认情况下，应用会从 `./static` 提供静态资源。

### SQLite

如果使用 `db_type=sqlite`：

- 不需要单独安装数据库服务
- 一般不需要手工导入表结构
- 应用启动时会自动建表/迁移
- 运行用户必须有写入数据文件和 runtime 目录的权限

### MySQL / PostgreSQL

如果使用 `db_type=mysql` 或 `db_type=postgres`：

- 填写对应数据库连接字段
- 确保数据库服务可达
- 即使主数据库不是 SQLite，运行时锁仍通过 `runtime_sqlite_filename` 使用独立 SQLite 文件

### 路径规则

`runtime_root_path`、`log_save_path` 以及显式指定的 SQLite 文件路径，都可以写相对路径或绝对路径：

- 相对路径：以 `.env` 所在目录为基准
- 绝对路径：必须确保运行用户可写

## 五、前台测试启动

在项目根目录执行：

```bash
chmod +x epusdt
./epusdt http start
```

可先访问：

- `http://127.0.0.1:8000/`

确认能正常启动后，按 `Ctrl+C` 停止，再配置 systemd。

## 六、配置 systemd

创建 `/etc/systemd/system/epusdt.service`：

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
`WorkingDirectory` 中应包含 `.env`、`epusdt` 和 `static/`，除非你已明确改成自定义路径。
:::

启用并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable epusdt
sudo systemctl start epusdt
```

排查常用命令：

```bash
sudo systemctl status epusdt
sudo journalctl -u epusdt -f
```

## 七、配置 Nginx 反向代理

生产环境建议通过 HTTPS 域名访问，并反代到本地端口。

示例配置：

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

重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

注意：

- `app_uri` 必须和最终公网地址一致
- 最稳妥的是根路径部署
- 如果你硬要挂子目录，需要由反向代理正确改写路径，因为应用本身注册的是 `/`、`/pay/...`、`/payments/...`

## 八、更新服务

源码部署的更新流程：

```bash
cd /opt/epusdt
sudo systemctl stop epusdt
git pull
cd src && go build -o ../epusdt . && cd ..
sudo systemctl start epusdt
```

如果你用的是发布版二进制，替换文件后重启服务即可。

## 常见问题

### 服务启动失败

请检查：

- 工作目录里是否存在 `.env`
- `ExecStart` 是否包含 `http start`
- `static/` 是否在应用预期位置
- runtime 和日志路径是否可写

### Nginx 返回 502 Bad Gateway

请检查：

- Epusdt 是否成功监听配置端口
- Nginx 反代端口是否与 `http_listen` 一致
- `journalctl` 中是否有启动报错

### 支付一直不确认

请检查：

- `tron_grid_api_key` 是否已配置
- 钱包地址是否已正确添加
- 服务器是否能访问外部 TRON / HTTP API
- 测试流程是否符合当前支持的 TRON / TRC20 支付路径

### 回调重试和预期不一致

当前回调重试行为由配置决定，重点看：

- `order_notice_max_retry`
- `callback_retry_base_seconds`
- 商户回调接口是否返回 HTTP `200` 且响应体严格为 `ok`
