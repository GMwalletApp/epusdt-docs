# Cloudflare Pages 部署

本页说明如何将 **本文档站** 部署到 Cloudflare Pages。

::: warning 注意
这里部署的是 **epusdt-docs 文档站点**，不是 Epusdt 支付服务本身。

Cloudflare Pages 适合托管静态网站，而 Epusdt 服务本体需要运行在支持后端进程、数据库的服务器环境中。
:::

## 适用场景

如果你想做以下事情，这篇文档就适合你：

- 部署 Epusdt 官方文档的自定义镜像站
- 将文档托管到 Cloudflare 全球边缘网络
- 使用自己的 GitHub 仓库维护文档内容
- 为文档站绑定自定义域名

## 第一步：Fork 仓库

先 Fork 官方文档仓库：

```text
https://github.com/GMwalletApp/epusdt-docs
```

Fork 完成后，你自己的 GitHub 账号下会出现一份独立仓库，例如：

```text
https://github.com/yourname/epusdt-docs
```

后续 Cloudflare Pages 会直接从这个 Fork 后的仓库拉取代码并自动构建。

## 第二步：打开 Cloudflare Pages

登录 Cloudflare 后，按下面路径操作：

1. 进入 Cloudflare 控制台
2. 打开 **Workers & Pages**
3. 点击 **创建项目**
4. 选择 **连接 Git**

如果这是你第一次使用 Pages，Cloudflare 可能会要求你先授权 GitHub 访问权限。

## 第三步：选择 Fork 的仓库

在仓库列表中选择你刚刚 Fork 的：

```text
epusdt-docs
```

确认选择后，继续下一步构建设置。

## 第四步：填写构建设置

在 Cloudflare Pages 的构建配置中填写：

- **构建命令**：`bun run docs:build`
- **输出目录**：`.vitepress/dist`

也就是说，最终构建配置应为：

```text
Build command: bun run docs:build
Build output directory: .vitepress/dist
```

## 第五步：关于 Bun 与仓库内置文件说明

这个仓库已经包含以下文件：

- `wrangler.toml`
- `bun.lock`

这意味着：

- Cloudflare 可以识别该项目的部署配置
- Cloudflare 通常会自动识别 Bun 环境
- 你不需要额外再手动改造一个新的静态部署工程

换句话说，这个仓库本身已经为 Cloudflare Pages 部署做好了基础准备。

## 第六步：自定义域名（可选）

如果你希望把文档站绑定到自己的域名，例如：

```text
docs.example.com
```

可以在部署完成后继续操作：

1. 打开刚创建好的 Pages 项目
2. 进入 **Custom domains** 或 **自定义域**
3. 点击添加域名
4. 输入你的目标域名
5. 按照 Cloudflare 提示完成 DNS 配置

如果该域名本身已经托管在 Cloudflare，配置过程通常会更简单。

## 第七步：点击部署

确认前面的配置无误后，点击部署。

Cloudflare Pages 会自动执行以下流程：

1. 拉取你 Fork 后的 Git 仓库代码
2. 安装项目依赖
3. 执行 `bun run docs:build`
4. 将生成的静态文件发布到 Pages

部署成功后，Cloudflare 会分配一个默认访问地址，通常类似：

```text
https://your-project-name.pages.dev
```

你可以先通过这个默认域名验证文档站是否构建成功。

## 后续更新方式

当你后续更新自己的 Fork 仓库内容并 push 到对应分支时，Cloudflare Pages 会自动重新构建并发布新版本。

这意味着：

- 不需要每次手动上传文件
- 文档更新可以直接走 Git 工作流
- 非常适合团队协作和持续发布

## 常见问题

### 1. 为什么不能用 Cloudflare Pages 部署 Epusdt 服务本体？

因为 Cloudflare Pages 本质上是静态站点托管服务，不提供常规意义上的后端常驻进程环境，也不能直接替代 MySQL 和应用服务器。

Epusdt 本体依赖：

- 应用进程运行环境
- 数据库
- 链上查询能力
- 业务回调处理能力

所以它应该部署在 VPS、云服务器、容器平台或其他支持后端服务的环境中。

### 2. 构建失败怎么办？

请优先检查以下内容：

- 选择的仓库是否正确
- 构建命令是否填写为 `bun run docs:build`
- 输出目录是否填写为 `.vitepress/dist`
- 仓库中是否保留了 `wrangler.toml` 和 `bun.lock`

### 3. 部署成功但页面样式异常

通常需要检查：

- 项目是否完整构建成功
- 是否存在资源路径配置问题
- 是否有缓存尚未刷新

你可以先重新触发一次部署，再用无痕模式访问进行验证。

## 小结

将本文档站部署到 Cloudflare Pages 的流程非常直接：

1. Fork `https://github.com/GMwalletApp/epusdt-docs`
2. 打开 Cloudflare Pages 并连接 Git
3. 选择 Fork 后的仓库
4. 设置构建命令为 `bun run docs:build`
5. 设置输出目录为 `.vitepress/dist`
6. 可选配置自定义域名
7. 点击部署

需要再次强调：这篇文档针对的是 **文档站部署**，不是 Epusdt 服务本体部署。
