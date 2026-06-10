# Development

Technical notes for running and working on HonestBill. See [README.md](README.md) for the product overview.

## Stack

- **Next.js 16** (App Router, Server Actions) + **React 19** + TypeScript
- **Tailwind CSS v4** + a hand-rolled ShadCN-style component kit (`src/components/ui`)
- **Prisma 7** with the **better-sqlite3** driver adapter (SQLite for dev/self-host; swap the adapter for Postgres in production)
- Money stored as integer **cents**; durations as integer **seconds** (no float bugs)

## Run locally

```bash
cp .env.example .env      # then fill in the values
npm install
npx prisma db push        # create the SQLite DB from the schema
npx prisma db seed        # optional: demo clients / projects / time
npm run dev               # http://localhost:3000
```

`npx prisma studio` opens a database browser. The SQLite file is `dev.db` at the project root; config lives in `.env`.

## Project structure

- `src/app/(app)/` — the app (sidebar shell): dashboard, time, clients, projects, invoices, charter, import
- `src/app/founding/` — public founding / pre-order page (no sidebar)
- `src/app/actions.ts`, `src/app/import/actions.ts` — server actions (mutations)
- `src/lib/` — db client, session, money helpers, Harvest import (CSV + API)
- `src/components/ui/` — UI kit
- `prisma/` — schema + seed

## Data model

`User → Client → Project → TimeEntry / Expense → Invoice`. See [`prisma/schema.prisma`](prisma/schema.prisma).

## Roadmap

1. **Auth (Auth.js)** — replace the single demo user in `src/lib/session.ts`
2. **Invoice PDF export** (react-pdf)
3. **Send invoices** + pay-by-card link
4. **Harvest importer** — verify the API path end-to-end
5. **Recurring invoices**, multi-currency, team seats
6. **Postgres adapter + Docker** for self-hosting

## Note on versions

This stack is newer than most tools' training data (Next 16 / Prisma 7 / Tailwind v4). See `AGENTS.md` — read the bundled docs in `node_modules/next/dist/docs/` before changing framework-level code.
