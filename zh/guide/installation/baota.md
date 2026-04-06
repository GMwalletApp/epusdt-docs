# 宝塔面板部署

本文基于当前源码，说明如何在 **宝塔（BaoTa / 宝塔面板）** 环境下部署 Epusdt。

> 如果你更倾向于 Docker 或纯命令行方式，请参考 [Docker 部署](/zh/guide/installation/docker) 或 [手动部署](/zh/guide/installation/manual)。

## 前置条件

开始前请准备：

- 一台已安装 **宝塔面板** 的 Linux 服务器
- 宝塔中已安装 **Nginx**
- 宝塔中已安装 **Supervisor**
- 已解析到服务器的公网域名
- 有效的 **TronGrid API Key**
- 已编译好的 `epusdt` 二进制文件，或官方发布包

如果你准备先自行编译再上传到宝塔，请使用与当前源码仓库 `src/go.mod` 兼容的 Go 版本（本次审阅时为 **Go 1.25.0**）。

当前源码支持的数据库方案：

- **SQLite**：最简单，不需要额外数据库服务
- **MySQL**：可选
- **PostgreSQL**：可选

::: warning
当前源码 **不需要 Redis**，正常部署场景下也**不需要手工导入 SQL 表结构**。应用首次启动时会自动建表/迁移。
:::

## 部署结构

宝塔环境下的典型结构：

- 宝塔 **Nginx** 负责公网 HTTP/HTTPS
- Epusdt 监听 `127.0.0.1:8000`
- 宝塔 **Supervisor** 守护进程
- SQLite 或外部 SQL 数据库存储业务数据
- 运行时目录和日志目录默认相对 `.env` 所在目录创建

目录示例：

```text
/www/wwwroot/pay.example.com/
├── epusdt
├── .env
├── static/
└── runtime/
```

## 第一步：在宝塔中添加站点

进入 **网站**：

1. 点击 **添加站点**
2. 绑定支付域名，例如 `pay.example.com`
3. 站点类型用静态/默认站点即可，最终由反向代理转发给 Epusdt
4. 如果你准备用 MySQL，也可以顺手创建数据库

## 第二步：上传程序

将 Epusdt 二进制文件或发布包上传到站点目录，例如：

```text
/www/wwwroot/pay.example.com/
```

赋予执行权限：

```bash
chmod +x /www/wwwroot/pay.example.com/epusdt
```

::: tip
建议把 `.env`、`epusdt` 和 `static/` 目录放在同一级。默认情况下，服务会从工作目录读取 `.env`，并从 `./static` 提供静态资源。
:::

## 第三步：准备 `.env`

在二进制同目录创建或编辑 `.env`：

```dotenv
app_name=epusdt
app_uri=https://pay.example.com
http_listen=:8000

static_path=/static
runtime_root_path=runtime
log_save_path=logs

# supported values: sqlite, mysql, postgres
db_type=sqlite

# SQLite 主数据库文件（留空时默认使用 runtime/store.sqlite）
sqlite_database_filename=
runtime_sqlite_filename=epusdt-runtime.db

# MySQL 示例
# db_type=mysql
# mysql_host=127.0.0.1
# mysql_port=3306
# mysql_user=epusdt
# mysql_passwd=change-this-db-password
# mysql_database=epusdt

# PostgreSQL 示例
# db_type=postgres
# postgres_host=127.0.0.1
# postgres_port=5432
# postgres_user=epusdt
# postgres_passwd=change-this-db-password
# postgres_database=epusdt

api_auth_token=replace-with-a-long-random-secret
tron_grid_api_key=replace-with-your-trongrid-api-key
order_expiration_time=10

# Telegram 机器人（可选）
tg_bot_token=
tg_proxy=
tg_manage=
```

生产环境至少重点确认：

- `app_uri`：最终公网 HTTPS 域名
- `api_auth_token`：商户 API 签名密钥
- `tron_grid_api_key`：TRON / TRC20 监听所需
- `db_type`：如果不是 SQLite，就要配套填写数据库连接信息

## 第四步：数据库说明

### SQLite

单机部署优先推荐 SQLite。

- 一般不需要手动导入表结构
- 应用启动时会自动迁移表
- 主业务数据和运行时锁都会写入 SQLite 文件
- 需要保证服务用户对程序目录有写权限

### MySQL / PostgreSQL

如果你更想用外部数据库：

- 将 `db_type` 改为 `mysql` 或 `postgres`
- 填写对应连接字段
- 确保宝塔服务器能连通数据库服务
- 即使主库使用 MySQL / PostgreSQL，运行时锁仍会通过 `runtime_sqlite_filename` 使用 SQLite

## 第五步：配置反向代理

Epusdt 自带 HTTP 服务，宝塔需要把流量反代到它。

在站点设置中新增反向代理，目标地址填：

```text
http://127.0.0.1:8000
```

建议同时注意：

- 对外站点启用 HTTPS
- `app_uri` 必须与最终访问地址完全一致
- 除非你明确做了路径改写，否则不要把 Epusdt 挂在子目录下

如果你会直接编辑宝塔生成的 Nginx 配置，建议保留这些标准头：

- `Host`
- `X-Real-IP`
- `X-Forwarded-For`
- `X-Forwarded-Proto`

## 第六步：添加 Supervisor 守护进程

在宝塔 **Supervisor** 中新增任务。

工作目录：

```text
/www/wwwroot/pay.example.com/
```

启动命令：

```bash
/www/wwwroot/pay.example.com/epusdt http start
```

::: warning
当前源码的标准启动方式是 `http start`。除非你的发布包明确说明可直接执行，否则不要只写 `./epusdt`。
:::

## 第七步：启动并验证

保存任务后：

1. 启动进程
2. 打开 `https://pay.example.com/`
3. 若启动失败，查看 Supervisor 日志或应用日志
4. 后续真实收银台页面会出现在 `/pay/...`

可用性检查建议：

- 根路径 `/` 应能正常响应
- 收银台页面走 `/pay/...`
- API 路由走 `/payments/...`

## 宝塔环境加固建议

- 开启 SSL 证书自动续期
- 禁止 Web 直接访问 `.env`
- 程序目录只给运行用户必要写权限
- 定期备份数据库文件或外部数据库
- 关注回调失败和链上轮询相关日志

## 常见问题

### 502 Bad Gateway

通常表示 Nginx 连不到 Epusdt。请检查：

- Supervisor 进程是否在运行
- 启动命令是否为 `epusdt http start`
- `http_listen` 是否与反代目标一致
- 进程是否能从工作目录读取 `.env`

### 改了路径后启动失败

重点检查这些路径是否存在且可写：

- `runtime_root_path`
- `log_save_path`
- `sqlite_database_filename`（如果你手动指定了）

相对路径会以 `.env` 所在目录为基准解析。

### 订单创建成功但支付始终不确认

请检查：

- 钱包地址是否已正确添加
- 你的业务接入是否按 TRON / TRC20 USDT 流程使用
- `tron_grid_api_key` 是否有效
- 服务器是否能访问外部 TRON / HTTP API

### 回调一直失败

请检查：

- `notify_url` 是否公网可达
- 商户回调接口是否返回 HTTP `200` 且响应体严格为 `ok`
- 反向代理或 TLS 配置是否影响应用向外回调

## 下一步

- [配置独角数卡集成](/zh/guide/plugins/dujiaoka)
- [查看 API 参考](/zh/api/reference)
