# Electron Server on Cloudflare

This project is a React + Vite frontend served by a Cloudflare Worker named `electron-server`. License data is stored in Cloudflare D1 and the Electron activation endpoints are preserved:

- `POST /api/verify`
- `POST /api/verify-license`

## Configure production admin access

The production Worker uses these secrets for admin login and signed sessions:

```bash
npx wrangler secret put ADMIN_ID
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
```

`SESSION_SECRET` should be a long random value. The Worker will not use the old default admin password in production.

The production D1 database is `electron-server-db`, with its schema in `migrations/0001_initial_schema.sql`.

## Deploy

```bash
npm run deploy
```

Current deployment URL:

`https://electron-server.yash-v-shinde.workers.dev`

## Local development

```bash
Copy-Item .dev.vars.example .dev.vars
npm run dev:worker
npm run dev
```

Vite runs at `http://localhost:5173` and proxies `/api/*` to the local Worker at `http://localhost:8787`.
