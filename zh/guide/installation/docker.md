# Docker 部署

本文说明如何使用 Docker Compose 部署 Epusdt。

## 官方 Docker 方案实际做了什么

官方源码仓库里已经包含一个 `docker-compose.yaml` 示例，核心行为是：

- 使用 `gmwallet/epusdt:alpine`
- 把宿主机上的 `env` 文件挂载到容器内 `/app/.env`
- 对外暴露容器的 `8000` 端口

应用默认读取 `.env` 配置文件。Docker 场景下，官方文档采用的是“宿主机文件名叫 `env`，挂载后在容器内变成 `/app/.env`”的方式。

## 前置条件

- 已安装 Docker 和 Docker Compose
- 一个用于对外访问 Epusdt 的域名或服务器地址
- TronGrid API Key
- 一个 `api_auth_token`
- 可选的 Telegram 机器人配置

## 第一步：创建工作目录

```shell
mkdir epusdt && cd epusdt
```

## 第二步：创建配置文件

在当前目录保存一个名为 `env` 的文件：

```shell
cat <<EOF > env
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

# supported values: postgres,mysql,sqlite
db_type=sqlite

# sqlite primary database config
sqlite_database_filename=
sqlite_table_prefix=

# postgres config
postgres_host=127.0.0.1
postgres_port=3306
postgres_user=mysql_user
postgres_passwd=mysql_password
postgres_database=database_name
postgres_table_prefix=
postgres_max_idle_conns=10
postgres_max_open_conns=100
postgres_max_life_time=6

# mysql config
mysql_host=127.0.0.1
mysql_port=3306
mysql_user=mysql_user
mysql_passwd=mysql_password
mysql_database=database_name
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

api_auth_token=

order_expiration_time=10
order_notice_max_retry=0
forced_usdt_rate=
api_rate_url=
tron_grid_api_key=
EOF
```

### 至少要重点检查这些字段

| 字段 | 作用 |
|-----|------|
| `app_uri` | 用来生成对外可访问的收银台链接 |
| `api_auth_token` | API 请求签名 / 鉴权所需 |
| `tron_grid_api_key` | 建议填写，便于稳定查询 TRON / TRC20 |
| `db_type` | 默认是 `sqlite`，只有真的用 MySQL / PostgreSQL 时再改 |
| `tg_bot_token` / `tg_manage` | 可选，但如果要用 Telegram 管理会很方便 |

## 第三步：创建 `docker-compose.yaml`

```shell
cat <<EOF > docker-compose.yaml
services:
  epusdt:
    image: gmwallet/epusdt:alpine
    restart: always
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ./env:/app/.env
    ports:
      - "8000:8000"
EOF
```

## 第四步：启动服务

```shell
docker compose up -d
```

查看状态：

```shell
docker compose ps
```

查看日志：

```shell
docker compose logs -f epusdt
```

## 端口暴露与反向代理

默认情况下，程序在容器内监听 `:8000`，Compose 示例把它映射成 `8000:8000`。

这意味着：

- 你可以直接通过宿主机的 `8000` 端口访问服务
- 也可以在前面再挂 Nginx、Caddy 等反向代理

### Nginx 示例

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

### Caddy 示例

```text
pay.example.com {
    reverse_proxy 127.0.0.1:8000
}
```

## API 路径和收银台路径不要混淆

当前源码里，常见路径是：

- 创建订单 API：`/payments/epusdt/v1/order/create-transaction`
- 收银台页面：`/pay/checkout-counter/:trade_id`
- 收银台轮询接口：`/pay/check-status/:trade_id`

`app_uri` 会参与生成类似下面这样的收银台链接：

```text
https://pay.example.com/pay/checkout-counter/{trade_id}
```

它**不是**应用内部的路由前缀。

## 子路径部署注意事项

当前源码注册的路由都是根路径形式，例如 `/payments/...`、`/pay/...`。

如果你想把 Epusdt 挂到 `https://example.com/epusdt/` 这种子路径下面，单靠 Docker 本身不会自动适配。你需要在反向代理里自己做重写 / 转发，并同时验证 API 和收银台页面是否都正常。

如果你希望部署最省心，建议直接使用独立域名或子域名，例如：

- `https://pay.example.com`

## 如何验证安装成功

比较实用的验证顺序：

1. 先确认容器正常运行
2. 打开 `http://服务器IP:8000/` 或你的反向代理域名，确认服务有响应
3. 对 `/payments/epusdt/v1/order/create-transaction` 发起一笔测试下单
4. 检查返回的 `payment_url` 是否指向你配置的公网域名下的 `/pay/checkout-counter/{trade_id}`

## 更新

```shell
docker compose pull
docker compose up -d
```

## 常见问题

### 容器启动了，但读到的配置不对

确认挂载写法必须是：

```yaml
volumes:
  - ./env:/app/.env
```

应用默认在容器里查找 `.env`，除非你额外指定了其它配置路径。

### 宿主机的 8000 端口已被占用

改宿主机侧端口映射即可，例如：

```yaml
ports:
  - "9000:8000"
```

容器内仍然监听 `8000`，变的只是宿主机侧端口。

### MySQL 或 PostgreSQL 连不上

在 Docker 容器里，`127.0.0.1` 指向的是容器自己，不是宿主机数据库。

如果数据库跑在另一个容器里，主机名应填对应的服务名；如果数据库跑在宿主机上，就要改成容器可访问到的宿主机地址。

### 改了 `static_path` 或 `runtime_root_path` 后出现异常

`static_path` 控制的是静态资源 URL 路径，`runtime_root_path` 控制的是运行时文件存储位置。它们不是“站点部署基路径”配置，不要拿它们去替代子路径部署设置。
