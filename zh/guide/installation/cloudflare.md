# Cloudflare Pages 部署

本页说明如何把 **文档站** —— 也就是 `epusdt-docs` 这个 VitePress 项目 —— 部署到 **Cloudflare Pages**。

::: warning 注意
这篇指南只适用于 **文档网站**。

它**不能**部署 Epusdt 支付服务本体。Epusdt 是服务端应用，应部署在 Docker、宝塔或常规服务器环境中。
:::

## 你实际部署的是什么

`epusdt-docs` 仓库本质上是一个静态 VitePress 站点。

仓库地址：

- [https://github.com/GMwalletApp/epusdt-docs](https://github.com/GMwalletApp/epusdt-docs)

## 前置条件

开始前请准备：

- GitHub 账号
- Cloudflare 账号
- 创建或 Fork 仓库的权限

## 第一步：Fork 或直接连接仓库

使用文档仓库：

- [https://github.com/GMwalletApp/epusdt-docs](https://github.com/GMwalletApp/epusdt-docs)

Fork 后，你自己的仓库可能类似：

```text
https://github.com/your-username/epusdt-docs
```

## 第二步：打开 Cloudflare Pages

1. 登录 Cloudflare
2. 进入 **Workers & Pages**
3. 点击 **Create application / 创建应用**
4. 选择 **Pages**
5. 点击 **Connect to Git / 连接 Git**

## 第三步：连接仓库

1. 如果 Cloudflare 提示授权 GitHub，先完成授权
2. 选择你的 `epusdt-docs` 仓库
3. 进入构建配置页面

## 第四步：填写构建设置

这个仓库里的构建脚本是：

```json
"docs:build": "vitepress build"
```

因此在 Cloudflare Pages 中建议这样填写：

| 配置项 | 值 |
|--------|-------|
| Framework preset | 有 `VitePress` 就选 `VitePress`，否则选 `None` |
| Build command | `bun run docs:build` |
| Build output directory | `.vitepress/dist` |

## Base 路径注意事项

当前文档站的 VitePress `base` 配置来自环境变量 `VITEPRESS_BASE`；如果没设置，默认就是 `/`。

这意味着：

- 如果你把站点部署在 Pages 的根路径下，默认通常就能正常工作
- 如果你要把站点放到某个子路径下，就必须把 `VITEPRESS_BASE` 设成对应值

例如：

```text
VITEPRESS_BASE=/docs/
```

如果部署路径和 `base` 不一致，就算构建成功，也可能出现链接错乱、样式丢失、静态资源 404 等问题。

## 第五步：开始部署

点击 **Save and Deploy / 保存并部署**。

Cloudflare Pages 会自动：

1. 拉取你的仓库代码
2. 安装依赖
3. 执行构建命令
4. 发布生成出来的静态文件

成功后，你会拿到一个类似下面的地址：

```text
https://your-project.pages.dev
```

## 第六步：绑定自定义域名（可选）

如果你想把文档站挂到自己的域名上：

1. 打开对应的 Pages 项目
2. 进入 **Custom domains / 自定义域名**
3. 点击添加域名
4. 输入例如 `docs.example.com`
5. 按 Cloudflare 提示完成 DNS 配置

## 后续怎么更新

当 Pages 已经连接 GitHub 后，只要你向被跟踪的分支推送更新，Cloudflare 就会自动重新构建并发布。

## 常见问题

### Cloudflare Pages 构建失败怎么办？

先检查：

- 构建命令是不是 `bun run docs:build`
- 输出目录是不是 `.vitepress/dist`

同时确认仓库里仍然包含正常的项目文件，例如 `package.json` 和 VitePress 文档源码。

### 部署成功了，但样式或资源路径不对

这种情况通常是“实际部署路径”和“VitePress base 路径”不一致造成的。

如果你部署在子路径下，请把 `VITEPRESS_BASE` 设置成完全一致的路径，并带上结尾斜杠。

### 能不能直接把 Epusdt 本体部署到 Cloudflare Pages？

不能。Cloudflare Pages 只适合静态站点，而 Epusdt 本体是需要运行时配置、存储和支付处理逻辑的后端服务。
