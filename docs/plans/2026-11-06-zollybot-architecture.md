# zollybot — how it will work

Date: 2026-11-06 · status: design, before any code.

`zollybot` is the cross-platform front end to zolly's per-repo offices. **zolly
itself does not change.** The office kit, the CLI, the queue/result contracts,
the reviewer gate and the git-native state stay exactly as they are; zollybot is
a server plus apps that drive them.

## The split

Agents cannot run on a phone, and a repo should not be cloned onto five devices.
So zollybot is two things:

- **zollybot server** — runs on the machine that owns the repositories. It is a
  daemon that **invokes the unchanged `zolly` binary** and reads/writes the same
  `.agents/` files. One server per machine, N offices (one per repo).
- **zollybot app** — one codebase, five platforms. On desktop it can embed the
  server so a single install "just works"; on mobile it is a thin client that
  connects to a server.

```
        iPhone / Android / desktop app
                    │  HTTPS + WebSocket (LAN or Tailscale)
        ┌───────────▼────────────┐
        │  zollybot server       │   one per machine
        │  REST · WS · pairing   │
        │  queue · gates · kb    │
        └───────────┬────────────┘
                    │  CLI calls + .agents/ files (unchanged)
        ┌───────────▼─────────────────────────────┐
        │  zolly (unchanged)                      │
        │  office per repo → herdr → omp / ACP    │
        │  worktrees · reviewer gate · results     │
        └─────────────────────────────────────────┘
```


## What the OpenBot clone changes

Cloned 2026-11-06 to `~/Projects/lab/openbot` (shallow, 211 MB). Its real
structure changes the build plan: the five platforms already exist.

| OpenBot part | Stack | What zollybot reuses |
|---|---|---|
| desktop app (repo root) | Electron + SolidJS | the desktop shell and renderer |
| `src/backend` | agent runtime, provider adapters, event storage, queues, browser host | the runtime and queue substrate |
| `src/main` | Electron lifecycle, trusted IPC, **host server**, OS adapters | the host server that mobile joins |
| `apps/mobile` | Expo React Native | Android + iOS |
| `packages/contracts` | boundary types, limits, validation | the protocol to extend |
| `remote/api` | Bun service: WebRTC SDP/ICE, TURN, relays | remote join transport |

So the earlier Tauri + React proposal is dropped. zollybot is a **fork of OpenBot
with a zolly integration layer**:

1. `src/backend/zolly/` — a new adapter that discovers offices (repos with
   `.agents/`), invokes the unchanged `zolly` CLI, and maps zolly's queue
   contract and gates onto OpenBot's event/queue model.
2. `packages/contracts` — a `zolly-office-v1` capability: list offices, queue,
   gate, approve, recall. Same pattern as the existing `storage-v1` capability.
3. Renderer — an Offices screen, a queue board and a gate card; agents stay the
   existing OpenBot agents, but a task can be bound to an office.
4. Mobile — reuses the same capability over the existing team protocol; no new
   mobile app.

This removes the UI, mobile and remote-transport work from the critical path:
zollybot is then an integration and a governance layer, not a new product shell.

**Deliberate difference from OpenBot:** OpenBot's agents run
`danger-full-access` with approvals off. zollybot keeps zolly's gates in the
backend path, so a task bound to an office cannot merge without the reviewer
step, whatever the client asks for.

## Platform matrix

| Platform | Server | App | What it does |
|---|---|---|---|
| Linux | yes | yes | host repos and agents; full UI |
| macOS | yes | yes | same |
| Windows | yes (WSL or native) | yes | same; herdr seats may stay on the WSL side |
| Android | no | yes | control surface: queue, gates, chat, recall |
| iOS | no | yes | control surface, same features |

One shared Rust core (office model, queue, knowledge, protocol) compiled into
every target. One UI codebase in React, packaged by **Tauri v2**, which ships
desktop bundles and iOS/Android binaries. No Electron, no second runtime.

## Keeping the per-repo office strategy

- An **office is a repository**, not a machine. `zollybot init <repo>` runs the
  existing `zolly init` and registers that repo with the server.
- The app lists offices; switching offices switches queue, seats, gates and
  knowledge. Nothing is shared implicitly between repos.
- The server never edits `.agents/` semantics: it runs zolly verbs and reads the
  documented files. If zolly changes, zollybot follows the CLI, not a fork of it.
- Removing a repo from the server is unregistering it; the office stays in the
  repo and keeps working from the terminal.

## How a task flows

1. In the app, pick an office, write a task, submit. The server writes the
   normal queue brief through `zolly route`/`zolly foreman`.
2. Foreman opens the worktree, starts the worker (herdr/omp or an ACP runtime).
3. Events stream to the app over WebSocket: queued → dispatched → worker log →
   result file → review.
4. If the task hits `gate: human`, the app shows an approval card. Approving
   calls the same staff-only path the CLI uses.
5. Reviewer merges; the app shows the merge SHA and the result file.
6. Nothing is stored only in the app. Kill it mid-task and reopen: the state is
   the same because it was always the files.

## Connection and security

- The server binds loopback by default. LAN access is opt-in and pairing is a
  short code plus a long token stored in the OS keychain.
- For remote use, Tailscale/WireGuard is the transport; no public port.
- Mobile clients are read-mostly: they can approve gates and create tasks, not
  run shell. Every action lands in the event log with the client identity.
- Windows/macOS agents run as the logged-in user, same model as zolly today.

## What stays out

- No agent execution on phones; no repo clones on phones.
- No second queue and no second state store: zolly's files stay canonical, and
  the server's SQLite is a rebuildable index.
- No change to zolly's chain or gate model.

## Repository shape (once approved)

```
zollybot/
├── crates/
│   ├── core/      office model, queue, protocol, knowledge
│   ├── server/    axum daemon, zolly CLI adapter, pairing
│   └── client/    Tauri Rust shell
├── app/           React UI (one codebase, responsive)
├── docs/
└── scripts/       build matrix: linux, macos, windows, ios, android
```
