# 宝塔面板部署

本文介绍如何在安装了宝塔面板的 Linux 服务器上部署 Epusdt。对于习惯使用图形化方式管理网站、数据库和反向代理的用户来说，宝塔面板是一个比较省事的方案。

## 前置条件

开始前请确认：

- 你已经有一台 Linux 服务器
- 服务器已经安装宝塔面板
- 你能够正常登录宝塔后台
- 你已经准备好域名，并已解析到当前服务器

## 部署思路

在宝塔面板环境中，常见部署方式有两种：

- **方式一：使用 Docker 部署 Epusdt（推荐）**
- **方式二：下载 Epusdt 二进制直接运行**

推荐优先使用 Docker 方式，因为升级更方便、环境更统一、问题更容易排查。

## 第一步：安装 MySQL 和 Redis

登录宝塔面板后：

1. 打开左侧菜单 **软件商店**
2. 搜索并安装 **MySQL**
3. 搜索并安装 **Redis**
4. 等待安装完成，并确保两个服务处于运行状态

安装完成后，建议记下以下信息：

- MySQL 版本
- MySQL root 密码
- Redis 端口
- Redis 密码（如有设置）

## 第二步：创建数据库和用户

在宝塔面板中：

1. 打开左侧菜单 **数据库**
2. 点击 **添加数据库**
3. 数据库名填写 `epusdt`
4. 用户名填写 `epusdt`
5. 设置一个强密码，例如 `Epusdt@2026Secure`
6. 权限选择本地服务器访问
7. 确认创建

创建完成后，请保存以下信息：

- 数据库名：`epusdt`
- 数据库用户：`epusdt`
- 数据库密码：你刚刚设置的密码
- 数据库地址：`127.0.0.1`
- 数据库端口：通常为 `3306`

## 第三步：获取 Epusdt 程序

你可以二选一：

### 方案 A：使用 Docker（推荐）

如果你的宝塔环境已经安装 Docker 管理器或服务器本身已安装 Docker，可以直接参考 Docker 部署方式运行 Epusdt。这样后续升级更简单，只需要更新镜像即可。

建议部署目录如下：

```text
/opt/epusdt
```

然后在该目录中放置：

- `docker-compose.yml`
- `.env`

### 方案 B：下载 Epusdt 二进制

如果你不打算使用 Docker，也可以下载 Epusdt 发布版本，或者从源码编译得到二进制文件，然后上传到服务器中，例如：

```text
/www/wwwroot/epusdt
```

目录结构可以类似：

```text
/www/wwwroot/epusdt/
├── epusdt
├── .env
├── logs/
└── runtime/
```

如果是二进制方式，记得给程序执行权限：

```bash
chmod +x /www/wwwroot/epusdt/epusdt
```

## 第四步：配置 `.env` 文件

无论你使用 Docker 还是二进制部署，都需要正确配置 `.env` 文件。

示例：

```dotenv
app_name=Epusdt
app_uri=https://pay.example.com

db_type=mysql
db_host=127.0.0.1
db_port=3306
db_name=epusdt
db_user=epusdt
db_password=Epusdt@2026Secure

redis_host=127.0.0.1
redis_port=6379
redis_password=
redis_db=0

tron_grid_api_key=your_trongrid_api_key
usdt_rate=1
cny_rate=7.2
order_expiration_time=15
callback_timeout=30
telegram_bot_token=1234567890:AAExampleBotToken1234567890
telegram_bot_admin_id=123456789
```

配置说明：

- `app_uri`：填写最终对外访问域名，例如 `https://pay.example.com`
- `db_host`：如果数据库与应用在同一台服务器，可写 `127.0.0.1`
- `redis_host`：如果 Redis 本机运行，可写 `127.0.0.1`
- `tron_grid_api_key`：建议填写真实有效的 TronGrid API Key
- `telegram_bot_token` 和 `telegram_bot_admin_id`：如需后台通知与机器人管理功能请正确填写

## 第五步：在宝塔中添加站点并配置反向代理

接下来需要在宝塔面板中创建一个站点，并将外部访问反向代理到 Epusdt 的 `8080` 端口。

操作步骤：

1. 打开左侧菜单 **网站**
2. 点击 **添加站点**
3. 输入你的域名，例如 `pay.example.com`
4. PHP 版本可选择 **纯静态** 或任意你常用的版本（因为最终由反向代理转发）
5. 创建完成后，进入该站点的 **设置** 页面
6. 打开 **反向代理**
7. 新建反向代理，目标地址填写：

```text
http://127.0.0.1:8080
```

如果你使用 Docker 且端口映射为宿主机 `8080`，这里同样填写 `http://127.0.0.1:8080` 即可。

## 第六步：申请 SSL 证书

为了让支付页面和后台管理更安全，建议启用 HTTPS。

在宝塔站点设置中：

1. 打开 **SSL**
2. 选择 **Let’s Encrypt**
3. 勾选你的域名
4. 点击申请证书
5. 申请成功后，开启 **强制 HTTPS**

启用 SSL 后，请确认 `.env` 中的 `app_uri` 使用的是 `https://` 开头的完整地址。

## 第七步：启动服务并访问后台

### 如果你使用 Docker

进入部署目录后启动：

```bash
cd /opt/epusdt
docker compose up -d
```

### 如果你使用二进制方式

进入程序目录后启动：

```bash
cd /www/wwwroot/epusdt
./epusdt
```

为了避免退出 SSH 后进程停止，建议使用宝塔的 **计划任务**、**守护进程管理器** 或系统级 `systemd` 来托管进程。

服务启动后，可以访问：

```text
https://pay.example.com/admin
```

这就是 Epusdt 的管理后台入口。

## 建议的运维做法

- 为数据库和 Redis 设置强密码
- 定期备份数据库
- 使用 HTTPS 对外提供服务
- 为 Epusdt 配置进程守护，避免意外退出
- 修改默认端口暴露策略，仅通过 Nginx/宝塔站点对外访问

## 常见问题

### 1. 宝塔站点打开后显示 502

通常说明反向代理目标服务没有正常启动。请检查：

- Epusdt 是否已经运行
- 是否监听在 `8080` 端口
- 反向代理地址是否填写正确

### 2. 数据库连接失败

请检查：

- MySQL 是否正在运行
- 数据库用户名和密码是否正确
- `.env` 中的 `db_host`、`db_port` 是否正确

### 3. 后台打不开或跳转异常

请确认：

- `app_uri` 与你实际访问域名完全一致
- SSL 已正确启用
- 宝塔站点的反向代理已经生效

## 小结

在宝塔面板中部署 Epusdt 的核心流程就是：

1. 安装 MySQL 和 Redis
2. 创建数据库和用户
3. 下载 Epusdt 二进制或使用 Docker（推荐 Docker）
4. 配置 `.env`
5. 添加站点并将域名反向代理到 `8080`
6. 申请 SSL 证书
7. 启动服务并访问 `/admin` 管理后台

如果你更偏向命令行和源码方式，也可以继续查看手动部署指南。
