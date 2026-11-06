# Local LLM stack for Zolly + Butlar

Date: 2026-11-06 · status: proposed (nothing built yet)

Goal: one on-workstation stack that serves both consumers — the Zolly manager
seat's cheap local roles **and** Butlar's retrieval — with no network egress:
a llama.cpp server running LFM3, plus a local vector + graph store.

## Measured before planning

- **No GPU.** `nvidia-smi` is absent; the box is CPU-only.
- **11 GB RAM, ~5 GB available**, 132 GB free disk. Anything multi-GB must be
  context-bounded and not run beside a heavy build.
- **llama.cpp is installed but too old.** `/usr/bin/llama-server` reports
  `0.6.0-dev (build 11429, commit d812350493)`. Loading the model fails with
  `unknown model architecture: 'lfm3'` — LFM3 support merged in
  llama.cpp PR #31252 on 2026-10-27 and needs a build at or above ~b12088.
- **The model is already on disk**, exactly as asked:
  `~/models/lfm3v/LFM3-VL-2B-Q4_K_M.gguf` (1.1 GB) and
  `~/models/lfm3v/mmproj-LFM3-VL-2B-Q8_0.gguf` (194 MB).
- **Naming correction:** LFM3 ships as `LFM3-1.7B` (text only) and
  `LFM3-VL-2B` (vision). There is no 1.7B VL — the vision model is 2B. The
  downloaded file is the VL 2B and is the right pick.
- **omp already speaks to llama.cpp.** `omp` 18.12.6 auto-discovers the
  `llama.cpp` provider at `http://127.0.0.1:8080` (override
  `LLAMA_CPP_BASE_URL`), keyless, and today routes `memory`/`smol`/`tiny` to
  `llama.cpp/Qwen3.5-0.8B-Q4_K_M`. No `models.yml` entry is needed.
- **Python 3.14.8, no pip, `uv` present.** Kùzu 0.11.3 publishes cp314 wheels.

## Decisions

| # | Decision | Choice | Why |
|---|---|---|---|
| D1 | Model | LFM3-VL-2B Q4_K_M + mmproj Q8 | already downloaded; vision; 256K native context (capped locally) |
| D2 | Runtime | llama.cpp built from source at ≥ b12088 | the packaged binary cannot load `lfm3` |
| D3 | Context | `-c 16384` (raise only with measured RAM headroom) | 256K KV cache does not fit 5 GB free RAM on CPU |
| D4 | Embeddings | a second llama-server on :8081 with an embedding GGUF (nomic-embed-text-v1.5, 768d) | LFM3 is a chat model; the store needs vectors |
| D5 | Store | **Kùzu** embedded (one file, graph + vector index) | single dependency, no server, cp314 wheels |
| D6 | Scope | workstation only (Zolly + local Butlar dev) | production Butlar runs on Render; a local server cannot serve it |
| D7 | Network | bind `127.0.0.1` only | local model, no egress, no auth exposure |
| D8 | Ports | zolly listeners own **9901–9999** (shifaul-dev 9901, zylosync 9902, pijunctionbd 9903, guzia 9904); llama.cpp serves **8080**; embeddings 8081 | founder rule: nothing of zollybot sits below 9901 |

Alternatives rejected: SQLite + `sqlite-vec` (vector only; graph becomes manual
joins), Postgres + pgvector + Apache AGE (no local server running and three
moving parts), Neo4j/Memgraph (JVM/container weight for a few thousand nodes).

## What the estate audit changes

`~/Documents/SrcRoot-Project-Estate-Audit-2026-11-05.pdf` (5 Nov 2026, 11 pages)
reconciles **63 project directories across four roots** — `/mnt/Studio/Projects/
srcroot`, `/mnt/Studio/Projects/MyLab`, `/mnt/Studio/Projects/ReLab`,
`~/Projects` — with **50 nested git repos**, 16 safe deletes (≈10.6 GB) and
**four unversioned directories that exist nowhere else**. It changes this plan in
four ways.

1. **The corpus is the estate, not one repo.** Butlar/Zolly should know that
   zylosync is the flagship (1,999 commits, pushed daily), that shifaul.dev has
   four copies, that `MyLab/filestorage` is the most complete file-storage
   service and has **zero commits**, and that company IP sits in the personal
   GitHub account. That is exactly a graph, not a pile of chunks.
2. **Ingest metadata first, source second.** The audit proves the 64 GB is
   almost entirely `node_modules` and build output. Index source, docs and repo
   metadata; exclude `node_modules`, `.next`, `dist`, `.git/objects`. Expect a
   few megabytes per project, not gigabytes.
3. **Model the dispositions as data.** `DELETE`, `FIX THEN DELETE`, `KEEP`,
   `ARCHIVE`, `RISK` become node properties and edges, so "what is safe to
   delete" and "what has no remote" are queries, not re-derivations.
4. **Everything stays on this machine.** The audit is marked confidential and
   names clients. A local-only store is not a preference here — it is the
   reason the stack exists. Bind `127.0.0.1`, never send chunks to a hosted
   embedder, and never ingest `.env`, keystores (the opencallrec signing key),
   or `.git` internals.

Two practical consequences: the store lives on local NVMe (`~/data/kb`), not on
the `/mnt/Studio` network mount that took 44 minutes to sweep, and ingestion
reads those mounts with `git -c safe.directory=*` because the checkouts are
root-owned.

## Phase 1 — runtime and model (≈30 min)

