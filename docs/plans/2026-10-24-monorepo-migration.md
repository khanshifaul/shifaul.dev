# Monorepo Migration Plan — shifaul.dev

**Date:** 2026-10-24
**Goal:** One Bun-workspace repo, `apps/api` (NestJS) + `apps/web` (Next.js), following the
`guzia-high-school` layout and Bun commands, while keeping the current deployments intact:
**Render** for the API and **Vercel** for the web app.

**Hard invariant:** no application code, API URL, env var, database URL, cookie/CORS rule, or
domain changes. Only paths and build/start commands change. If that invariant holds, both
deployments can be switched independently and rolled back independently.

---

## 1. Current state (verified)

| Thing | Value |
|---|---|
| API repo | `git@github.com:khanshifaul/backend.shifaul.dev.git`, branch `main`, clean except untracked `docs/` |
| Web repo | `git@github.com:khanshifaul/frontend.shifaul.dev.git`, branch `master`, modified + untracked `.agents/*` |
| API deploy | Render service `backend-shifaul`, `runtime: bun`, no repo-local root dir |
| Web deploy | Vercel project linked to the web repo (no local `.vercel/`) |
| Local Bun | 1.4.3 |
| Secret files | `.env*` are gitignored in both repos; only `.env.example` is tracked |
| API entry | `nest build` → `dist/src/main.js`; `start:prod` = `node dist/src/main` |
| Prisma | `schema.prisma` at app root, client generated to `prisma/generated`, imported as `prisma/generated/client` (resolved by `baseUrl: "."`) |
| API static uploads | `ServeStaticModule` with `join(process.cwd(), 'uploads')`, served at `/files` |
| Web API calls | `process.env.NEXT_PUBLIC_API_URL`, fallback `https://backend.shifaul.dev/api` in production |
| Web has its own `app/api/*` routes | `/api/projects`, `/api/sitemap/*` — must not be shadowed by a proxy rewrite |

The two repos have unrelated histories. The migration preserves both histories; no squash.

---

## 2. Target layout

```
shifaul.dev/
├── apps/
│   ├── api/                    # former backend.shifaul.dev (minus .git)
│   │   ├── src/
│   │   ├── prisma/             # schema + generated client (tracked, as today)
│   │   ├── test/
│   │   ├── nest-cli.json
│   │   ├── prisma.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json        # @shifaul/api
│   └── web/                    # former frontend.shifaul.dev (minus .git)
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── next.config.ts
│       ├── proxy.ts
│       └── package.json        # @shifaul/web
├── .agents/                    # moved from the web repo root (agent office)
├── .claude/                    # moved from the web repo root
├── .omp/                       # moved from the web repo root (check absolute paths)
├── .github/                    # moved from the API repo root
├── docs/
│   └── plans/2026-10-24-monorepo-migration.md
├── bun.lock                    # single lockfile
├── package.json                # workspace root + filters
├── mise.toml                   # [tools] bun = "latest"
├── render.yaml                 # API deploy config, repo-root commands
├── .gitignore
├── .dockerignore
├── README.md
└── DEPLOY.md
```

`linkedin/`, `weld/`, `TODO.md` and the old repo folders from the parent directory are **not**
part of the monorepo. The staging directory keeps them out by construction.

---

## 3. Root `package.json` (exact)

```json
{
  "name": "shifaul.dev",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "bun run --parallel --filter '@shifaul/*' dev",
    "dev:api": "bun --filter '@shifaul/api' dev",
    "dev:web": "bun --filter '@shifaul/web' dev",
    "build": "bun --filter '@shifaul/*' build",
    "build:api": "bun --filter '@shifaul/api' build",
    "build:web": "bun --filter '@shifaul/web' build",
    "start": "bun run --parallel --filter '@shifaul/*' start",
    "test": "bun --filter '@shifaul/api' test",
    "test:e2e": "bun --filter '@shifaul/api' test:e2e",
    "lint": "bun --filter '@shifaul/*' lint",
    "format": "bun --filter '@shifaul/api' format",
    "db:generate": "bun --filter '@shifaul/api' db:generate",
    "db:migrate": "bun --filter '@shifaul/api' db:migrate",
    "db:push": "bun --filter '@shifaul/api' db:push",
    "db:seed": "bun --filter '@shifaul/api' db:seed",
    "db:studio": "bun --filter '@shifaul/api' db:studio"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

Notes:
- `bun --filter` runs the script with `cwd = apps/<app>`, so `.env` loading, Prisma paths and
  `dist/` paths keep working unchanged.
- `apps/api/package.json`: `"name": "@shifaul/api"`, add `"private": true`, add
  `"dev": "nest start --watch"` (keep `start:dev` as-is), keep every existing script verbatim.
- `apps/web/package.json`: `"name": "@shifaul/web"`, keep every existing script verbatim.
- Delete `apps/api/bun.lock` and `apps/web/bun.lock`; generate one root `bun.lock`.
- The web app has no test script today; do not invent one. Root `test` runs the API Jest suite.

---

## 4. Files that must change

### 4.1 `apps/web/next.config.ts`
Pin tracing to the monorepo root, not the app dir:

```ts
const repoRoot = path.join(__dirname, "../..");
// ...
outputFileTracingRoot: repoRoot,
turbopack: { root: repoRoot },
```

Why: with a lockfile at the repo root, Next/Turbopack infers the monorepo root. The current
`turbopack.root = __dirname` (app dir) then fails module resolution in the workspace — the
rehearsal reproduced exactly that:

```
Error: Next.js inferred your workspace root, but it may not be correct.
We couldn't find the Next.js package (next/package.json) from the project directory:
  .../apps/web/app
