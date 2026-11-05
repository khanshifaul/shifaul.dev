# Learned knowledge

Every entry below is **believed** until a human runs `memory confirm <id>`.
A believed entry is a claim an agent made, not a verified fact.

Do not relitigate a settled entry unless a LATER entry supersedes it.
Nothing is ever deleted — a correction supersedes, so the next agent can see
the question was already answered.

Live window: newest 30 entries. Older entries roll to
`archive/learnings-<YYYY-MM>.md` on the next write.

## Content

Open questions for the founder are NOT stored here. They live in
`OPEN-QUESTIONS.md` and are deleted when answered.

## L-0001 | 2026-11-05 | believed | foreman/test-harness

In apps/api, jest cannot resolve the app until moduleNameMapper covers BOTH import forms: the tsconfig baseUrl form ('prisma/generated/client' -> '<rootDir>/../prisma/$1', and '^src/(.*)$' in the e2e config whose rootDir is test/) AND the generated Prisma client's own relative '.js' specifiers ('^(\.{1,2}/.*)\.js$' -> '$1'). Mapping only the baseUrl form loads past database.service.ts and then fails on './internal/class.js'. rootDir=src also means every baseUrl path maps to '<rootDir>/../<path>', not '<rootDir>/<path>'.
