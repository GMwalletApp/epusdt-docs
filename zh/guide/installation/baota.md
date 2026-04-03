# 宝塔面板部署

本文介绍如何在安装了宝塔面板的 Linux 服务器上部署 Epusdt。如果你习惯通过图形化面板管理网站、数据库和反向代理，宝塔是一个比较省事的方案。

> 如果你更倾向于 Docker 或纯命令行方式，请参考 [Docker 部署](/zh/guide/installation/docker) 或 [手动部署](/zh/guide/installation/manual)。

## 前置条件

开始前请确认：

- 你已经有一台 Linux 服务器
- 服务器已安装宝塔面板，且能正常登录后台
- 已安装 **Nginx**
- 已准备好域名，并已解析到当前服务器
- 已获取 TronGrid API Key（[前往注册](https://www.trongrid.io/)）

## 部署思路

在宝塔面板环境中，Epusdt 通常以独立 Go 服务运行，由 Nginx 做反向代理对外提供访问。

典型架构：

- Nginx 处理公网 HTTP/HTTPS 流量
- Epusdt 监听本地 `127.0.0.1:8000`
- Supervisor 守护进程保持服务运行
- 默认使用 SQLite，无需额外数据库；如需 MySQL 可通过宝塔安装

## 第一步：在宝塔中添加站点

1. 打开左侧菜单 **网站**
2. 点击 **添加站点**
3. 绑定你的支付域名，例如 `pay.example.com`
4. 站点类型选择 **纯静态** 即可（最终由反向代理转发到 Epusdt）

## 第二步：准备程序目录

将 Epusdt 二进制文件或发布包上传到站点目录，例如：

```text
/www/wwwroot/pay.example.com/
```

目录结构示例：

```text
/www/wwwroot/pay.example.com/
├── epusdt
├── .env
├── data/
└── logs/
```

赋予执行权限：

```bash
chmod +x /www/wwwroot/pay.example.com/epusdt
```

## 第三步：配置 `.env`

在程序目录中创建或编辑 `.env` 文件：

```dotenv
app_name=epusdt
app_uri=https://pay.example.com
http_listen=:8000

# 数据库类型：sqlite（默认）、mysql、postgres
db_type=sqlite

# SQLite（默认，无需额外数据库服务）
sqlite_database_filename=

# MySQL（如需使用请取消注释并填写）
# db_type=mysql
# mysql_host=127.0.0.1
# mysql_port=3306
# mysql_user=epusdt
# mysql_passwd=your_password
# mysql_database=epusdt

tron_grid_api_key=your_trongrid_api_key
order_expiration_time=10
api_auth_token=change-this-to-a-long-random-token

# Telegram 机器人（可选）
tg_bot_token=
tg_manage=
```

### 数据库说明

- **SQLite**（默认）：开箱即用，无需安装任何数据库服务，适合单机轻量部署
- **MySQL**：如需使用，可在宝塔 **软件商店** 中搜索安装 MySQL，然后在 **数据库** 面板中创建数据库和用户，将 `db_type` 改为 `mysql` 并填写对应连接信息
- **PostgreSQL**：同理，将 `db_type` 改为 `postgres` 并填写 `postgres_*` 字段

### 配置要点

- `app_uri`：填写最终对外访问的完整域名，例如 `https://pay.example.com`
- `api_auth_token`：API 鉴权密钥，务必修改为随机字符串
- `tron_grid_api_key`：建议填写真实有效的 TronGrid API Key

完整配置字段说明请参考 [Docker 部署 — 配置说明](/zh/guide/installation/docker#配置说明)。

## 第四步：配置反向代理

Epusdt 自带 HTTP 服务，宝塔需要将外部流量反向代理到它。

在宝塔站点设置中：

1. 进入站点 **设置** 页面
2. 打开 **反向代理**
3. 新建反向代理，目标地址填写：

```text
http://127.0.0.1:8000
```

注意事项：

- 确保站点已启用 HTTPS
- `app_uri` 必须与最终公网访问域名一致
- 如果前面还有 Cloudflare 等 CDN，源站仍需正确配置 HTTPS

## 第五步：申请 SSL 证书

为了保障支付页面和后台管理的安全，建议启用 HTTPS。

在宝塔站点设置中：

1. 打开 **SSL**
2. 选择 **Let's Encrypt**
3. 勾选你的域名
4. 点击申请证书
5. 申请成功后，开启 **强制 HTTPS**

启用 SSL 后，请确认 `.env` 中的 `app_uri` 使用 `https://` 开头。

## 第六步：添加 Supervisor 守护进程

在宝塔 Supervisor 中创建新的守护进程任务。

启动命令示例：

```bash
/www/wwwroot/pay.example.com/epusdt
```

工作目录：

```text
/www/wwwroot/pay.example.com/
```

如果你的构建版本需要子命令启动，请根据实际情况调整启动命令。

## 第七步：启动并验证

保存 Supervisor 任务后：

1. 启动进程
2. 访问 `https://pay.example.com`
3. 如果页面无法加载，检查应用日志
4. 打开管理后台 `https://pay.example.com/admin`，添加钱包地址

## 宝塔环境建议

- 启用 SSL 证书自动续期
- 限制对 `.env` 等敏感文件的直接访问
- 定期备份数据库
- 关注 `logs/` 目录中的回调和链上轮询错误日志

## 常见问题

### 502 Bad Gateway

通常说明 Nginx 无法连接到 Epusdt 后端。请检查：

- Epusdt 是否已在 Supervisor 中正常运行
- `http_listen` 配置是否正确
- 反向代理目标地址是否与实际监听端口一致

### 订单创建成功但始终未完成

请检查：

- 钱包地址是否为 **TRC20 USDT** 地址
- TronGrid API Key 是否有效
- 防火墙是否允许出站流量

### 支付回调异常

请检查：

- 回调地址是否为公网可达
- `app_uri` 是否为正确的公网域名
- HTTPS 是否已正确配置
- 业务系统是否能正确接收回调请求

## 下一步

- [配置独角数卡集成](/zh/guide/plugins/dujiaoka)
- [查看 API 参考](/zh/api/reference)
