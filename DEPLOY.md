# Deployment

One repository, two providers:

| Part | Provider | Root | Domain |
|---|---|---|---|
| API | Render (Bun runtime) | repo root | `backend.shifaul.dev` |
| Web | Vercel (Next.js) | `apps/web` | `shifaul.dev` |

The application URLs, env vars, database, and cookies are unchanged from the
two-repo layout. Only build/start commands and paths differ.

## Render — API

**Settings → Build & Deploy**

| Setting | Value |
|---|---|
| Repository | `khanshifaul/shifaul.dev` |
| Branch | `main` |
| Root Directory | *(blank — repo root)* |
| Build Command | `bun install && bun run --filter '@shifaul/api' db:generate && bun run --filter '@shifaul/api' build` |
| Start Command | `bun run --filter '@shifaul/api' start:prod` |
| Health Check Path | `/api/health` |

`render.yaml` encodes the same commands. Keep every env var already configured in the
dashboard (`DATABASE_URL`, `JWT_SECRET`, OAuth, R2, Telegram, AI keys, …).

Migrations are not run during the build. Run them once from the Render shell when the
schema changes:

```bash
bun run --filter '@shifaul/api' db:migrate
```

Verify:

```bash
curl -fsS https://backend.shifaul.dev/api/health
curl -fsS https://backend.shifaul.dev/api/projects/public/projects | head
# Swagger: https://backend.shifaul.dev/api/docs
```

Rollback: set Repository back to `khanshifaul/backend.shifaul.dev`, restore the old
commands (`bun install && bunx prisma generate && bunx nest build`, `bun run start:prod`),
and redeploy. The previous successful deploy also stays live while a new build fails.

## Vercel — web

**Settings → Git / Build & Development**

| Setting | Value |
|---|---|
| Repository | `khanshifaul/shifaul.dev` |
| Root Directory | `apps/web` |
| Install Command | `cd ../.. && bun install` |
| Build Command | `bun run build` |
| Framework Preset | Next.js |
| Include source files outside the Root Directory | enabled |

Keep `NEXT_PUBLIC_API_URL` unchanged (production: `https://backend.shifaul.dev/api`).
Do **not** add an `/api/*` rewrite: the web app owns `/api/projects` and
`/api/sitemap/*`.

Rollback: reconnect the old repo, or promote the previous production deployment.

## Cutover order

1. Deploy the API from the monorepo; verify `/api/health` and a public endpoint.
2. Deploy the web app; verify sign-in, `/admin`, `/blog`, `/portfolio`, sitemap/robots.
3. No DNS changes are needed.

Previous deployments and both old repositories remain available until the new setup has
been stable for a day or two.
