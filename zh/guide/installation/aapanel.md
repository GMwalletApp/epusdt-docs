# aaPanel 部署

本文说明如何使用 aaPanel 部署 Epusdt 服务本体。

**首次启动无需手动创建 `.env`。** 若未检测到配置文件，Epusdt 会自动进入内置安装向导，浏览器完成配置即可。

## 前置条件

开始前请准备：

- 一台已安装 aaPanel 的 Linux 服务器
- aaPanel 中已安装 Nginx
- aaPanel 中已安装 Supervisor
- 已解析到服务器的公网域名，例如 `pay.example.com`
- Epusdt 发布包，或自行编译好的 `epusdt` 二进制
- 一个安全的 `api_auth_token`
- 可选但推荐填写 `tron_grid_api_key`

## 1. 新增站点

在 aaPanel 中新建站点，并绑定你的收银台域名。

这个站点的用途是给 Epusdt 提供公网入口和反向代理，不是部署 `epusdt-docs` 文档站。

## 2. 上传 Epusdt

把 Epusdt 发布包上传到站点目录并解压。

如果需要，赋予执行权限：

```bash
chmod +x /www/wwwroot/pay.example.com/epusdt
```

## 3. 配置反向代理

在 aaPanel 站点设置中，把反向代理目标指向：

```text
http://127.0.0.1:8000
```

## 4. 添加 Supervisor 守护进程

在 aaPanel Supervisor 中新增进程，启动命令示例：

```text
/www/wwwroot/pay.example.com/epusdt http start
```

工作目录设置为 Epusdt 所在目录。

## 5. 完成安装向导

进程启动后，打开浏览器访问 `http://你的服务器IP:8000`（如果反向代理已生效可直接用域名）。按提示完成数据库、API Token、域名等配置，提交后服务自动重启。

## 6. 验证服务与接入

对外基础地址示例：

```text
https://pay.example.com
```

创建订单接口例如：

```text
POST /payments/epusdt/v1/order/create-transaction
```

## 注意事项

- 安装完成后所有配置均可在管理后台调整
- `api_auth_token` 是 API 签名密钥，请妥善保管
- 文中的路径请按你的 aaPanel 实际目录替换
