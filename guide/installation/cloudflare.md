# Cloudflare Pages Deployment

This page explains how to deploy the **documentation site** — the `epusdt-docs` VitePress project — to **Cloudflare Pages**.

::: warning
This guide is for the **documentation website only**.

It does **not** deploy the Epusdt payment service itself. Epusdt is a server application and should be deployed with Docker, BaoTa, or a manual server setup.
:::

## What you are deploying

The `epusdt-docs` repository is a static VitePress site.

Repository:

- [https://github.com/GMwalletApp/epusdt-docs](https://github.com/GMwalletApp/epusdt-docs)

## Prerequisites

Before starting, make sure you have:

- a GitHub account
- a Cloudflare account
- permission to create or fork a repository

## Step 1: Fork or connect the repository

Use the docs repository:

- [https://github.com/GMwalletApp/epusdt-docs](https://github.com/GMwalletApp/epusdt-docs)

After forking, you may have a repository like:

```text
https://github.com/your-username/epusdt-docs
```

## Step 2: Open Cloudflare Pages

1. Sign in to Cloudflare
2. Go to **Workers & Pages**
3. Click **Create application**
4. Choose **Pages**
5. Click **Connect to Git**

## Step 3: Connect your repository

1. Authorize GitHub access if Cloudflare asks
2. Select your `epusdt-docs` repository
3. Continue to build settings

## Step 4: Configure build settings

The repository uses this script:

```json
"docs:build": "vitepress build"
```

Use these Cloudflare Pages settings:

| Setting | Value |
|--------|-------|
| Framework preset | `VitePress` if available, otherwise `None` |
| Build command | `bun run docs:build` |
| Build output directory | `.vitepress/dist` |

## Base path caveat

The docs site uses the VitePress `base` setting from `VITEPRESS_BASE`, and falls back to `/` when that variable is not set.

That means:

- normal root deployment on a Pages domain usually works with the default config
- if you publish the site under a subpath, you must set a matching `VITEPRESS_BASE`

Example:

```text
VITEPRESS_BASE=/docs/
```

Without a matching base path, links or static assets may break even though the build succeeds.

## Step 5: Deploy

Click **Save and Deploy**.

Cloudflare Pages will:

1. clone your repository
2. install dependencies
3. run the build command
4. publish the generated static files

After a successful deployment, you will get a Pages URL similar to:

```text
https://your-project.pages.dev
```

## Step 6: Add a custom domain (optional)

If you want to use your own domain for the docs site:

1. open your Pages project
2. go to **Custom domains**
3. click **Set up a custom domain**
4. enter a domain such as `docs.example.com`
5. follow Cloudflare's DNS instructions

## Updating the site later

Once Pages is connected to GitHub, pushes to the tracked branch trigger a rebuild automatically.

## Troubleshooting

### Build fails on Cloudflare Pages

Check these values first:

- Build command: `bun run docs:build`
- Output directory: `.vitepress/dist`

Also make sure the repository still contains the normal project files such as `package.json` and the VitePress source content.

### The site deploys but styles or assets are missing

This usually means the deployed URL path and the VitePress base path do not match.

If you are deploying under a subpath, set `VITEPRESS_BASE` to the same path, including the trailing slash.

### Can I deploy Epusdt itself on Cloudflare Pages?

No. Cloudflare Pages is for static sites, while Epusdt itself is a backend application with runtime configuration, storage, and payment-processing logic.
