---
layout: home
title: Epusdt — 面向 TRON 的自托管 USDT 支付中间件
description: Epusdt 是 GMwallet 提供的自托管 USDT 支付中间件。你可以部署在自己的服务器上，通过 HTTP API 创建订单，并使用托管收银台页面完成支付流程。

hero:
  name: "Epusdt"
  text: "轻松收取 USDT"
  tagline: 面向 TRON 支付流程的自托管 USDT 支付中间件，提供收银台页面、HTTP API 接入和商户回调能力。
  image:
    src: /logo.png
    alt: Epusdt
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/intro
    - theme: alt
      text: API 参考
      link: /zh/api/reference
    - theme: alt
      text: GitHub
      link: https://github.com/GMwalletApp/epusdt

features:
  - icon: 🔒
    title: 自托管部署
    details: 服务运行在你自己的服务器和钱包体系里，资金直接进入你配置的收款地址。
  - icon: 💸
    title: 托管收银台
    details: 通过 API 创建订单后，系统返回收银台链接，用户可在 Epusdt 托管页面完成支付。
  - icon: 🔄
    title: 多钱包轮询
    details: 可在多个收款地址之间轮换，并结合唯一金额保留机制降低并发冲突。
  - icon: ⚙️
    title: HTTP API + 回调
    details: 适合对接商城、面板、发卡站或自建业务系统，支付完成后可异步通知商户系统。
  - icon: 🤖
    title: Telegram 通知
    details: 支持可选的 Telegram 机器人能力，用于收款通知和基础钱包管理流程。
  - icon: 🐳
    title: 灵活部署
    details: 可直接用 Docker 快速部署，也可从源码构建到 Linux、macOS、Windows、x86 或 ARM 环境。
---
