# Cloudflare Pages Deployment

This page explains how to deploy **this documentation site** — the `epusdt-docs` VitePress project — to **Cloudflare Pages**.

::: warning
This guide is for the **documentation website only**.

It does **not** deploy the Epusdt payment service itself. To deploy Epusdt, use one of these guides instead:

- [Docker](/guide/installation/docker)
- [BaoTa Panel](/guide/installation/baota)
- [Manual Installation](/guide/installation/manual)
:::

## What You Will Deploy

The `epusdt-docs` repository is a static VitePress site. Cloudflare Pages can build it directly from GitHub and host the generated static files globally.

Repository:

- [https://github.com/GMwalletApp/epusdt-docs](https://github.com/GMwalletApp/epusdt-docs)

## Prerequisites

Before starting, make sure you have:

- a GitHub account
- a Cloudflare account
- permission to fork repositories on GitHub

## Step 1: Fork the Repository

Fork the docs repository to your own GitHub account:

- [https://github.com/GMwalletApp/epusdt-docs](https://github.com/GMwalletApp/epusdt-docs)

After forking, you should have a repository like:

```text
https://github.com/your-username/epusdt-docs
```

## Step 2: Open Cloudflare Pages

1. Sign in to your Cloudflare dashboard
2. Go to **Workers & Pages**
3. Click **Create application**
4. Choose **Pages**
5. Click **Connect to Git**

## Step 3: Connect Your GitHub Repository

1. Authorize Cloudflare to access your GitHub account if prompted
2. Select your forked `epusdt-docs` repository
3. Click **Begin setup**

## Step 4: Configure Build Settings

Use these build settings:

| Setting | Value |
|--------|-------|
| Framework preset | `None` or `VitePress` if available |
| Build command | `bun run docs:build` |
| Build output directory | `.vitepress/dist` |

### Important Notes

- `wrangler.toml` is already included in the repository
- `bun.lock` is already included in the repository
- Cloudflare can auto-detect the Bun-based project setup

The repository is already prepared for Pages deployment, so you usually do not need to add any extra build files.

## Step 5: Deploy

Click **Save and Deploy**.

Cloudflare Pages will:

1. clone your repository
2. install dependencies
3. run the build command
4. publish the generated VitePress site

After a successful deployment, Cloudflare will give you a default Pages URL similar to:

```text
https://epusdt-docs.pages.dev
```

## Step 6: Add a Custom Domain (Optional)

If you want to use your own domain for the docs site:

1. Open your Pages project in Cloudflare
2. Go to **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain, for example `docs.example.com`
5. Follow the DNS instructions provided by Cloudflare

Once DNS is active, the docs site will be available on your custom domain.

## Step 7: Update the Site Later

Once Pages is connected to GitHub, updates are automatic.

Whenever you push changes to the tracked branch:

1. Cloudflare starts a new build
2. the docs are rebuilt
3. the latest version is published automatically

This makes it easy to keep the documentation synchronized with repository changes.

## Troubleshooting

### Build failed on Cloudflare Pages

Check these settings first:

- Build command: `bun run docs:build`
- Output directory: `.vitepress/dist`

Also make sure your fork includes the repository files:

- `wrangler.toml`
- `bun.lock`
- `package.json`

### The site deploys but pages are missing styles or assets

Confirm that the VitePress base path matches your deployment setup. If you are deploying to a normal Pages project root, the default configuration is usually correct.

### I want to deploy Epusdt itself on Cloudflare Pages

You cannot run the Epusdt payment service on Pages because Pages is for static sites. Use a server or container platform for Epusdt itself.
