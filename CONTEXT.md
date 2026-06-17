# CONTEXT — start here

Orientation + handoff for anyone (human or AI) picking up HonestBill. Read this first, then [DEVELOPMENT.md](DEVELOPMENT.md) for run/self-host and [README.md](README.md) for the product pitch.

> Candid strategy, validation status, and next actions live in `INTERNAL.md` (gitignored — not in this public repo). If you're the owner/AI continuing the work, read that too.

## What this is

**HonestBill** — flat-rate, founder-owned, **open-source** time tracking → invoicing for freelancers and small agencies. The wedge: when a billing tool (e.g. Harvest, post-Bending-Spoons) reprices users overnight, HonestBill is the durable escape hatch. The moat is **structural trust** — a public Pricing Charter (no usage billing, capped increases, free export, acquisition clause) + an open-source, self-hostable core. Built by **OD Development** (a solo studio).

## Current status

- **Live:** https://honest-bill.vercel.app (auto-deploys on push to `main`)
- **Repo:** https://github.com/onethdias07/honest-bill (public, AGPL-3.0)
- **Phase:** early access / founding-member validation. **Not production-ready** — the hosted app is single-workspace and has **no authentication yet**; don't put real client data in the hosted demo.

**Built & working:** landing page (`/`), Pricing Charter (`/charter`), Trust & Data page (`/trust`), the app under `/dashboard` (clients, projects, time tracking via live timer + manual entry, expenses, invoice generation from unbilled work, invoice status flow), one-click **Harvest import** (CSV verified; API path wired, needs live-token verification), **JSON data export** (`/api/export`), and the founding/landing flow with a PayPal deposit button + scarcity counter.

**Not built yet (the "Tier-1" sprint, in priority order):**
1. **Auth (Auth.js)** — replace the single demo user in `src/lib/session.ts`. *Do this first.*
2. **Invoice PDF export** (react-pdf)
3. **Send invoice** + pay-by-card link (in-app payments)
4. Verify the Harvest **API import** end-to-end with a real token
5. Recurring invoices, multi-currency, team seats
6. Docker image for one-command self-hosting

## Stack & critical gotchas (READ before coding)

This stack is **newer than most training data** — `AGENTS.md` warns to read the bundled docs in `node_modules/next/dist/docs/` before changing framework-level code. Specifically:

- **Next.js 16** (App Router). `params` and `searchParams` are **Promises** — `await` them. Mutations are **Server Actions** (`"use server"`). DB-reading pages use `export const dynamic = "force-dynamic"`.
- **React 19**, TypeScript.
- **Tailwind CSS v4** — CSS-first. Theme tokens are in `src/app/globals.css` via `@theme inline` (no `tailwind.config`). The ShadCN-style UI kit in `src/components/ui` is **hand-rolled** — do **not** run the `shadcn` CLI (it's aggressively interactive and will hang).
- **Prisma 7** with **`@prisma/adapter-pg`** → **PostgreSQL** (Neon in prod). Gotchas:
  - `url` is **banned from `schema.prisma`** — the connection URL lives in `prisma.config.ts` (which calls `process.loadEnvFile()`), and the runtime client needs the **driver adapter** (`src/lib/db.ts`).
  - The build script is `prisma generate && next build` so Vercel generates the client.
  - Use Neon's **pooled** connection string with `sslmode=require` (drop `channel_binding=require` — `pg` chokes on it).
- **Money is integer cents; durations are integer seconds** (never floats).

## Architecture / routes

- `src/app/page.tsx` — public landing (root layout, **no sidebar**)
- `src/app/trust/`, `src/app/charter/`? → `/charter` lives under the app group; `/trust` is root-level public
- `src/app/(app)/` — the app behind a sidebar shell (`(app)/layout.tsx`): `dashboard`, `time`, `clients`, `projects`, `invoices`, `invoices/[id]`, `import`, `charter`
- `src/app/api/export/route.ts` — JSON data export
- `src/app/actions.ts` + `src/app/import/actions.ts` — server actions (mutations)
- `src/lib/` — `db.ts` (Prisma client + pg adapter), `session.ts` (**single demo user — no real auth yet**), `money.ts`, `import.ts` + `harvest-csv.ts` + `harvest-api.ts`
- `src/components/ui/` — hand-rolled UI kit; `paypal-button.tsx`, `reveal.tsx`, `app-sidebar.tsx`, etc.
- `prisma/` — `schema.prisma` (`User → Client → Project → TimeEntry / Expense → Invoice`) + `seed.ts`

## Environment variables

Set in `.env` locally and in Vercel (see `.env.example`). Names only here:
- `DATABASE_URL` (Neon pooled Postgres string) — **required**
- `FOUNDING_DEPOSIT_URL` (PayPal payment link), `PAYPAL_HOSTED_CLIENT_ID` (public, safe), `PAYPAL_HOSTED_BUTTON_ID`
- `FOUNDING_CLAIMED` (founding-spots count for the scarcity bar; code default reflects reality — bump as deposits land), `FOUNDING_DEMO_URL` (optional Loom), `FOUNDING_REPO_URL` (optional)
- `.env` is **gitignored** — never commit secrets. The PayPal *client-id* is public; the *secret/API creds* (for future webhook automation) are not set.

## Run / deploy

See **[DEVELOPMENT.md](DEVELOPMENT.md)**. Short version: `cp .env.example .env` (set `DATABASE_URL`) → `npm install` → `npx prisma db push` → `npx prisma db seed` (demo data) → `npm run dev`. Deploy = push to `main` (Vercel auto-builds).

## For an AI agent continuing this

1. Read `AGENTS.md` + the bundled Next docs before touching framework code.
2. **Verify every change with `npm run build`** (and a quick local smoke against the dev server). Dev servers can linger as background processes — stop them when done.
3. Local dev requires a real `DATABASE_URL` (Neon) — there is no SQLite fallback anymore.
4. Don't commit secrets (`.env`/`*.db` are gitignored). Don't add a `Co-Authored-By: Claude` trailer to commits (owner preference).
5. **Don't over-build.** The product is intentionally early pending the validation test — read `INTERNAL.md` for the decision rule before building Tier-1 features.

## Key decisions (and why)

- **Renamed HonestHarvest → HonestBill** — the old name carried the rival's "Harvest" trademark and pigeonholed the brand. (Competitor "Harvest" references — the importer, API URL, repricing copy — are intentionally kept.)
- **AGPL-3.0** — genuinely open source (so open-source/self-host channels accept it) *and* copyleft (stops a closed SaaS clone of the code).
- **Postgres/Neon, not SQLite** — needed a serverless-compatible DB for Vercel; Prisma can't do per-env providers, so it's Postgres everywhere.
- **PayPal, not Stripe** — the owner is in Sri Lanka, where Stripe isn't supported (PayPal inward-remittance went live there May 2026). Long-term: Stripe Atlas (US LLC) or a Merchant-of-Record.

## License

[AGPL-3.0](LICENSE).
