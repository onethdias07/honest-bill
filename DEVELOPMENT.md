# Development

Technical notes for running, self-hosting, and working on HonestBill. See [README.md](README.md) for the product overview.

## Stack

- **Next.js 16** (App Router, Server Actions) + **React 19** + TypeScript
- **Tailwind CSS v4** + a hand-rolled ShadCN-style component kit (`src/components/ui`)
- **Prisma 7** with the **`@prisma/adapter-pg`** driver adapter → **PostgreSQL** (Neon in production; any Postgres works)
- Money stored as integer **cents**; durations as integer **seconds** (no float bugs)

## Run locally

Requires Node 20+ and a PostgreSQL database (a free [Neon](https://neon.tech) project is easiest).

```bash
cp .env.example .env       # set DATABASE_URL to your Postgres connection string
npm install
npx prisma db push         # create the schema in your database
npx prisma db seed         # optional: demo clients / projects / time
npm run dev                # http://localhost:3000
```

`npx prisma studio` opens a database browser.

## Self-hosting

HonestBill is open-source ([AGPL-3.0](LICENSE)) and self-hostable on any Node host + any PostgreSQL database (Neon, Supabase, RDS, or your own server).

```bash
git clone https://github.com/onethdias07/honest-bill.git
cd honest-bill
npm install
cp .env.example .env       # set DATABASE_URL (Postgres). Founding/PayPal vars are optional.
npx prisma db push         # create the schema
npm run build              # runs `prisma generate`, then builds
npm run start              # serves on port 3000
```

Deploys cleanly to any Node platform (Vercel, Render, Fly.io, a VPS). On serverless, use a **pooled** Postgres connection string.

> Note: authentication isn't implemented yet (single workspace) — see the roadmap. The PayPal env vars only affect the public landing page.

## Routes

- `/` — public marketing / founding landing (no sidebar)
- `/dashboard` · `/time` · `/clients` · `/projects` · `/invoices` · `/import` · `/charter` — the app (sidebar shell), under the `src/app/(app)/` route group
- `src/lib/` — db client, session, money helpers, Harvest import (CSV + API)
- `prisma/` — schema + seed

## Data model

`User → Client → Project → TimeEntry / Expense → Invoice`. See [`prisma/schema.prisma`](prisma/schema.prisma).

## Roadmap

1. **Auth (Auth.js)** — replace the single demo user in `src/lib/session.ts`
2. **Invoice PDF export** (react-pdf)
3. **Send invoices** + pay-by-card link
4. **Harvest importer** — verify the API path end-to-end
5. **Recurring invoices**, multi-currency, team seats
6. **Docker image** for one-command self-hosting

## License

[AGPL-3.0](LICENSE). You may self-host, modify, and fork it; if you run a modified version as a network service, the AGPL requires you to publish your changes.

## Note on versions

This stack is newer than most tools' training data (Next 16 / Prisma 7 / Tailwind v4). See `AGENTS.md`.
