---
layout: home
title: Epusdt — Self-Hosted USDT Payment Middleware for TRON
description: Epusdt is a self-hosted USDT payment middleware from GMwallet. Run it on your own server, generate hosted checkout links, and integrate orders through HTTP APIs.

hero:
  name: "Epusdt"
  text: "Easy Payment USDT"
  tagline: Self-hosted USDT payment middleware for TRON-based checkout flows, with hosted payment pages, API integration, and merchant callbacks.
  image:
    src: /logo.png
    alt: Epusdt
  actions:
    - theme: brand
      text: Get Started
      link: /guide/intro
    - theme: alt
      text: API Reference
      link: /api/reference
    - theme: alt
      text: GitHub
      link: https://github.com/GMwalletApp/epusdt

features:
  - icon: 🔒
    title: Self-Hosted
    details: Run Epusdt on your own server and wallet infrastructure. Funds go directly to your configured receiving addresses.
  - icon: 💸
    title: Hosted Checkout
    details: Create orders through the API and return a checkout URL for users to complete payment on Epusdt-hosted pages.
  - icon: 🔄
    title: Multi-Wallet Routing
    details: Rotate across multiple receiving addresses and reserve unique amounts to reduce order collisions under load.
  - icon: ⚙️
    title: HTTP API + Callbacks
    details: Integrate with your store, panel, or custom app using create-order APIs and asynchronous payment notifications.
  - icon: 🤖
    title: Telegram Notifications
    details: Optional Telegram bot support helps with payment notices and basic wallet management workflows.
  - icon: 🐳
    title: Flexible Deployment
    details: Start quickly with Docker, or build from source for Linux, macOS, Windows, x86, or ARM environments.
---
