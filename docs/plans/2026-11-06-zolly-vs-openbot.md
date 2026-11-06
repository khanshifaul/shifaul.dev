# zolly vs OpenBot (openbot.run) — before the knowledge stack

Date: 2026-11-06 · scope: the decision to build a local vector + graph knowledge
base into zolly, compared against adopting OpenBot instead.

Sources: `openbot.run`, `github.com/nightly-labs/openbot` (README, LICENSE,
SECURITY), and zolly's own `COMPARISON.md` (2026-11-05 revision) plus the local
`~/Projects/zolly` tree.

## The two things

**zolly** — Apache-2.0 Rust binary; a repo-local **control plane**. Each git
project gets a `.agents/` kit (rules, personas, memory, queue/result contracts,
HR, skills, MCP). Agents run in Herdr panes, `omp` by default, any of 24 kinds.
Fixed chain: founder → Zolly → foreman → worker → reviewer, and the reviewer is
the only door to `main`. State is git: task branch, worktree, result file, PR.
No UI, Linux/systemd first.

**OpenBot (openbot.run)** — PolyForm Noncommercial 1.0.0 (commercial use needs a
paid licence; releases up to 0.1.11 were Apache-2.0). TypeScript desktop app for
macOS/Windows/Linux with iOS/Android clients. A **product**: named agents with
their own workspace, instructions and conversation; 12 provider runtimes
(Codex, Claude Code, Gemini, Grok, OpenCode, Cursor, Cline, Muse Code, Pi,
Mercury), custom ACP agents, OpenAI-compatible endpoints, and Ollama/LM Studio.
Agents message each other, hand off and review; a built-in browser; a task queue.
Data stays on the machine.

## Side by side

| Dimension | zolly | OpenBot (openbot.run) |
|---|---|---|
| Category | Repo-local control plane + prompt kit | Desktop product workspace |
| Licence | **Apache-2.0** — commercial use free | **PolyForm Noncommercial** — paid licence to use at SrcRoot |
| Agents run | Herdr panes; any of 24 harnesses, `omp` pinned | Bundled app; 12 runtimes + ACP + local Ollama/LM Studio |
| Model choice | Through the harness; no first-class knob | Per agent, switchable mid-task, keeps workspace + chat |
| Units of work | Task → worktree → worker → result → review → merge | Agent → workspace → conversation → queue |
| Human gates | `gate: human` for money/prod/publishing/customers; reviewer merge gate | None by default; the docs say agents act without asking |
| Audit | Rules, briefs, results and merge SHA are files in git | App state; no repo-level trail |
| State | Git + `.agents/` plain files, diffable | App-managed workspace/conversation data |
| Memory today | Bounded text store: 20 decisions, 30 learnings, 5 current, 24 KB; atomic; secret-refusing; committed | Conversations + workspace files; **no vector or graph retrieval** |
| Knowledge base | None yet (this is the plan) | None |
| UI | Terminal, Telegram, MCP, CLI | Desktop, iOS/Android, built-in browser |
| Multi-agent | Fixed role chain, one worker per task | Peer agents, handoffs, group coordination |
| Ops burden | git, Rust/omp/herdr, gh, optional Telegram/systemd | Download, sign in, connect a provider |
| Maturity | Solo, pre-1.0, 81 commits | 5,695 stars, 580 forks, 593 open issues, development preview |

## What each wins

**OpenBot wins on:** the desktop experience, mobile, multi-harness breadth
including local Ollama/LM Studio, provider switch without losing the agent's
context, agent-to-agent handoff, and a task queue. It is something a
non-technical operator can use.

**zolly wins on:** commercial-safe licensing, repo-native governance, the
reviewer gate, hard human gates, auditability as files under version control,
git-native state that survives a machine switch, per-project isolation of rules
and memory, and no vendor in the loop.

## The knowledge-stack question

Neither tool ships a knowledge base. OpenBot stores conversations and workspace
files; zolly stores at most 24 KB of text. So **adopting OpenBot does not remove
the work — it replaces one missing feature with a licensed dependency and no
retrieval at all.**

Building the vector + graph store into zolly is therefore the differentiator,
not a duplicate. Two things from OpenBot are worth copying anyway:

1. **Per-agent context that survives a provider switch.** zolly's memory is
   per-office; the stack should key retrieval per task and per role so a worker
   switch does not lose context.
2. **A visible activity trail in the UI sense.** zolly's trail is better
   (files in git), but it has no read surface; a `zolly recall <query>` command
   over the store is the cheap equivalent.

## Verdict

Keep zolly and build the knowledge stack as planned (Kùzu for graph + vectors,
embeddings from a local llama.cpp instance, ingest the estate, office memory and
docs). Do not adopt OpenBot for SrcRoot: its licence alone blocks company use
without a paid agreement, and it still has no retrieval layer to offer.

Revisit OpenBot only if the requirement changes from *governed repo work* to
*non-technical staff using agents on a desktop*, where its UI and mobile clients
are worth the licence.
