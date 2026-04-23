# 手动部署

本文说明如何在普通 Linux 服务器上直接部署 Epusdt。

**首次启动无需手动创建 `.env`。** 若未检测到配置文件，Epusdt 会自动进入内置安装向导，通过浏览器完成所有配置。

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
```

## 2. 启动 Epusdt

```bash
chmod +x /opt/epusdt/epusdt
cd /opt/epusdt
./epusdt http start
```

若无 `.env` 文件，Epusdt 会启动安装向导。用浏览器打开 `http://你的服务器IP:8000`，按提示完成初始配置（数据库、API Token、域名等）。

提交后服务自动重启，即可正常使用。

## 3. 配置 Nginx 反向代理

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
