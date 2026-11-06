# rules/project.md — this project's truths

Everything in this file is **specific to this project**. The universal rules
live in `system.md`, `safety.md` and `workflows.md`; this file is the only
place that may name a directory, a service, a threshold or a command that
belongs to this codebase.

If this file disagrees with the tree, the tree is right and this file is a bug —
fix it here.

## Architecture

**shifaul.dev** — Shifaul Islam's personal site *and* the knowledge base behind
his AI agent: a public portfolio/blog/services front end over an API whose
Postgres knowledge tables feed the agent (the founder calls it **Butlar**) that
answers visitors on Shifaul's behalf. The repository is both presentation and a
durable record of who he is and what he is building.

- Application shape: two processes in one Bun workspace. `apps/api` — NestJS 11
  HTTP API on `:4000`, Swagger at `/api/docs`. `apps/web` — Next.js 16 App
  Router on `:3000`. Deployed separately: Render runs the API from the **repo
  root**, Vercel runs the web app from `apps/web`. Exact commands in
  `DEPLOY.md`.
- Persistence layer: PostgreSQL through Prisma (`apps/api/prisma/schema.prisma`,
  7 migrations). The client is generated into `apps/api/prisma/generated`;
  `DatabaseService` extends `PrismaClient` via `@prisma/adapter-pg`.
- Client side: the Next.js app — public pages (about, portfolio, service, blog,
  contact, terms, chat, resume) and a protected admin area (projects, blog
  posts, messages, subscribers, users, settings). The chat page calls
  `POST /ai-assistant/chat`.
- Knowledge base: the `knowledge_chunks` table, written only by the admin
  `POST /ai-assistant/ingest` endpoint (chunked, embedded, cosine-ranked in
  memory — no pgvector). The assistant's prompt lives in
  `apps/api/src/ai-assistant/ai-assistant.service.ts`.

test-command: bun run --filter '@shifaul/api' test && bun run --filter '@shifaul/api' test:e2e

`zolly verify <task-id>` runs that line in the task worktree and rewrites the
result's `## Verify` section.

## Where things live

| Concern | Path |
|---|---|
| Application code | `apps/api/src` (NestJS modules), `apps/web` (Next.js App Router) |
| Tests | `apps/api/src/**/*.spec.ts`; e2e in `apps/api/test/*.e2e-spec.ts` |
| Migrations | `apps/api/prisma/migrations` (7 as of 2026-11-06) |
| Documentation | `docs/`, `README.md`, `DEPLOY.md`, `HANDOFF.md` |
| CI config | none — there is no `.github/workflows`; verification is run by hand |

- Surprises a reader will hit: the API deploys from the repo root, not
  `apps/api`, so every Render command goes through
  `bun run --filter '@shifaul/api' …`; the root `.agents/` is the agent office
  (rules, memory, queue), not application code; the generated Prisma client is
  committed to git even though `apps/api/.gitignore` names a different path
  (`/generated/prisma`), so `bun run db:generate` can dirty the tree.
- Generated, never edited by hand: `apps/api/prisma/generated`,
  `apps/api/dist`, `apps/web/.next`, `node_modules`.

## Size thresholds

Assumed 2026-11-06 — the founder has not set these. Override the numbers here
and delete the matching entry in `OPEN-QUESTIONS.md`.

| Threshold | Value |
|---|---|
| A change is LARGE when it touches | more than one app (`apps/api`, `apps/web`) or the office layer |
| A change is LARGE when it spans more than | 3 files |
| A change is LARGE when it is more than | 200 changed lines |
| A diff is small when it is under | 200 lines within one app |

## Divisions / teams

Solo founder plus the office seats.

| Actor | Does |
|---|---|
| Shifaul (founder) | money, production, publishing, customers — the only `gate: human` |
| Zolly | briefs, routing, ledger, gates |
| Foreman | worktrees, workers, review handoff |
| Worker | code and docs, one task per branch, one result file |
| Reviewer | PASS / OBJECTION; the only path to `main` |

## Conventions this project has that the office does not

- Bun only. One root `bun.lock`; never add a lockfile under `apps/*`. Run
  scripts from the root with `bun run --filter '@shifaul/api' …` or
  `'@shifaul/web' …`.
- Prisma migrations are **not** run during deploy. After a schema change run
  `bun run db:migrate` from the Render shell; run `bun run db:generate` locally
  and expect the committed client to change.
- Env: `apps/api/.env` (`DATABASE_URL`, `JWT_SECRET`, OAuth, `R2_*`,
  `TELEGRAM_*`, `GEOIP_URL`, AI keys) and `apps/web/.env.local`
  (`NEXT_PUBLIC_API_URL`). `.env.example` sits beside each.
- The visitor ping `POST /analytics/visit` sends at most one Telegram message
  per IP+UA per 24 hours. IP and location are derived server-side
  (`x-forwarded-for`, then `GEOIP_URL`, default `https://ipwho.is`; blank
  disables lookups) — never from the request body.
- Deploy truth: health at `/api/health`, public smoke at
  `/api/projects/public/projects`, Swagger at `/api/docs` — see `DEPLOY.md`.

Project wiring the office reads from `.agents/zolly/config.toml`:

- frequency: `shifaul-dev`
- base branch: `main`
- remote: `origin`

## Optional tooling

gitnexus: off

The on-disk index (`.gitnexus/`) is stale — `meta.json` records commit
`5667407`. Turn this on only after `node .gitnexus/run.cjs analyze`.
