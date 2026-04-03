# 安装概览

Epusdt 提供多种部署方式，适合不同的服务器环境、运维习惯和技术偏好。如果你只是想尽快把服务稳定跑起来，建议优先选择 **Docker 部署**；如果你更习惯图形化面板，宝塔会更顺手；如果你需要完全掌控编译和运行方式，则可以选择手动部署。

## 三种安装方式

### Docker 部署（推荐）

这是最适合大多数用户的方式。

优点：

- 部署步骤清晰，启动快
- 依赖隔离好，升级方便
- 适合测试环境和生产环境
- 易于和 MySQL 一起编排

适合人群：

- 第一次接触 Epusdt 的用户
- 希望快速上线的开发者
- 需要稳定、易维护生产部署的运维人员

→ [查看 Docker 部署指南](/zh/guide/installation/docker)

### 宝塔面板部署

如果你的服务器本来就在用宝塔面板管理，这种方式会比较自然。

优点：

- 图形化操作，上手门槛低
- 方便安装 MySQL、Nginx、SSL
- 适合习惯通过面板维护站点的用户

适合人群：

- 使用宝塔管理 VPS 或轻量云的用户
- 不希望频繁敲命令行的用户
- 需要快速配置反向代理和证书的场景

→ [查看宝塔面板部署指南](/zh/guide/installation/baota)

### 手动部署

如果你想从源码构建、自己管理进程、自己决定目录结构和服务托管方式，手动部署会更灵活。

优点：

- 完全掌控编译与运行过程
- 适合深度定制或二次开发
- 可与 systemd、Nginx、现有运维体系整合

适合人群：

- 熟悉 Linux 和 Go 开发环境的用户
- 需要二次开发或排查底层问题的开发者
- 对运行环境有明确控制需求的团队

→ [查看手动部署指南](/zh/guide/installation/manual)

## 我该选哪一种？

如果你还不确定，直接按下面选：

- **想最快上线** → Docker
- **平时主要用宝塔管理服务器** → 宝塔面板
- **需要源码编译、系统服务托管或深度自定义** → 手动部署

一句话建议：**绝大多数用户优先用 Docker。**

## 部署前建议准备的信息

无论你使用哪种方式，开始之前最好先准备好这些内容：

- 服务器公网 IP 或域名
- Epusdt 对外访问地址，例如 `http://your-server:8000` 或 `https://pay.example.com`
- 数据库信息（SQLite / MySQL / PostgreSQL）
- TronGrid API Key
- 订单回调地址规划
- Telegram 机器人 Token 与管理员 ID（可选，但推荐）

## 通用配置思路

Epusdt 使用环境变量文件进行配置，通常是 `.env`。核心配置通常包括：

| 配置项 | 说明 |
| --- | --- |
| `app_name` | 应用名称 |
| `app_uri` | 服务对外访问地址 |
| `http_listen` | 监听端口，默认 `:8000` |
| `db_type` | 数据库类型：`sqlite` / `mysql` / `postgres` |
| `mysql_host` / `mysql_port` / `mysql_user` / `mysql_passwd` / `mysql_database` | MySQL 连接参数 |
| `postgres_host` / `postgres_port` / `postgres_user` / `postgres_passwd` / `postgres_database` | PostgreSQL 连接参数 |
| `tron_grid_api_key` | TronGrid API Key |
| `forced_usdt_rate` | 强制汇率 |
| `order_expiration_time` | 订单过期时间，默认 10 分钟 |
| `api_rate_url` | 汇率接口地址 |
| `tg_bot_token` / `tg_manage` | Telegram 机器人配置 |
| `api_auth_token` | API 认证密钥 |

> 提示：项目不同版本的 `.env` 字段名可能略有差异，实际部署时请以仓库中的 `.env.example` 为准。

## 关于 Cloudflare Pages

除了 Epusdt 本体的三种安装方式外，这个文档站本身也可以部署到 **Cloudflare Pages**。

这适用于：

- 你想把文档公开托管在 Cloudflare 上
- 你想为团队或客户提供一个独立的说明站
- 你希望给文档站绑定自己的域名

> 注意：Cloudflare Pages 仅用于部署 **本文档站**，不是用来运行 Epusdt 支付服务本体。

→ [查看 Cloudflare Pages 文档站部署指南](/zh/guide/installation/cloudflare)

## 下一步

如果你不想花时间比较，建议直接从这里开始：

- [Docker 部署](/zh/guide/installation/docker)

如果你已经明确使用环境，也可以直达：

- [宝塔面板部署](/zh/guide/installation/baota)
- [手动部署](/zh/guide/installation/manual)
- [Cloudflare Pages 部署文档站](/zh/guide/installation/cloudflare)
