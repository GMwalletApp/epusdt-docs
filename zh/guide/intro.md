# 项目简介

**Epusdt**（Easy Payment USDT）是一个使用 **Go 语言** 编写的、自托管的 **USDT TRC20 支付中间件**。它的目标很直接：让站长、开发者或商户可以在自己的服务器上独立部署一套 USDT 收款能力，通过 HTTP API 接入到商城、发卡站、会员系统或任何自建业务中，而不必依赖第三方托管支付平台。

与中心化托管方案相比，Epusdt 更适合希望自己掌握钱包、订单、回调和部署环境的用户。资金直接进入你自己的钱包，服务也运行在你自己的机器上，部署和升级都由你控制。

> Epusdt 遵守 [GPLv3 开源协议](https://www.gnu.org/licenses/gpl-3.0.html)。

## 它解决了什么问题？

在很多数字商品、订阅服务或跨境业务场景里，开发者往往需要一套：

- 能独立部署的 USDT 收款系统
- 可通过 API 对接现有业务的支付中间层
- 能自动监听到账并回调业务系统的订单引擎
- 不依赖第三方代收、不额外抽成的方案

Epusdt 正是为这些需求而设计。它通过监听 TRC20 网络上的 USDT 转账，结合金额匹配、订单时效和回调机制，完成"创建订单 → 用户支付 → 自动确认 → 异步通知业务系统"的完整流程。

## 核心功能

Epusdt 的定位非常清晰：**自托管、轻部署、面向开发者接入**。

### 私有化部署

服务、数据库、缓存和钱包管理都掌握在你自己手里。你可以部署在本地服务器、云主机、容器平台，或其他你信任的基础设施上。

### 零额外手续费

Epusdt 本身不是托管平台，不替你保管资金，也不参与代收。用户支付的 USDT 直接进入你配置的钱包地址，不额外收取平台手续费。

### 仅支持 TRC20

当前 Epusdt 主要围绕 **USDT TRC20** 场景工作，适合已经使用波场生态收款的业务。

### Telegram 机器人

项目内置 Telegram 机器人能力，可用于：

- 钱包管理
- 收款通知
- 日常运维提醒

### 多钱包轮询

支持多个收款钱包地址轮询使用，有助于提升并发订单处理能力，减少单地址金额占用导致的冲突。

### HTTP API

你可以将 Epusdt 接入任意系统，例如：

- 电商站点
- 发卡平台
- SaaS 服务
- 会员订阅系统
- 自建管理后台

## 实现原理

Epusdt 通过 TronGrid API 监听 TRC20 网络，监控钱包地址 USDT 入账事件，通过**金额差异**和**时效性**来判定交易归属：

```
1. 客户需要支付 20.05 USDT
2. 服务器检查 address_1: 20.05 是否已被锁定
3. 未被锁定 → 返回钱包地址和金额给客户（锁定 10 分钟）
4. 已被锁定 → 金额加 0.0001 再次尝试（最多 100 次）
5. 后台线程监听所有钱包 USDT 入账事件
6. 发现入账金额与待支付金额相等 → 判定订单支付成功 → 触发异步回调
```

## 系统要求

根据部署方式不同，Epusdt 的环境要求略有差异。

| 组件 | 说明 |
| --- | --- |
| 操作系统 | Linux（推荐）、macOS、Windows |
| 架构 | x86_64 或 ARM |
| Go | 手动部署时需要 **Go 1.16+** |
| Docker | Docker 部署时需要 Docker / Docker Compose |
| 数据库 | **SQLite（默认）**、**MySQL**、**PostgreSQL** |
| 网络访问 | 需要访问 TronGrid API（HTTPS 出站） |
| 域名 | 收银台页面需要绑定域名 |
| Telegram 机器人 | 推荐，用于管理和通知 |

## 基本架构

一个典型的 Epusdt 部署由以下几部分组成：

```text
业务系统 / 商户网站
        ↓
    Epusdt HTTP API
        ↓
   Go 服务处理订单逻辑
      ↙        ↘
        ↓
   TronGrid API 监听链上转账
        ↓
   支付成功后回调业务系统
```

## 交流社区

- Telegram 频道：[https://t.me/epusdt](https://t.me/epusdt)
- Telegram 交流群：[https://t.me/epusdt_group](https://t.me/epusdt_group)
- GitHub：[https://github.com/GMwalletApp/epusdt](https://github.com/GMwalletApp/epusdt)

## 下一步

如果你是第一次部署，建议先阅读安装概览，再选择适合自己的方式：

- [安装概览](/zh/guide/installation/)
- [Docker 部署](/zh/guide/installation/docker) — 最快的上手方式
- [宝塔面板部署](/zh/guide/installation/baota)
- [手动部署](/zh/guide/installation/manual)
- [API 参考](/zh/api/reference)
