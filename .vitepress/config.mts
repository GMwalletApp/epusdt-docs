import { defineConfig } from "vitepress";
import { defineTeekConfig } from "vitepress-theme-teek/config";

const teekConfig = defineTeekConfig({
  teekHome: false,
  footer: {
    copyright: "Copyright © 2025 GMwallet",
  },
});

export default defineConfig({
  extends: teekConfig,

  base: process.env.VITEPRESS_BASE ?? "/",

  title: "Epusdt",
  description:
    "Epusdt (Easy Payment USDT) is a private USDT TRC20 payment middleware — deploy on your own server with no extra fees.",

  locales: {
    root: {
      label: "English",
      lang: "en-US",
      themeConfig: {
        nav: [
          { text: "Home", link: "/" },
          { text: "Guide", link: "/guide/intro" },
          { text: "API", link: "/api/reference" },
          {
            text: "GitHub",
            link: "https://github.com/GMwalletApp/epusdt",
            target: "_blank",
          },
          {
            text: "Telegram",
            link: "https://t.me/epusdt",
            target: "_blank",
          },
        ],
        sidebar: {
          "/guide/": [
            {
              text: "Getting Started",
              items: [
                { text: "Introduction", link: "/guide/intro" },
                { text: "Installation Overview", link: "/guide/installation/" },
              ],
            },
            {
              text: "Installation",
              items: [
                { text: "Docker", link: "/guide/installation/docker" },
                { text: "BaoTa Panel", link: "/guide/installation/baota" },
                { text: "Manual", link: "/guide/installation/manual" },
              ],
            },
            {
              text: "Plugins",
              items: [
                { text: "Dujiaoka", link: "/guide/plugins/dujiaoka" },
              ],
            },
          ],
          "/api/": [
            {
              text: "API Reference",
              items: [
                { text: "Overview", link: "/api/reference" },
                { text: "Payment API", link: "/api/payment" },
                { text: "Legacy Rate API", link: "/api/legacy" },
              ],
            },
          ],
        },
        socialLinks: [
          { icon: "github", link: "https://github.com/GMwalletApp/epusdt" },
        ],
      },
    },
    zh: {
      label: "中文",
      lang: "zh-CN",
      link: "/zh/",
      themeConfig: {
        nav: [
          { text: "首页", link: "/zh/" },
          { text: "指南", link: "/zh/guide/intro" },
          { text: "API", link: "/zh/api/reference" },
          {
            text: "GitHub",
            link: "https://github.com/GMwalletApp/epusdt",
            target: "_blank",
          },
          {
            text: "Telegram",
            link: "https://t.me/epusdt",
            target: "_blank",
          },
        ],
        sidebar: {
          "/zh/guide/": [
            {
              text: "快速开始",
              items: [
                { text: "项目简介", link: "/zh/guide/intro" },
                { text: "安装概览", link: "/zh/guide/installation/" },
              ],
            },
            {
              text: "安装方式",
              items: [
                { text: "Docker 部署", link: "/zh/guide/installation/docker" },
                { text: "宝塔面板部署", link: "/zh/guide/installation/baota" },
                { text: "手动部署", link: "/zh/guide/installation/manual" },
              ],
            },
            {
              text: "插件",
              items: [
                { text: "独角数卡", link: "/zh/guide/plugins/dujiaoka" },
              ],
            },
          ],
          "/zh/api/": [
            {
              text: "API 参考",
              items: [
                { text: "概览", link: "/zh/api/reference" },
                { text: "支付接口", link: "/zh/api/payment" },
                { text: "汇率接口（旧版）", link: "/zh/api/legacy" },
              ],
            },
          ],
        },
        socialLinks: [
          { icon: "github", link: "https://github.com/GMwalletApp/epusdt" },
        ],
      },
    },
  },

  themeConfig: {
    logo: "/logo.png",
    search: {
      provider: "local",
    },
  },
});
