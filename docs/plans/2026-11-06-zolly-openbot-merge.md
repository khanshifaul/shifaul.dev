# Merging zolly and OpenBot — engineering plan

Date: 2026-11-06 · goal: one local product with OpenBot's usability and zolly's
governance. Licence is out of scope per the founder; this is the engineering.

## Shape of the merge

The two codebases cannot be merged line by line: zolly is ~10k lines of Rust,
OpenBot is an Electron/TypeScript app. The merge is **architectural** — zolly's
core becomes a daemon, OpenBot's UX model becomes its client.

```
                    ┌──────────────────────────────┐
                    │  web UI (React SPA)          │
                    │  offices · queue · gates ·    │
                    │  agent chat · recall · audit  │
                    └──────────────┬───────────────┘
                          HTTP + WS │ (127.0.0.1:9900)
                    ┌──────────────▼───────────────┐
                    │  zolly daemon (Rust/axum)     │
                    │  queue · governance · ledger  │
                    │  knowledge · offices · events │
                    └───┬─────────┬─────────┬──────┘
                        │         │         │
                   ACP/pipe     MCP      SQLite + files
                        │         │         │
              ┌─────────▼──┐  ┌───▼────┐  ┌─▼──────────────┐
              │ runtimes:  │  │ tools  │  │ .agents/ queue │
              │ omp,herdr, │  │ browser│  │ results, gates │
              │ claude,codex│ │ kb     │  │ Kùzu store     │
              │ llama.cpp  │  └────────┘  └────────────────┘
              └────────────┘
```

Rules that keep the merge honest:

1. **Files stay the source of truth.** `.agents/queue/*.md`, `results/*.md`,
   the ledger and git remain canonical. SQLite is an index rebuilt from them,
   never the other way round.
2. **The UI is a view.** Every UI action is a CLI verb (`zolly task approve`,
   `zolly queue pause`, …). No state exists only in the UI.
3. **Runtimes are adapters.** A seat is "some agent with a conversation id",
   not "an omp process". Today: herdr kinds. New: ACP, OpenAI-compatible,
   llama.cpp.
4. **Governance is not optional.** The reviewer gate and `gate: human` sit in
   the daemon path, not in the prompt, so a client cannot skip them.

## Feature matrix

| Feature | zolly today | OpenBot today | Merged target |
|---|---|---|---|
| Per-project offices + rules/personas | yes | no | zolly, exposed in UI |
| Reviewer merge gate, human gates | yes | no (never-approve default) | zolly, enforced in daemon |
| Task queue | files, manual | FIFO, pause/resume/cancel, crash-safe | durable queue + worker loop |
| Agent runtimes | herdr kinds, omp pinned | 11 CLIs via ACP + OpenAI-compatible | runtime registry (ACP first) |
| Per-agent workspace + conversation | worktree per task | workspace + conversation per agent | per-seat home + persisted conversation id |
| Model switch keeping context | no | yes | yes (conversation id survives switch) |
| Agent-to-agent messaging | radio bus, note-only | first-class messages/handoffs | radio stays the authority; UI shows threads |
| Embedded browser | omp CDP relay (outside zolly) | Electron browser + computer use | CDP/Playwright tool behind a gate |
| Context monitoring/compaction | harness-side | per-agent, automatic | event-driven, reported in UI |
| UI | terminal/Telegram | desktop + mobile | local web app |
| Knowledge base | 24 KB text memory | none | Kùzu vector+graph + `zolly recall` |

## Protocols and data

- **Runtime control:** ACP over stdio for CLI harnesses; JSON lines for herdr;
  OpenAI-compatible HTTP for `llama.cpp` and other endpoints.
- **UI:** REST for reads/writes, WebSocket for the event stream.
- **Tools:** MCP (browser, knowledge, shell) unchanged.
- **Persistence:** SQLite (`~/.local/state/zolly/<frequency>.db`) indexing
  offices, seats, tasks, runs, events, approvals; files remain canonical.