```sh
git clone https://github.com/ggml-org/llama.cpp ~/src/llama.cpp
cd ~/src/llama.cpp && cmake -B build -DGGML_NATIVE=ON -DCMAKE_BUILD_TYPE=Release
cmake --build build -j"$(nproc)" --target llama-server llama-cli
build/bin/llama-server --version   # must be >= b12088
```

Replace `/usr/bin/llama-server` with the built binary (symlink or PATH prefix);
keep the packaged copy until the new one is proven.

Serve:

```sh
llama-server -m ~/models/lfm3v/LFM3-VL-2B-Q4_K_M.gguf \
  --mmproj ~/models/lfm3v/mmproj-LFM3-VL-2B-Q8_0.gguf \
  --alias LFM3-VL-2B-Q4_K_M --host 127.0.0.1 --port 8080 \
  -c 16384 --jinja -t 6
```

**Acceptance:** `/v1/models` lists the alias; a text chat returns; one image
prompt returns a description; record tok/s, first-token latency, and RSS.

## Phase 2 — wire omp (≈20 min)

1. `LLAMA_CPP_BASE_URL=http://127.0.0.1:8080` in `~/.omp/agent/.env`.
2. `omp models find LFM3` shows `llama.cpp/LFM3-VL-2B-Q4_K_M`.
3. Reassign only cheap roles — `memory`, `smol`, `tiny` — and keep `default`,
   `plan`, and `task` on the remote model until Phase 4 proves quality.
4. Set an explicit empty fallback chain for those roles if the workload must
   stay local.

**Acceptance:** a session runs memory extraction on the local model (worker log
or `omp` usage shows no remote spend), and JSON/tool-call output parses.

## Phase 3 — local vector + graph store (≈3–4 h)

Tooling lives outside the product repo: `~/src/kb/` (uv venv, Python 3.14).

Schema (verify exact DDL and the vector-index procedure against Kùzu 0.11 docs
before writing it):

- `Doc(id, source, title, path, ingested_at)`
- `Chunk(id, text, embedding FLOAT[768], tokens)`
- `Entity(id, name, kind)` — `kind` ∈ person, project, repo, account, decision,
  learning, file
- `PART_OF(Chunk→Doc)`, `MENTIONS(Chunk→Entity)`, `RELATES(Entity→Entity, kind)`
- Estate edges: `LIVES_IN(Project→Workspace)`, `OWNED_BY(Project→Repo)`,
  `HOSTED_ON(Repo→Account)`, `DUPLICATE_OF(Project→Project)`,
  `STATUS(Project→Disposition)` with `unversioned` and `last_activity` on the
  project node
- vector index on `Chunk.embedding`, cosine

Ingest sources, in order: the audit PDF (structured into project/repo/disposition
nodes — the graph seed), `.agents/memory/{decisions,learnings,goal}.md`,
`docs/`, `README.md`/`DEPLOY.md`, `.agents/rules/*`, then per-project source
across the four roots, metadata before code. Chunk ~800 tokens with 15%
overlap; embed through the :8081 server; dedupe by `(source, hash)`; skip
`node_modules`, build output, `.git` internals, `.env` and keystores.

**Acceptance:** ingest count reported per root; a hand-picked query returns the
right docs in the top 3; a two-hop graph query answers "which decisions touch
support-tickets" from the graph alone; a second query answers "which projects
are unversioned and have no remote" from the graph alone.

## Phase 4 — retrieval + answer path (≈1 h)

`kb ask "<question>"`: embed → top-k chunks → expand one graph hop → build a
bounded prompt (≤6K tokens) → LFM3 → answer with `source:line` citations.
`kb query` returns raw hits for the agent to use as context.

**Acceptance:** ten fixed questions answer correctly with citations; wrong
answers are recorded rather than hidden. Only after this does any planning or
default role move local.

## Phase 5 — durability (≈45 min)

- Two systemd **user** units: `llama-lfm3.service` (:8080),
  `llama-embed.service` (:8081); `Restart=on-failure`, `MemoryMax=4G`.
- A `zolly doctor`-style probe: server up, model loaded, embedder answering.
- Stop both when idle for a day; the store is files, so nothing is lost.

## Risks

1. **Quality.** A 2B model is not a manager. Local is right for extraction,
   titles, retrieval and summarization; planning and tool-heavy work stay
   remote until Phase 4 shows it can hold. Do not swap `default` on optimism.
2. **CPU latency.** Expect roughly 10–25 tok/s generation on this box, with
   prefill dominating long prompts. Retrieval must send few, small chunks.
3. **RAM.** 1.4 GB model + KV cache + 0.15 GB embedder + Kùzu; 16K context is
   the ceiling until measured otherwise. Never run this beside a full web build.
4. **License.** LFM3 ships under `lfm1.0`; check commercial terms before wiring
   it into anything customer-facing.
5. **Confidentiality.** The estate audit is internal and names clients, and
   several projects hold secrets (`.env`, the opencallrec keystore). The store
   must stay on this machine, exclude those files at ingest, and never use a
   hosted embedding endpoint. One accidental upload is worse than no index.
6. **Drift.** The store is a cache of the estate; re-ingest on merge and after
   the audit's runbook, or it starts answering from stale truths — including
   from directories that were deleted.

## What needs approval

Phases 1–2 change the workstation (build + service env). Phase 3+ adds a new
local tool. Nothing here touches production, spend, or customers.
