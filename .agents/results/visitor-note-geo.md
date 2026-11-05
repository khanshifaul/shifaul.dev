---
id: visitor-note-geo
title: Visitor Telegram note carries IP, location, ISP and local time
status: done
gate: human
---

## Summary

The visitor-arrival Telegram note now renders `IP:`, `Location:` (city, region,
country code), `ISP:` and `Local time:` (visitor timezone clock), each omitted
when unresolved. The IP is the first `x-forwarded-for` hop else `req.ip`; the
location is resolved server-side by a new `GeoLookupService` (ipwho.is, 2s
timeout, 24h per-IP cache, never throws, private/loopback/`unknown` skipped) and
the notification stays fire-and-forget so `/analytics/visit` never waits on the
lookup. `body.country`/`body.city` are no longer rendered; existing IP+UA dedupe
is unchanged. Gate is `human` per `.agents/worker/generic.md` (behaviour change),
overriding the brief's `auto`.

## Files changed

- `apps/api/src/notifier/telegram.service.ts`
- `apps/api/src/notifier/telegram.service.spec.ts` (new)
- `apps/api/src/notifier/visitor-location.ts` (new — `VisitorLocation`, `formatVisitorLocalTime`)
- `apps/api/src/analytics/geo-lookup.service.ts` (new)
- `apps/api/src/analytics/geo-lookup.service.spec.ts` (new)
- `apps/api/src/analytics/analytics.controller.ts`
- `apps/api/src/analytics/analytics.controller.spec.ts` (new)
- `apps/api/src/analytics/analytics.module.ts`
- `apps/api/src/config/validation.schema.ts` (`GEOIP_URL`, optional, blank allowed)
- `apps/api/.env.example` (`GEOIP_URL` documented)

## Verify

Commands run in `/home/khan/Projects/shifaul.dev/.agents/worktrees/visitor-note-geo`:

```
$ bun install
1459 packages installed [749.00ms]

$ bun run --filter '@shifaul/api' test
Test Suites: 4 passed, 4 total
Tests:       19 passed, 19 total
Exited with code 0

$ bun run --filter '@shifaul/api' test:e2e
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Exited with code 0

$ cd apps/api && ./node_modules/.bin/tsc --noEmit -p tsconfig.json
TSC_OK (no output)

$ ./node_modules/.bin/eslint <new files>
exit=0
```

ESLint on the modified pre-existing files reports the same counts as at HEAD
(`telegram.service.ts` 11 prettier errors, `analytics.controller.ts` 7,
`validation.schema.ts` 1 CRLF) — verified by linting `git show HEAD:` copies;
no new lint errors were introduced.

Live provider check (read-only GET):

```
$ curl -sS 'https://ipwho.is/8.8.8.8?fields=success,city,region,country,country_code,connection.isp,timezone.id'
{"success":true,"country":"United States","country_code":"US","region":"California","city":"San Jose","connection":{"isp":"Google LLC"},"timezone":{"id":"America/Los_Angeles"}}
```

Unconfigured path: R2 credentials are absent on this machine and none were
needed — the change touches no storage. With `GEOIP_URL` blank the service
disables itself (test `disables lookups when GEOIP_URL is blank` passes) and the
note still renders `IP:`.

Tests cover: rendered note with full data (IP/Location/ISP/Local time, exact
`2026-11-04 22:15 (America/Los_Angeles)` formatting from a fixed instant),
empty/missing location, HTML escaping of IP and location values, provider
mapping, private/loopback/unknown skip, 24h cache, provider failure and
`success:false`, `GEOIP_URL` override/blank, and the controller returning before
the lookup resolves while still passing the header IP.

## Commit

79ed0ae

## Blockers

none

## Reflection

Nothing to record. The one environment fact worth noting is already covered by
the repo: `bun install` alone leaves `prisma/generated` unbuilt, so any script
importing `DatabaseService` outside jest needs `DATABASE_URL=… ./node_modules/.bin/prisma generate`
first; jest's `prisma/(.*)` moduleNameMapper hides this. It cost a few minutes
here, not a repeated correction.
