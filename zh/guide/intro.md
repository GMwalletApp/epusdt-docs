# 项目简介

## Epusdt（Easy Payment Usdt）

`Epusdt` 是一个由 **Go 语言**编写的私有化 **USDT 支付中间件**，基于 TRC20 网络。

站长或开发者可通过 `Epusdt` 提供的 HTTP API 将 USDT 收款集成至任何系统，无需复杂配置——仅依赖 **MySQL/SQLite**（可选 Redis），即可实现 USDT 在线支付和异步消息回调。私有化部署无需额外手续费，USDT 代币直接进入您的钱包 💰

## 项目特点

- ✅ **私有化部署**，无需担心钱包被篡改和吞单
- ✅ **Go 跨平台**，支持 x86 / ARM 的 Windows / Linux
- ✅ **多钱包地址轮询**，提高订单并发率
- ✅ **异步队列响应**，优雅且高性能
- ✅ **单一二进制**，无需额外运行时环境
- ✅ **HTTP API**，任何系统均可接入
- ✅ **Telegram 机器人**，支付消息快速通知

## 项目结构

```
Epusdt
├── plugins   # 已集成插件（如独角数卡）
├── src       # 核心源码
├── sdk       # 接入 SDK
├── sql       # 数据库 SQL 文件
└── wiki      # 知识库/文档
```

## 实现原理

Epusdt 通过监听 TRC20 网络 API，监听钱包地址的 USDT 入账事件，通过**金额差异**和**时效性**判定交易归属。

```
简单流程：
1. 客户需支付 20.05 USDT
2. 服务器哈希表：address_1 → 20.05（待支付，锁定 10 分钟）
3. 若该金额已被占用，累加 0.0001 继续尝试（最多 100 次）
4. 后台线程持续监听入账事件，金额匹配则判定支付成功，触发回调
```

## 社区

- Telegram 频道：[https://t.me/epusdt](https://t.me/epusdt)
- Telegram 交流群：[https://t.me/epusdt_group](https://t.me/epusdt_group)
- GitHub：[https://github.com/GMwalletApp/epusdt](https://github.com/GMwalletApp/epusdt)
- GitHub Star：[![GitHub Stars](https://img.shields.io/github/stars/GMwalletApp/epusdt?style=flat&logo=github)](https://github.com/GMwalletApp/epusdt/stargazers)

## 开源协议

[GPLv3](https://www.gnu.org/licenses/gpl-3.0.html)

> ⚠️ 本项目仅供学习与技术交流，用户需自行遵守所在地法律法规。加密资产属高风险资产，GMwallet 不对任何资产损失或使用结果作出保证。
