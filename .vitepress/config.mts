import { defineConfig } from "vitepress";
import { defineTeekConfig } from "vitepress-theme-teek/config";

const teekConfig = defineTeekConfig({
  themeEnhance: {
    themeColor: {
      defaultColorName: "vp-green",
    },
  },
  article: { author: "Epusdt" },
  footer: { copyright: "Copyright © 2025 GMwallet" },
  toComment: {
    enabled: true,
    done: () => { window.open("https://t.me/epusdt_group", "_blank"); },
  },
});

export default defineConfig({
  extends: teekConfig,

  title: "Epusdt",
  description:
    "Epusdt (Easy Payment Usdt) — a self-hosted multi-chain crypto payment gateway written in Go. GMPay API, EPay-compatible redirect checkout, hosted cashier, and Telegram notifications.",

  head: [
    ["link", { rel: "icon", href: "/logo.png" }],
  ],

  locales: {
    root: {
      label: "English",
      lang: "en-US",
      themeConfig: {
        nav: [
          { text: "Home", link: "/" },
          { text: "Guide", link: "/guide/intro" },
          { text: "API", link: "/api/reference" },
        ],
        sidebar: {
          "/guide/": [
            {
              text: "Guide",
              items: [
                { text: "Introduction", link: "/guide/intro" },
                { text: "Release Notes", link: "/guide/changelog" },
                { text: "FAQ", link: "/guide/faq" },
              ],
            },
            {
              text: "Installation",
              items: [
                { text: "Tutorial", link: "/guide/installation/tutorial" },
                { text: "Docker (Recommended)", link: "/guide/installation/docker" },
                { text: "aaPanel", link: "/guide/installation/aapanel" },
                { text: "Manual", link: "/guide/installation/manual" },
              ],
            },
            {
              text: "Integration",
              items: [
                { text: "GMPay (Recommended)", link: "/guide/integration/gmpay" },
                { text: "EPay (Redirect)", link: "/guide/integration/epay" },
                { text: "Legacy Migration", link: "/guide/integration/epusdt" },
              ],
            },
          ],
          "/api/": [
            {
              text: "API Reference",
              items: [
                { text: "Overview", link: "/api/reference" },
                { text: "Payment API", link: "/api/payment" },
                { text: "API Migration", link: "/api/legacy" },
              ],
            },
          ],
        },
      },
    },
    zh: {
      label: "繁體中文",
      lang: "zh-TW",
      link: "/zh/",
      themeConfig: {
        nav: [
          { text: "首頁", link: "/zh/" },
          { text: "指南", link: "/zh/guide/intro" },
          { text: "API 文件", link: "/zh/api/reference" },
        ],
        sidebar: {
          "/zh/guide/": [
            {
              text: "指南",
              items: [
                { text: "項目簡介", link: "/zh/guide/intro" },
                { text: "版本日誌", link: "/zh/guide/changelog" },
                { text: "常見問題", link: "/zh/guide/faq" },
              ],
            },
            {
              text: "安裝部署",
              items: [
                { text: "教程合集", link: "/zh/guide/installation/tutorial" },
                { text: "Docker 部署（推薦）", link: "/zh/guide/installation/docker" },
                { text: "aaPanel 部署", link: "/zh/guide/installation/aapanel" },
                { text: "手動部署", link: "/zh/guide/installation/manual" },
              ],
            },
            {
              text: "接入教學",
              items: [
                { text: "GMPay 接入（推薦）", link: "/zh/guide/integration/gmpay" },
                { text: "EPay 接入（跳轉式）", link: "/zh/guide/integration/epay" },
                { text: "舊版遷移說明", link: "/zh/guide/integration/epusdt" },
              ],
            },
          ],
          "/zh/api/": [
            {
              text: "API 文件",
              items: [
                { text: "概覽", link: "/zh/api/reference" },
                { text: "支付介面", link: "/zh/api/payment" },
                { text: "介面遷移說明", link: "/zh/api/legacy" },
              ],
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    logo: "/logo.png",
    socialLinks: [
      { icon: "github", link: "https://github.com/GMwalletApp/epusdt" },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.85.503 3.582 1.378 5.066L2 22l5.09-1.335A9.959 9.959 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm4.93 6.787c-.15 1.58-.805 5.414-1.138 7.183-.14.75-.417 1-.685 1.025-.582.054-1.024-.384-1.588-.754-.882-.578-1.38-.938-2.236-1.502-.99-.652-.348-1.01.216-1.595.148-.154 2.724-2.497 2.774-2.71a.205.205 0 0 0-.048-.177.236.236 0 0 0-.212-.02c-.09.02-1.52.967-4.29 2.84-.406.28-.775.416-1.107.409-.366-.008-1.07-.207-1.593-.377-.64-.209-1.149-.319-1.104-.672.024-.184.276-.373.757-.564 2.968-1.294 4.947-2.147 5.936-2.559 2.826-1.176 3.413-1.38 3.796-1.387.084-.001.272.02.393.119.102.083.13.195.144.273.013.078.03.256.015.395Z"/></svg>'
        },
        link: "https://t.me/epusdt_group"
      },
    ],
  },
});