```

Setting both `turbopack.root` and `outputFileTracingRoot` to `../..` makes the build pass and
keeps the old stray-lockfile protection. Everything else stays.

### 4.2 `render.yaml` (new, at repo root)

```yaml
services:
  - type: web
    name: backend-shifaul
    runtime: bun
    buildCommand: >-
      bun install &&
      bun run --filter '@shifaul/api' db:generate &&
      bun run --filter '@shifaul/api' build
    startCommand: bun run --filter '@shifaul/api' start:prod
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
```

- Keep all dashboard env vars exactly as they are (`DATABASE_URL`, `JWT_SECRET`, OAuth, R2,
  Telegram, AI keys…). They are not in git and need no edits.
- `bun run --filter` replaces `cd apps/api`; it is the same command Guzia uses.
- If `node dist/src/main` misbehaves under Render's Bun runtime, fall back to
  `bun dist/src/main.js` (Guzia's start command) — single-line rollback, no code change.

### 4.3 Root `.gitignore`
Union of both current ignores, with paths made repo-wide:

```
node_modules/
dist/
.next/
*.tsbuildinfo
coverage/
uploads/
logs/
.env
.env.*
!.env.example
.vercel/
.turbo/
graphify-out/
prisma/generated/        # only if you decide to untrack it; currently tracked (see §9)
```

Keep the frontend `.agents` runtime ignore block verbatim (STATE.md, queue/, runs/, etc.).
Keep `.agents/memory/` tracked as today.

### 4.4 Root `.dockerignore`
Copy Guzia's, adapted: `apps/web`, `**/node_modules`, `**/dist`, `**/.next`, env files,
agent dirs. Not used by Render today (Bun runtime, not Docker), but keeps a future Docker
path correct and mirrors the reference repo.

### 4.5 `mise.toml`
```toml
[tools]
bun = "latest"
```

### 4.6 Docs
- `README.md`: monorepo quickstart (`bun install`, `bun run dev`, `bun run build`,
  per-app env files).
- `DEPLOY.md`: Render + Vercel commands from §5/§6.
Do this in the same migration commit so the next person does not rediscover the layout.

---

## 5. Migration procedure

Work in a **staging directory**; do not mutate the live working copies until the build is
verified.

### Phase 0 — freeze and back up (5 min)
1. Freeze pushes to both repos.
2. `git -C backend.shifaul.dev bundle create ../backups/backend.bundle --all`
   `git -C frontend.shifaul.dev bundle create ../backups/frontend.bundle --all`
3. Commit the pending local changes in each repo **locally only** (no push):
   - API: `docs/ai-assistant/frontend-integration.md`
   - Web: modified + untracked `.agents/*`
   These commits are what `git subtree` will import. They do not touch the remotes, so they
   cannot trigger a deploy.

   If the checkout has unwritable git objects (this NTFS mount has root-owned objects),
   skip the commit, import the branch HEAD, then copy every path reported by
   `git status --porcelain` from the old working tree into the monorepo and commit it there.
   The migration result is identical; only the commit lands in the monorepo.

### Phase 1 — build the staging monorepo (no deploy impact)
```bash
mkdir -p ../shifaul.dev.staging && cd ../shifaul.dev.staging
git init -b main

# Import both histories, preserving every commit.
git subtree add --prefix apps/api ../shifaul.dev/backend.shifaul.dev main
git subtree add --prefix apps/web ../shifaul.dev/frontend.shifaul.dev master

# Move repo-root tooling out of the web app.
git mv apps/web/.agents .agents
git mv apps/web/.claude .claude
git mv apps/web/.omp .omp
git mv apps/api/.github .github

# Add root files, rename workspaces, delete nested lockfiles.
rm apps/api/bun.lock apps/web/bun.lock
# ... write package.json, mise.toml, .gitignore, .dockerignore, render.yaml, README, DEPLOY
# ... edit apps/api/package.json, apps/web/package.json, apps/web/next.config.ts

# Git only imports tracked files: copy the ignored local env files so the
# build and dev server see the same configuration as today.
cp ../shifaul.dev/backend.shifaul.dev/.env              apps/api/.env
cp ../shifaul.dev/backend.shifaul.dev/.env.development  apps/api/.env.development
cp ../shifaul.dev/frontend.shifaul.dev/.env.local       apps/web/.env.local
```

Then verify **before** pushing:

```bash
bun install                       # creates the single root bun.lock
bun run db:generate               # Prisma client into apps/api/prisma/generated
bun run build:api                 # nest build -> apps/api/dist/src/main.js
bun run build:web                 # next build
bun run test                      # API Jest — see §7, currently red before the migration too
```

Smoke test the runtime, not just the build:

```bash
# terminal 1
bun run dev

# terminal 2
curl -fsS http://localhost:4000/health
curl -fsS http://localhost:4000/api/projects | head
curl -fsS http://localhost:3000/ | head
```

Also exercise one authenticated flow in the browser (sign-in → admin page) because API URL
and cookie behavior are the parts most likely to regress.

### Phase 2 — publish
```bash
gh repo create khanshifaul/shifaul.dev --public --source=. --remote=origin --push
```
- Keep both old repos untouched (rollback).
- Check the push contains no secrets:
  `git ls-files | grep -E '(^|/)\.env($|\.)'` → only `.env.example` files.

---

## 5.1 Rehearsal results (verified 2026-10-24, `/tmp/shifaul-subtree-test`)

The full import + workspace reshape was executed against copies of both repos:

| Step | Result |
|---|---|
| `git subtree add` both repos (local paths) | ✅ 32 commits, both histories present |
| Root `bun install` with one lockfile | ✅ 1466 packages, 37 s |
| `bun run db:generate` | ✅ Prisma Client 7.10.1 → `apps/api/prisma/generated` |
| `bun run build:api` | ✅ `apps/api/dist/src/main.js` exists |
| `bun run build:web` after §4.1 fix | ✅ Next.js 16.2.6 Turbopack build, all routes emitted |
| `bun run build:web` before §4.1 fix | ❌ `Next.js inferred your workspace root…` (see §4.1) |
| `bun run test` | ❌ **pre-existing**: `prisma/generated/client` cannot be resolved by Jest, in the standalone repo too |

The API test failure is not caused by the migration. Optional separate fix (not part of this
migration): add a Jest `moduleNameMapper` like Guzia's:
`"^prisma/generated/(.*)$": "<rootDir>/../prisma/generated/$1"`.

---

## 6. Deployment cutover (API first, then web)

### 6.1 Render — in-place repo swap
Render keeps the previous successful deploy live if the new build fails, so this is
low-risk and preserves the service, env vars, and `backend.shifaul.dev` domain.

In **Render → backend-shifaul → Settings**:
| Setting | New value |
|---|---|
| Repository | `khanshifaul/shifaul.dev` |
| Branch | `main` |
| Root Directory | *(blank = repo root)* |
| Build Command | `bun install && bun run --filter '@shifaul/api' db:generate && bun run --filter '@shifaul/api' build` |
| Start Command | `bun run --filter '@shifaul/api' start:prod` |
| Health Check Path | `/health` |

Keep every env var as-is. Deploy, then:
```bash
curl -fsS https://backend.shifaul.dev/health
curl -fsS https://backend.shifaul.dev/api/projects | head
# Swagger: https://backend.shifaul.dev/api/docs
```
Rollback if needed: point Repository back to `backend.shifaul.dev` and restore the old
commands (`bun install && bunx prisma generate && bunx nest build`,
`bun run start:prod`), then redeploy.

### 6.2 Vercel — re-link the existing project
Vercel keeps the last good deployment live when a build fails, and the domain stays attached
to the project, so re-linking is safer than creating a second project and moving
`shifaul.dev`.

In **Vercel → project → Settings → Git / Build & Development**:
| Setting | New value |
|---|---|
| Repository | `khanshifaul/shifaul.dev` |
| Root Directory | `apps/web` |
| Install Command | `cd ../.. && bun install` |
| Build Command | `bun run build` |
| Framework Preset | Next.js |
| Include source files outside the Root Directory | **enabled** (required so `cd ../.. && bun install` can read the root `package.json` / `bun.lock`; the rehearsal kept `next` in `apps/web/node_modules`, so this is about install inputs, not hoisting) |

- Do **not** change `NEXT_PUBLIC_API_URL` (production value today is
  `https://backend.shifaul.dev/api`).
- Deploy a preview, verify sign-in, admin CRUD, blog, sitemap/robots, and chat; then promote.
- Rollback: reconnect the old repo, or promote the previous production deployment. The old
  repo still builds.

**Do not add** the Guzia-style `/api/*` rewrite to `apps/web`. This web app already owns
`app/api/projects` and `app/api/sitemap/*`; a catch-all rewrite would shadow them. Cross-origin
API calls with the existing `CORS_ORIGIN` are the current behavior and stay unchanged.

### 6.3 Cutover order / expected outage
1. API first: web continues calling `backend.shifaul.dev`, which now serves the same code.
2. Verify API.
3. Web second.
4. No DNS changes. Expected downtime: **none**; worst case is the old deployment serving
   until rollback.

---

## 7. Verification checklist

| Check | Command / observation |
|---|---|
| Workspace resolution | `bun install --frozen-lockfile` at root succeeds |
| API build | `bun run build:api`; `apps/api/dist/src/main.js` exists |
| Web build | `bun run build:web` |
| API tests | `bun run test` — **known red before migration** (`prisma/generated/client` Jest resolution); verify it is no worse |
| Prisma | `bun run db:generate`; `apps/api/prisma/generated/client.ts` regenerated |
| Local dev | `bun run dev`; API `/health`, web `/` |
| Auth | Browser sign-in → `/admin` loads and an authenticated request returns data |
| Render | `/health`, `/api/projects`, `/api/docs` on `backend.shifaul.dev` |
| Vercel | Home, `/blog`, `/portfolio`, `/sign-in`, `/admin`, `/sitemap.xml`, `/robots.txt` |
| Secrets | only `.env.example` tracked |
| Paths | `git grep -n "backend.shifaul.dev"` → only intentional runtime fallbacks |

---

## 8. Rollback

| Layer | Action |
|---|---|
| Render | Settings → Repository back to `backend.shifaul.dev`, restore old build/start, redeploy. Previous deploy is also one click away. |
| Vercel | Reconnect old repo and rebuild, or **Promote** the last good deployment. |
| Git | Old repos remain untouched and public until the monorepo is stable. |
| Local | Old folders stay as-is until after cutover; staging is disposable. |

Archive the old GitHub repos only after 24–48 h of stable production traffic.

---

## 9. Known risks and mitigations

| Risk | Mitigation |
|---|---|
| Vercel cannot see root `package.json` / `bun.lock` | Enable “include source files outside Root Directory”; check the build log's install step |
| Next/Turbopack rejects the app-pinned root in a workspace | Set `turbopack.root` + `outputFileTracingRoot` to the repo root (§4.1); rehearsal-verified |
| Prisma client path breaks | Every Prisma script runs via `--filter`, so `cwd = apps/api`; `baseUrl: "."` is unchanged |
| Render's Bun runtime is older than the local one | Production commands need only `bun install` + `--filter`; check the deploy log, and use `bun dist/src/main.js` if `node` is unavailable |
| `process.cwd()/uploads` changes location | Prod uses R2 (`StorageService`); local uploads land in `apps/api/uploads` via filtered scripts. Add `uploads/` to the root ignore file |
| `.agents` workflows reference `frontend.shifaul.dev` paths | After moving to root, `grep -rn "frontend.shifaul.dev" .agents` and fix path assumptions in the migration commit; `.agents/memory/` stays tracked |
| Two unrelated histories confuse tooling | `git subtree add` preserves both; tags/branches stay in the old repos |
| Accidental secret commit | `git ls-files | grep -E '(^|/)\.env($|\.)'` gate before push; `.gitignore` union |
| `prisma/generated` is tracked today despite the old ignore rule | Leave it tracked to minimize change; optionally untrack in a separate commit after deploy verification |

---

## 10. Out of scope

- Adding a Dockerfile for Render (current Bun runtime works; Guzia uses Docker but this repo
  does not need it).
- Same-origin `/api` proxy between Vercel and Render (would collide with `app/api/*`).
- Package/dependency upgrades, test additions, or code refactors.
- Changing domains, env vars, database, or CORS.

---

## 11. Execution order (short)

1. Back up + commit local changes locally.
2. Stage monorepo via `git subtree`, move root tooling, add root configs.
3. `bun install` → `db:generate` → build both → test → local smoke.
4. Create `khanshifaul/shifaul.dev`, push.
5. Re-point Render, verify API.
6. Re-point Vercel, verify web.
7. Watch logs for 24–48 h, then archive old repos.