```sql
office(id, path, frequency, created_at)
seat(id, office_id, role, runtime, model, conversation_id, state)
task(id, office_id, title, status, gate, priority, created_at, updated_at)
run(id, task_id, seat_id, started_at, ended_at, exit_code, log_path)
event(id, office_id, ts, kind, actor, task_id, payload_json)
approval(id, task_id, gate, requested_at, decided_at, decided_by, decision)
```

## API v1

```
GET  /api/offices
GET  /api/offices/:id            state: queue, seats, gates, results
GET  /api/tasks?status=          list + filters
POST /api/tasks                  create (same shape as a queue brief)
POST /api/tasks/:id/pause|resume|cancel
GET  /api/tasks/:id              events, run log, diff, result
POST /api/tasks/:id/approve      gate: human only
GET  /api/agents                 seats with runtime/model/health
POST /api/agents/:id/model       switch model, keep conversation
GET  /api/recall?q=              knowledge query
WS   /api/events                 office-wide event stream
```

## Phases

### P1 — knowledge base (3–4 h)
Kùzu graph + vectors, embeddings from llama.cpp on 8080, ingest estate + office
memory + docs, `zolly recall`.
*Accept:* five fixed questions answered with citations; one graph query
("which projects are unversioned") answered from the graph alone.

### P2 — daemon + index (3–4 days)
`zolly serve` on 9901; axum + tokio; SQLite index built from `.agents/`; event
stream; `zolly brief --json` re-implemented on top of it (same output).
*Accept:* `zolly serve` and the CLI report identical queue and gate state after
a restart; killing the daemon loses no task.

### P3 — runtime registry + ACP (4–6 days)
`runtime/` with a `SeatRuntime` trait: `start`, `send`, `status`, `stop`,
`switch_model`. Implement `herdr` (today's behaviour), `acp` (Claude/Codex/
Gemini/Grok/OpenCode/Cursor/Cline/Kimi/Devin/Copilot), `openai-compat`
(llama.cpp/Ollama/LM Studio). Persist `conversation_id` per seat.
*Accept:* the same task runs under two different runtimes; switching a seat's
model mid-task keeps its conversation; no persona edit is needed to change it.

### P4 — durable queue (3–4 days)
Worker loop with leases and heartbeats; statuses from the queue contract
(queued/dispatched/blocked/done/failed/escalated); pause/resume/cancel;
crash recovery on daemon start; `zolly queue` CLI verbs.
*Accept:* a queued task survives a daemon kill; a cancelled task leaves no
worktree; a stalled worker is reported by `zolly brief` within one tick.

### P5 — web UI (5–7 days)
React + Vite SPA served by axum: offices, seats, queue board, task detail
(events, diff, result, gates), approvals, recall search, settings.
*Accept:* every screen reads from the API only; approve/retry actions call the
same code path as the CLI; no layout rewrite needed for mobile widths.

### P6 — browser + computer use (3–4 days, optional)
Browser tool over CDP (reuse omp's relay) or Playwright; every action gated and
audited before execution; screenshot stream into task detail.
*Accept:* a task can open a page and read it, and the action appears in the
event log before the effect.

### P7 — packaging (2 days)
Single `zolly` binary; `zolly serve` supervises the UI assets, embedder and
optional llama.cpp; systemd user unit; `--no-browser` headless mode.
*Accept:* fresh clone → install → `zolly serve` → working office in one command.

## Engineering constraints

- **Memory:** 11 GB total, ~5 GB free. No Docker, no Electron, no per-agent
  containers. One llama.cpp process (1.4 GB) + daemon + UI is the budget.
- **No second orchestrator.** OpenBot's queue and zolly's queue must not both
  run; the merged product has exactly one queue (P4).
- **Event log first.** Every mutation is an event row before it takes effect,
  which is what makes the UI, the CLI and the audit agree.
- **Windows/macOS:** deferred; the daemon is POSIX-first, the UI is
  platform-neutral, which keeps the door open.

## Effort and order

P1 → P2 → P3 → P4 → P5 → (P6) → P7. P1 is hours; P2–P5 are the product and
are realistic in 3–4 working weeks for one engineer. Everything after P2 is
visible, which is what makes the merge worth doing rather than a rewrite.
