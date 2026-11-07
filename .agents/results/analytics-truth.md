---
id: analytics-truth
title: Ticket analytics report measured values, not zero placeholders
status: done
gate: human
approved: yes
---

## Summary

The admin `getTicketAnalytics` and public `getEnhancedAnalytics` endpoints no
longer return zero for metrics the schema cannot measure. `customerSatisfaction`
is `null` (no rating column on `SupportTicket`), `firstResponseTime` is the mean
time to the first non-internal staff `TicketReply` in minutes (`null` when no
ticket has a reply yet), monthly counts and growth are computed from `createdAt`,
and `averageResolutionTime` is computed per priority from the proxy each endpoint
already used (admin: `updatedAt - createdAt`; public: `closedAt - createdAt`).
Each average is `null` when its denominator is zero. The admin Swagger example
now matches the real shape and units, and the stale "implement complete service"
TODO is gone.

## Files changed

- `apps/api/src/admin/services/admin-support-ticket.service.ts`
- `apps/api/src/admin/services/admin-support-ticket.service.spec.ts`
- `apps/api/src/admin/controllers/admin-support-ticket.controller.ts`
- `apps/api/src/support-tickets/support-tickets.service.ts`
- `apps/api/src/support-tickets/support-tickets.service.spec.ts`
- `apps/api/src/common/utils/permission.util.ts` — `STAFF_ROLES` extracted so
  the DB filter and `isStaff` cannot disagree on which roles are staff.

## Verify

Typecheck (whole API, including both new specs):

```
$ cd apps/api && ../../node_modules/.bin/tsc -p tsconfig.json --noEmit
tsc exit: 0
```

New specs:

```
$ bun run --filter '@shifaul/api' test -- --testPathPatterns='(admin-support-ticket|support-tickets).service.spec'
Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
```

Full unit suite:

```
$ bun run --filter '@shifaul/api' test
Test Suites: 6 passed, 6 total
Tests:       27 passed, 27 total
```

E2E suite:

```
$ bun run --filter '@shifaul/api' test:e2e
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

Not verified: the Prisma `author: { roles: { hasSome: [...] } }` filter was not
exercised against a real Postgres — this worktree has no database, and the unit
specs stub Prisma. It typechecks against the generated client; `hasSome` on a
`String[]` column is standard Prisma/Postgres behaviour.

## Commit

`151d36c7e05233a567bfd3cb7930e47dfcb6814f` — implementation; the result file
follows in its own commit on `foreman/analytics-truth`.

## Blockers

none

## Reflection

The public service could not be imported by a Jest spec at all:
`support-tickets.service.ts` imports `storage.service.ts`, which imports
`uuid@13` — ESM-only — and this Jest config has no `transformIgnorePatterns`
for it, so the suite died at import. Mocking `../storage/storage.service` in the
spec fixed it without touching shared Jest config. Not recorded in the memory
store: single occurrence, and the `jest.mock` comment in the spec now carries the
reason to the next reader.

Scope call worth knowing: `averageResolutionTime` returns `null` instead of `0`
when no ticket has resolved. The brief only named the four placeholders and the
per-priority figure, but "0 hours average" over zero tickets is the same
fabrication the task exists to remove, and no consumer reads the field.
