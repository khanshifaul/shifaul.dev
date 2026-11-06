# Open Questions

The register of decisions only the founder can make. It exists because the
failure mode it prevents is silent: an agent hits an ambiguity, picks a
plausible default, and the assumption is then buried in a change nobody re-reads.

Each entry has a short question, why it matters, the options and their costs,
and a blank Answer line.

An entry is deleted when it is answered — the answer goes into a rule or a
memory file, not into a register of things still open.

## Size thresholds for this repo

What makes a change LARGE here — how many files, how many diff lines, which
areas? `rules/project.md` has four threshold rows waiting on this, and foreman
and workers scope against them.

Options: (a) conservative default — 3+ files or 200+ diff lines is LARGE;
(b) tighter — 2+ files; (c) leave it and keep every change manual.

**Answer:** assumed 2026-11-06 — 3+ files, 200+ lines, or more than one app is LARGE. Written into `project.md`; override there and delete this entry.
