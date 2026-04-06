# EPUSDT Docs Review Plan

目标：根据官方仓库 `github/GMwalletApp/epusdt`，逐页校对并优化 `epusdt-docs` 文档，避免接口路径、部署方式、参数说明、回调行为、示例代码与源码实现不一致。

## 仓库边界

- 文档仓库：`/root/.openclaw/workspace/github/GMwalletApp/epusdt-docs`
- 官方源码：`/root/.openclaw/workspace/github/GMwalletApp/epusdt`

## 页面总清单

### 根与入口
- `index.md`
- `README.md`
- `README.zh.md`
- `zh/index.md`

### API
- `api/reference.md`
- `api/payment.md`
- `zh/api/reference.md`
- `zh/api/payment.md`

### Guide / Installation
- `guide/intro.md`
- `guide/installation/index.md`
- `guide/installation/docker.md`
- `guide/installation/cloudflare.md`
- `guide/installation/baota.md`
- `guide/installation/manual.md`
- `zh/guide/intro.md`
- `zh/guide/installation/index.md`
- `zh/guide/installation/docker.md`
- `zh/guide/installation/cloudflare.md`
- `zh/guide/installation/baota.md`
- `zh/guide/installation/manual.md`

### Plugins
- `guide/plugins/dujiaoka.md`
- `zh/guide/plugins/dujiaoka.md`

## 推荐拆分批次

### Batch 0：事实基线梳理
目标：先从源码提炼“唯一真实事实”，形成校对基线。

核对项：
- 真实 API 路由前缀（`/api/v1/...`、`/v1/...`、部署前缀差异）
- Docker 部署暴露方式、容器名、端口、环境变量
- 回调返回要求、重试逻辑、签名算法
- 订单状态、支付链路、插件集成前置条件

产出：
- `docs-review/baseline.md`
- `docs-review/api-route-mapping.md`

Batch 0 已发现的关键注意点：
- 当前源码 live create route 是 `/payments/epusdt/v1/order/create-transaction`，不是 `/api/v1/order/create-transaction`
- `/pay/...` 是收银台与状态轮询页面路由，不是创建订单接口
- `app_uri` 用于拼接返回的 `payment_url`，不是服务内部统一前缀
- 回调成功条件是 HTTP 200 且 body 精确等于 `ok`
- 回调重试是配置驱动；默认 `order_notice_max_retry=0`，并非固定“最多 5 次”
- Docker 现有仓库里没有根目录官方 compose 文件；只有 `wiki/docker-RUN.md` 中的示例 compose

### Batch 1：API 页面
页面：
- `api/reference.md`
- `api/payment.md`
- `zh/api/reference.md`
- `zh/api/payment.md`

重点：
- 路由是否与源码一致
- 请求/响应字段、签名算法、回调说明
- 中英一致性

### Batch 2：安装总览与 Docker/Cloudflare
页面：
- `guide/installation/index.md`
- `guide/installation/docker.md`
- `guide/installation/cloudflare.md`
- `zh/guide/installation/index.md`
- `zh/guide/installation/docker.md`
- `zh/guide/installation/cloudflare.md`

重点：
- 部署前缀与 API 路径区分
- 反向代理 / Cloudflare / 子路径说明
- compose / env / 暴露端口是否与官方仓库一致

### Batch 3：BaoTa / Manual
页面：
- `guide/installation/baota.md`
- `guide/installation/manual.md`
- `zh/guide/installation/baota.md`
- `zh/guide/installation/manual.md`

重点：
- 手动部署依赖、目录、权限、Nginx / PHP / DB 要求
- 宝塔流程是否过时

### Batch 4：首页 / 简介 / README
页面：
- `index.md`
- `README.md`
- `README.zh.md`
- `guide/intro.md`
- `zh/index.md`
- `zh/guide/intro.md`

重点：
- 项目定位、卖点、能力边界
- 首页 CTA 与事实一致
- 与 API / 安装页表述统一

### Batch 5：插件页面
页面：
- `guide/plugins/dujiaoka.md`
- `zh/guide/plugins/dujiaoka.md`

重点：
- 插件前置条件
- 配置项命名
- 回调与通知地址示例

## 执行原则

- 每次只处理一个批次，避免大范围混改。
- 先读源码确认，再改文档，不凭记忆写。
- 每批完成后：
  - 构建校验
  - 提交到文档仓库
  - 记录剩余疑点
- 如果某项在源码中也不清晰，先记入疑点清单，不强行编造。

## 子任务推进建议

建议按顺序推进：
1. Batch 0
2. Batch 1
3. Batch 2
4. Batch 3
5. Batch 4
6. Batch 5

每个子任务输出：
- 核对到的源码依据
- 修改的页面
- 仍待确认的问题
- commit hash
