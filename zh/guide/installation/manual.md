# 手动部署

如果你希望自己编译程序、手动管理服务进程、或者将 Epusdt 集成进现有运维体系中，可以使用手动部署方式。它更灵活，但也要求你对 Linux、Go、反向代理和服务管理有一定基础。

## 前置条件

开始前请确认你已经准备好：

- Go 1.16+
- Redis
- MySQL 或 SQLite
- Git
- 一台 Linux 服务器
- 一个可访问的公网域名（推荐生产环境使用）

## 一、下载源码并编译

在服务器上执行以下命令：

```bash
git clone https://github.com/GMwalletApp/epusdt
cd epusdt
go build -o epusdt .
cp .env.example .env
# 编辑 .env
./epusdt
```

上面这组命令完成了以下事情：

1. 从 GitHub 克隆源码
2. 进入项目目录
3. 使用 Go 编译生成 `epusdt` 可执行文件
4. 复制示例配置文件生成 `.env`
5. 编辑你的运行配置
6. 直接启动程序进行测试

## 二、编辑 `.env` 配置

你需要根据自己的实际环境修改 `.env`。以下是一个可直接参考的完整示例：

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

### 数据库说明

- 如果你使用 **MySQL**，则 `db_type=mysql`
- 如果你使用 **SQLite**，则将 `db_type=sqlite`，并按项目要求配置 SQLite 对应文件路径
- 如果是单机轻量部署，SQLite 更简单
- 如果是正式生产环境，通常更推荐 MySQL

### Redis 说明

Redis 通常用于缓存、任务队列和运行时数据管理。即使是单机环境，也建议正确安装并配置 Redis。

## 三、前台测试启动

编辑好 `.env` 后，可以先在前台直接启动程序测试：

```bash
./epusdt
```

如果程序启动正常，你可以通过监听端口或浏览器访问来验证服务是否已经运行。

如果项目默认监听 `8080` 端口，则可临时通过以下方式确认：

```bash
ss -lntp | grep 8080
```

确认功能正常后，再继续配置 systemd 进行后台托管。

## 四、配置 systemd 开机自启

在生产环境中，建议使用 systemd 管理 Epusdt 进程。这样系统重启后服务会自动启动，异常退出时也可以自动拉起。

创建 systemd 服务文件：

```bash
sudo nano /etc/systemd/system/epusdt.service
```

写入以下内容：

```ini
[Unit]
Description=Epusdt Service
After=network.target mysql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/epusdt
ExecStart=/opt/epusdt/epusdt
Restart=always
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

请根据你的实际部署路径调整以下字段：

- `User`
- `WorkingDirectory`
- `ExecStart`

例如，如果你把程序放在 `/root/epusdt`，就要改成对应路径。

保存后执行：

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

生产环境通常不建议直接将应用端口暴露在公网，而是通过 Nginx 做反向代理，并统一管理 HTTPS。

以下是一个可直接参考的 Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name pay.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pay.example.com;

    ssl_certificate /etc/letsencrypt/live/pay.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pay.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

将该配置保存到你的 Nginx 站点配置文件中，例如：

```text
/etc/nginx/conf.d/epusdt.conf
```

检查配置并重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 六、访问服务

完成以上步骤后，你可以通过以下地址访问 Epusdt：

```text
https://pay.example.com
```

管理后台地址通常为：

```text
https://pay.example.com/admin
```

请确保 `.env` 中的 `app_uri` 与你的最终访问域名保持一致，否则会导致某些跳转、回调或后台地址异常。

## 七、更新程序

如果你是通过源码构建方式部署，后续更新可以按以下流程操作：

```bash
cd /opt/epusdt
git pull
go build -o epusdt .
sudo systemctl restart epusdt
```

更新前建议先备份：

- `.env`
- 数据库
- 运行时目录和日志目录

## 常见问题

### 1. `go build` 失败

请先确认：

- Go 版本是否满足 `1.16+`
- 网络是否可以访问依赖仓库
- 项目源码是否完整拉取

### 2. 程序可以启动，但 Nginx 访问 502

通常原因有：

- Epusdt 没有正常运行
- Epusdt 实际监听端口不是 `8080`
- Nginx 反向代理地址写错

### 3. 数据库连接错误

请检查：

- `.env` 中数据库配置是否正确
- MySQL 是否已经启动
- 用户权限是否允许本机连接

### 4. 支付回调异常

请重点检查：

- `app_uri` 是否为公网地址
- HTTPS 是否已经正确配置
- 服务是否能正常访问外部链上接口
- `tron_grid_api_key` 是否真实有效

## 小结

手动部署适合需要更高控制力的场景，核心步骤包括：

1. 克隆源码并编译
2. 复制并编辑 `.env`
3. 直接运行测试
4. 配置 systemd 开机自启
5. 使用 Nginx 做反向代理

如果你只是想更快部署上线，建议优先使用 Docker 方案；如果你已经有成熟 Linux 运维经验，手动部署会更灵活。
