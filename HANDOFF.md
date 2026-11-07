# Handoff — 2026-11-07

**Working repo from now on: `/home/khan/Projects/zollybot`.** This office (shifaul.dev) is paused; its only waiting item is the founder's gate.

## Landed (this office)
- Nothing today. Working tree clean; `main` equals `origin/main` (`6021ce8`).

## Landed (zollybot repo, where the day's work went)
- 0.62.10 released and installed: offices/employments (migration 59), hire/end, office routes, butler, floor strip, floor-scoped roster, TUI three-pane/lobby/prefix/mouse.
- Latest commits: `78accf8` (events carry the enriched roster), `29496dc` (service stays up after window close).

## In flight / blocked
- **gate: human** — `analytics-truth.md` is waiting on the founder.
- ZollyBot conversation routes (`GET /v1/conversation`, `POST /v1/agents/<id>/message`) not built: blocks TUI chat.
- Unreproduced `ConversationReadStore.adoptMemberState` exception; no matching log line.

## Not started
- P6 client-mode window.
- TUI search/palette from the herdr reference (`~/Projects/lab/herdr`).
- Settings → Background server panel.
- Collapse the three agent shapes into one projection.

## Next action
Work in `~/Projects/zollybot`; first task there is the two conversation routes. The shifaul-dev office needs only the founder's gate answer.
