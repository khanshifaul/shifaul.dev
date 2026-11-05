---
id: test-harness
title: Restore the API jest suite
status: done
gate: auto
---

## Summary

Jest could not load `apps/api` because neither jest config mapped the app's
non-relative imports: the tsconfig baseUrl form `prisma/generated/client`, the
`src/...` form used by the e2e tree, and the generated Prisma client's own
relative `./x.js` specifiers. Added those `moduleNameMapper` entries to
`apps/api/package.json` (unit) and `apps/api/test/jest-e2e.json` (e2e), rewrote
`app.controller.spec.ts` against the real `getHealth()` / `redirectToFrontend()`
behavior (the old spec asserted a `getHello()` that `AppController` does not
have), and rewrote the e2e spec to boot the real root routes over HTTP with the
database stubbed — the full `AppModule` cannot boot without a live database and
a complete environment. `test` now runs 3 tests, `test:e2e` 2 tests, both exit 0.

## Files changed

- `apps/api/package.json` — `jest.moduleNameMapper` (prisma baseUrl + `.js`)
- `apps/api/test/jest-e2e.json` — same mappings plus `^src/(.*)$`
- `apps/api/src/app.controller.spec.ts` — asserts `getHealth()` UP/DOWN and the
  302 redirect target
- `apps/api/test/app.e2e-spec.ts` — `GET /` → 302 `Location: FRONTEND_URL`,
  `GET /health` → 200 with component status, `DatabaseService` stubbed
- `.agents/rules/project.md` — `test-command:` line filled in
- `.agents/memory/learnings.md` — L-0001 (the mapping trap, see Reflection)

## Verify

Reproduced on `f61ab81` before any change (`test`):

```
$ bun run --filter '@shifaul/api' test
  ● Test suite failed to run
    Cannot find module 'prisma/generated/client' from 'database/database.service.ts'
Test Suites: 1 failed, 1 total
Tests:       0 total
Exited with code 1
```

With the unit mapping added but `jest-e2e.json` still untouched, the e2e run
failed on the next unresolved form:

```
$ bun run --filter '@shifaul/api' test:e2e
    Cannot find module 'src/utils/logger/logger.service' from '../src/users/users.module.ts'
Test Suites: 1 failed, 1 total
Tests:       0 total
Exited with code 1
```

Final run (the exact `test-command:` recorded in `project.md`), exit 0:

```
$ bun run --filter '@shifaul/api' test && bun run --filter '@shifaul/api' test:e2e
@shifaul/api test: Test Suites: 1 passed, 1 total
@shifaul/api test: Tests:       3 passed, 3 total
@shifaul/api test: Snapshots:   0 total
@shifaul/api test: Ran all test suites.
@shifaul/api test: Exited with code 0
@shifaul/api test:e2e: Test Suites: 1 passed, 1 total
@shifaul/api test:e2e: Tests:       2 passed, 2 total
@shifaul/api test:e2e: Snapshots:   0 total
@shifaul/api test:e2e: Ran all test suites.
@shifaul/api test:e2e: Exited with code 0
EXIT=0
```

Nothing is skipped: `test` executes `src/app.controller.spec.ts` (3 tests),
`test:e2e` executes `test/app.e2e-spec.ts` (2 tests).

e2e rewrite reason: importing the real `AppModule` pulls in
`DatabaseService`, whose `onModuleInit()` calls `$connect()`, and a
`ConfigModule` whose Joi schema requires `DATABASE_URL` and `JWT_SECRET`. The
suite therefore wires `AppController` + `AppService` with the real
`ConfigService`/`DatabaseService` tokens (database stubbed) and exercises the
routes through `supertest`, which is the substitute the brief authorised.

## Commit

`cbcb258` (suites and config); `learnings.md` and this result file follow in a
second commit.

## Blockers

none

## Reflection

Correction recorded as L-0001: the brief's two mappings are necessary but not
sufficient when the tree also imports through the tsconfig baseUrl `src/...`
form — the e2e config has `rootDir: test`, so that form needs its own
`^src/(.*)$` → `<rootDir>/../src/$1` entry, and `rootDir: src` means every
baseUrl path maps to `<rootDir>/../…`, not `<rootDir>/…`. It cost two test runs
to notice (first `prisma/…`, then `src/…`), which is the kind of thing the next
agent would re-derive from scratch. Everything else in the brief matched what
the tree did.
