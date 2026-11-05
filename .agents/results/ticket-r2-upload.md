---
id: ticket-r2-upload
title: Store support-ticket attachments in R2, not mock URLs
status: done
gate: human
approved: yes
---

## Summary

`uploadFilesToExternalAPI` now uploads every attachment through
`StorageService.uploadFile(buffer, originalname, mimetype, 'support-tickets')`
and returns the real `fileUrl`/`key` pairs; the `mock-id-*` ids and
`https://storage.shifaul.dev/mock/*` URLs are gone.

`createTicket` and `createReply` now upload **before** their Prisma `create`,
so a failed upload leaves no ticket or reply row behind; both persist the real
URLs in `fileUrls` on the create call itself, which also removes the old
create-then-update round trips.

Unconfigured R2 is detected by a new `StorageService.isConfigured()` and fails
with **503 Service Unavailable** (`File storage is not configured; attachments
cannot be uploaded`) before any row is written. An upload that fails after
configuration returns **500 Internal Server Error** (`Could not upload file`)
from `StorageService`, unchanged, and likewise writes no row.

`SupportTicketsModule` imports `StorageModule`, which already exports
`StorageService`; no second S3 client is constructed.

## Files changed

- `apps/api/src/support-tickets/support-tickets.service.ts`
- `apps/api/src/support-tickets/support-tickets.module.ts`
- `apps/api/src/storage/storage.service.ts`

## Verify

Build and the project test command:

```
$ bun run --filter '@shifaul/api' build
@shifaul/api build: Exited with code 0

$ bun run --filter '@shifaul/api' test
@shifaul/api test: Test Suites: 1 passed, 1 total
@shifaul/api test: Tests:       3 passed, 3 total
@shifaul/api test: Exited with code 0

$ bun run --filter '@shifaul/api' test:e2e
@shifaul/api test:e2e: Test Suites: 1 passed, 1 total
@shifaul/api test:e2e: Tests:       2 passed, 2 total
@shifaul/api test:e2e: Exited with code 0
```

Behavioural smoke (throwaway spec, deleted before commit; not in this diff).
It booted the real `SupportTicketsController` + `SupportTicketsService` with a
stubbed `DatabaseService`, overrode `AccessTokenGuard` to supply
`{ id: 'user-1', roles: [] }`, and posted real multipart requests:

```
$ bunx jest --config r2-smoke.jest.json
UNCONFIGURED_TICKET 503 {"message":"File storage is not configured; attachments cannot be uploaded","error":"Service Unavailable","statusCode":503}
CONFIGURED_TICKET 201 {"success":true,"message":"Support ticket created successfully","data":{"id":"ticket-1","title":"with file","priority":"NORMAL","createdById":"user-1","fileUrls":["https://cdn.test/support-tickets/abc.png"]}}
FAILED_TICKET 500 {"message":"Could not upload file","error":"Internal Server Error","statusCode":500}
UNCONFIGURED_REPLY 503 {"message":"File storage is not configured; attachments cannot be uploaded","error":"Service Unavailable","statusCode":503}
CONFIGURED_REPLY 201 {"success":true,"message":"Reply added successfully","data":{"id":"reply-1","ticketId":"ticket-1","authorId":"user-1","content":"see attached","isInternal":false,"fileUrls":["https://cdn.test/support-tickets/reply.png"]}}
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

The same spec asserted the negative half of each case: unconfigured and failed
uploads leave `prisma.supportTicket.create` / `prisma.ticketReply.create`
uncalled, the configured case calls `uploadFile` with
`(Buffer.from('hello'), 'proof.png', 'image/png', 'support-tickets')`, and the
response contains no `mock` string.

Real `StorageService.isConfigured()` (run with `bun`, throwaway script deleted):

```
$ bun run .r2-isconfigured-smoke.ts
isConfigured with empty env: false
isConfigured with all five vars: true
isConfigured with only bucket: false
```

R2 credentials are absent on this machine: `env | grep -c '^R2_'` returned `0`
and there is no `apps/api/.env`. So the real-network PUT to Cloudflare was
**not** exercised — the configured path above proves argument and persistence
wiring, not a live upload. The unconfigured path was exercised against the real
`StorageService` and returned the 503 above.

## Commit

`d99b88c776fb5ceae2fac321284c202d8ce68e25` (code; this result file is the
commit after it)

## Blockers

none — real R2 upload not runnable here because no credentials are present, as
the brief allowed. The result records `gate: human` rather than the brief's
`auto` because this changes runtime behaviour (`.agents/worker/generic.md`:
"Never for a behaviour change").

## Reflection

Nothing to record. The repo's `uuid@13` is ESM-only, so a Jest spec that imports
`StorageService` fails on `require(esm)`; that is a test-harness limitation, not
a product defect, and mocking `uuid` was enough for a throwaway check. No rule
change proposed.
