# Known issues — CR-DESIGN-SYSTEM-005

> **0 open defects. 0 open decisions.** Everything below is either recorded context, a session limit,
> pre-existing drift, or a watch item.

## A — this change's own recorded items

### A-1 🔴 One existing assertion was narrowed, and it is the only one

`tests/components/DocumentHeader.test.tsx`, spec *"reads NO session — the middle two slots come from
the origin prop"*, previously scanned this component's source for the concatenated string
`label="DC" value={props.origin.dcName}`. The label half necessarily moved when the label became
overridable.

It now scans for `value={props.origin.dcName}` **plus** `label={props.dcLabel ?? "DC"}`.
**Narrowed, never relaxed** — the spec's subject is the session guard, the value half carries that
claim in full, and the new default is pinned as well, so the file asserts strictly more than before.
Mutations M-1 and M-2 both redden it.

This was **found at planning time** (plan F-9 / §5.2), declared in the approved plan, and is not a
discovery of the build. The change request did not know about it.

### A-2 The plan's line estimate was exceeded by comments

`src/` came out `+30 / −1` against an estimated `+15 / −1`. Entirely the two fence comments written
out in full — zero extra behaviour, zero extra API. `revision-review.md` DEV-1.

### A-3 The audit probe's first run gave a false verdict

Caught, fixed, re-run, and logged as `defect-log.md` DEF-1. **Closed.** Second consecutive change whose
probe lied on its first attempt; carried to D-1 below.

## B — session limits, stated so nothing is over-claimed

### B-1 🔴 No consumer repository was read or run, and nothing claims one was

**Fifth change to record this.** Bananaworld-DC, -CRM, RMS and org-admin are outside this worktree and
permission-blocked. **No DC suite was executed.** The additive argument is a code argument (the prop is
`undefined`; `?? "DC"` yields the identical string) plus this repo's own mirrors — T-1, T-10, T-11.

### B-2 `pnpm audit` is permission-blocked in build sessions

The command was refused; it is **not** claimed as run. Reproduced in Node against npm's bulk advisory
endpoint (`test-results.md` §5). CI's `dependency-audit` job is authoritative.

### B-3 The kernel evidence template could not be copied

`_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md` is outside this workspace and the read is
refused. **Fifth change to hit this** (CR-001 … CR-004, and here). `evidence/milestone-evidence.md`
was authored to serve the same purpose and follows the stated rule — it **cites** each discrete
artifact by path, status and counts rather than restating it — and records the limitation at its top
rather than passing silently.

### B-4 🔴 OQ-2 is unanswerable from here, by design

Whether DC's `transaction-form-standard.test.ts` pins the full concatenated substring or only the value
half **cannot be checked from this worktree**. It is carried as a declared cross-repo item
(`defect-log.md` DEF-A, `developer-handover.md` §2) rather than guessed at. **DC is red nowhere
today** — it pins an older sha.

## C — pre-existing repository drift, all out of lane

### C-1 `pnpm format:check` fails repo-wide

There is **no prettier config**, so prettier's default 80-column width disagrees with the repo's house
style. Verified this session against **four files this change never touched** (`Input.tsx`,
`TablePagination.tsx`, `src/index.ts`, `src/components/index.ts`) — all four fail identically at
`HEAD`. **Not a CI job.** `ci.yml` itself records it as a follow-up ("run `prettier --write` once to
adopt it"), which is a repo-wide decision and not this change's to take: with no config it would
reformat existing source at default settings — a mass non-additive diff in an additive-only package.
**Fifth change to record it.**

### C-2 There is no `lint` script and no eslint config

`package.json` has `typecheck`, `test`, `format:check` and nothing else. `pnpm lint` therefore cannot
run, and it is not a CI job. Recorded, not invented. Fifth change to record it.

### C-3 There is no `audit:deps` script

The audit job in `ci.yml` is `pnpm audit --prod --audit-level=high`. There is no `pnpm audit:deps` in
this repository.

### C-4 `ci.yml`'s test job label is stale

It reads *"Test — pricing & sales-order engines"* but runs the whole suite, which is now 246 specs
across 13 files including every component. Cosmetic; **baseline CI jobs may be added to but never
weakened**, and renaming a job label is out of lane for this change. Fourth change to note it.

### C-5 `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist

Nor does a `governance/` directory. **Fifth consecutive change to raise it.** A governance decision for
the owner; a change may not invent a governance artifact. The six seams are recorded in
`centrality-scorecard.md` §2 instead.

## D — watch items for the next session

### D-1 🔴 Write the audit probe correctly the first time — twice now it has lied

CR-004's probe mis-parsed pnpm's peer-suffixed store directory names; this one walked a symlink's
lexical parent and compared numeric ids to GHSA strings. Both produced confident, wrong verdicts. Two
sanity checks catch this class instantly: **(a)** the prod closure should be ~70 packages, not ~16 —
`next` alone drags in dozens; **(b)** `nanoid@3.3.18` must be present, because the repo's override
exists to put it there. If either looks wrong, the probe is wrong, not the tree.

### D-2 🔴 The next change to touch `DocumentHeader.tsx` must not "tidy" the slot model

Folding `dcLabel` into `DOCUMENT_HEADER_SLOTS`, deriving labels from a lookup, or rebuilding the slot
list locally would keep every DOM spec green and still hand DC a broken contract test at its next pin
bump. That is mutation M-4 and it now reddens T-10 and T-11 immediately. The fence is in the source,
on the prop.

### D-3 The two label props must stay symmetrical

`dateLabel` and `dcLabel` both use `??`. If one ever gains a special case for `""`, they diverge and
T-9 fails. Fix the cause, not the spec.

### D-4 `DocumentHeaderProps` is now ten fields

Approaching the size where grouping is tempting. Grouping means reordering or nesting published
fields, which is non-additive. `readable-code-scorecard.md` W-2.

### D-5 Still open from earlier changes, and untouched by this one

CR-001's colour-stage chips on the tablet receiving screen; CR-002's DC document-header adoption (five
assertions redden **by design** and must be inverted, never relaxed); CR-003's seven-point CRM
saved-view obligation; CR-004's server-paging consumer obligation and DC's pin bump for `CR-DC-052`.
None is affected by this change.
