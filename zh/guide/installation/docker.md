# Docker 部署

本文介绍如何使用 Docker Compose 快速部署 Epusdt。这种方式适合大多数用户：依赖清晰、部署简单、升级方便。

## 前置条件

开始之前，请确认你的服务器已经安装：

- Docker
- Docker Compose

如果尚未安装，可以先参考 Docker 官方文档完成安装。

## Docker 镜像

Epusdt 官方镜像地址：

```bash
ghcr.io/gmwalletapp/epusdt:latest
```

## 部署目录准备

建议先创建一个独立目录保存 `docker-compose.yml` 和 `.env` 文件：

```bash
mkdir -p /opt/epusdt
cd /opt/epusdt
```

## 第一步：创建 `docker-compose.yml`

在部署目录中创建 `docker-compose.yml` 文件：

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: epusdt-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root123456
      MYSQL_DATABASE: epusdt
      MYSQL_USER: epusdt
      MYSQL_PASSWORD: epusdt123456
    command:
      - --default-authentication-plugin=mysql_native_password
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
    volumes:
      - ./data/mysql:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    container_name: epusdt-redis
    restart: always
    command: redis-server --appendonly yes --requirepass redis123456
    volumes:
      - ./data/redis:/data
    ports:
      - "6379:6379"

  epusdt:
    image: ghcr.io/gmwalletapp/epusdt:latest
    container_name: epusdt
    restart: always
    depends_on:
      - mysql
      - redis
    env_file:
      - .env
    ports:
      - "8080:8080"
```

上面的示例包含三个服务：

- `mysql`：用于存储订单和业务数据
- `redis`：用于缓存、队列和任务处理
- `epusdt`：Epusdt 主服务

## 第二步：配置 `.env`

在同一目录下创建 `.env` 文件：

```dotenv
app_name=Epusdt
app_uri=https://pay.example.com

db_type=mysql
db_host=mysql
db_port=3306
db_name=epusdt
db_user=epusdt
db_password=epusdt123456

redis_host=redis
redis_port=6379
redis_password=redis123456
redis_db=0

tron_grid_api_key=your_trongrid_api_key

usdt_rate=1
cny_rate=7.2
order_expiration_time=15
callback_timeout=30

telegram_bot_token=1234567890:AAExampleBotToken1234567890
telegram_bot_admin_id=123456789
```

### `.env` 配置字段说明

下表列出了常用且必须关注的环境变量：

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `app_name` | string | 应用名称，显示在页面或后台中 | `Epusdt` |
| `app_uri` | string | Epusdt 对外访问地址，必须使用公网可访问域名或完整 URL | `https://pay.example.com` |
| `db_type` | string | 数据库类型，可选 `sqlite`、`mysql`、`postgres` | `mysql` |
| `db_host` | string | 数据库主机地址，Docker Compose 中通常填写服务名 | `mysql` |
| `db_port` | int | 数据库端口 | `3306` |
| `db_name` | string | 数据库名称 | `epusdt` |
| `db_user` | string | 数据库用户名 | `epusdt` |
| `db_password` | string | 数据库密码 | `epusdt123456` |
| `redis_host` | string | Redis 主机地址 | `redis` |
| `redis_port` | int | Redis 端口 | `6379` |
| `redis_password` | string | Redis 密码，没有密码时可留空 | `redis123456` |
| `redis_db` | int | Redis 数据库编号 | `0` |
| `tron_grid_api_key` | string | TronGrid API Key，用于查询 TRON/TRC20 链上数据 | `9f6fxxxxxxxxxxxxxxxxxxxx` |
| `usdt_rate` | float | USDT 汇率，通常可设为 `1`，用于业务换算 | `1` |
| `cny_rate` | float | 人民币汇率，用于金额换算 | `7.2` |
| `order_expiration_time` | int | 订单过期时间，单位分钟 | `15` |
| `callback_timeout` | int | 回调超时时间，单位秒 | `30` |
| `telegram_bot_token` | string | Telegram 机器人 Token，用于消息通知和管理功能 | `1234567890:AAExampleBotToken1234567890` |
| `telegram_bot_admin_id` | string/int | Telegram 管理员用户 ID | `123456789` |

### 配置建议

- 如果使用 Docker Compose，`db_host` 和 `redis_host` 直接写服务名即可，例如 `mysql`、`redis`
- `app_uri` 必须与最终访问地址一致，否则回调、跳转或后台访问可能异常
- `tron_grid_api_key` 建议务必填写，否则链上查询稳定性会受影响
- 若你暂时不使用 Telegram 管理功能，可先保留相关字段，后续再补充

## 第三步：启动服务

配置完成后，在当前目录执行：

```bash
docker compose up -d
```

执行成功后，可使用以下命令查看运行状态：

```bash
docker compose ps
```

如果 `mysql`、`redis`、`epusdt` 三个服务都处于运行状态，说明容器已经成功启动。

## 查看日志

如果启动失败，或者想实时查看主服务日志，可以执行：

```bash
docker compose logs -f epusdt
```

你也可以分别检查数据库或 Redis 日志：

```bash
docker compose logs -f mysql
docker compose logs -f redis
```

## 访问服务

默认情况下，上面的示例会将 Epusdt 暴露到主机的 `8080` 端口，因此可以通过以下地址访问：

```text
http://服务器IP:8080
```

如果你已经配置了域名反向代理和 HTTPS，则应通过 `.env` 中设置的 `app_uri` 访问。

管理后台通常可通过以下路径访问：

```text
https://pay.example.com/admin
```

## 更新镜像与服务

后续更新 Epusdt 时，可在部署目录执行：

```bash
docker compose pull && docker compose up -d
```

这条命令会先拉取最新镜像，再以后台方式重建并启动容器。

## 常见问题

### 1. 容器启动后无法访问

请检查：

- 服务器安全组是否放行 `8080` 端口
- 服务器防火墙是否允许访问该端口
- `docker compose ps` 是否显示服务正常运行

### 2. Epusdt 无法连接 MySQL 或 Redis

请检查：

- `.env` 中的主机名是否填写为 Compose 服务名
- 用户名和密码是否与 `docker-compose.yml` 中保持一致
- 容器是否都已成功启动

### 3. 链上支付监听不稳定

通常与 `tron_grid_api_key` 未配置或配置错误有关。请重新生成并确认该值可用。

## 小结

Docker Compose 是最推荐的部署方式之一。你只需要：

1. 创建 `docker-compose.yml`
2. 配置 `.env`
3. 执行 `docker compose up -d`

完成后即可快速运行 Epusdt，并在后续通过 `docker compose pull && docker compose up -d` 轻松升级。
