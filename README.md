# shifaul.dev

Monorepo for shifaul.dev: a Next.js frontend and a NestJS API, deployed separately
(Vercel + Render) from one repository and one Bun lockfile.

```
apps/
├── api/   NestJS 11 + Prisma 7, listens on :4000, Swagger at /api/docs
└── web/   Next.js 16 (App Router), listens on :3000
```

## Prerequisites

- [Bun](https://bun.sh) 1.4+
- PostgreSQL reachable through `DATABASE_URL` (for the API)
- Node is not required; production and scripts run on Bun

## Install

```bash
bun install
```

One lockfile lives at the repo root. Do not add `bun.lock` files inside `apps/*`.

## Environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Fill `DATABASE_URL`, `JWT_SECRET`, OAuth/R2/AI values as needed. The web app reads
`NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000/api`).

## Database

```bash
bun run db:generate     # Prisma client -> apps/api/prisma/generated
bun run db:migrate      # dev migrations
bun run db:seed         # seed data
bun run db:studio       # Prisma Studio
```

## Develop

```bash
bun run dev             # API + web in parallel
bun run dev:api         # API only (:4000, watch mode)
bun run dev:web         # web only (:3000)
```

Open http://localhost:3000. API health is http://localhost:4000/health.

## Build and test

```bash
bun run build           # both workspaces
bun run build:api
bun run build:web
bun run test            # API Jest suite
bun run test:e2e        # API e2e (needs a running API/DB)
bun run lint
```

## Deploy

Render runs `apps/api`; Vercel runs `apps/web` as the project root. Commands, env
names, and rollback steps are in [DEPLOY.md](DEPLOY.md).

## Notes

- `apps/api/prisma/generated/` is committed today; `bun run db:generate` refreshes it.
- Agent-office tooling (`.agents/`) lives at the repo root, matching the layout used
  by the other projects in `~/Projects`.
- Migration rationale: [docs/plans/2026-10-24-monorepo-migration.md](docs/plans/2026-10-24-monorepo-migration.md).
