# Centrality scorecard — CR-DESIGN-SYSTEM-004

> Stage 05. Does this change put shared behaviour in the shared place, and what does it cost the rest
> of the estate? **Overall: 12 / 12 PASS. 5 cross-system seams mapped · 0 coordinated multi-app moves
> created.**

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | **Built in the shared package, not in a page** | PASS | This is the whole reason the change exists. The owner's standing rule of 2026-08-12: *"it's critically important that we always, for UI and design implementation, look at the shared design package… I don't want design things to be done within pages."* A paging control inside DC would be exactly the debt named there, and the CRM has the same unbounded-list problem coming |
| 2 | **One implementation, not sixteen** | PASS | Sixteen unbounded lists across four apps would otherwise each grow their own arithmetic. `offset` on the range means the number the bar prints and the number the query asks for come from one place (D-12) |
| 3 | **Reachable from the package root** | PASS | All three barrels appended and enumerated; both specs import from `../../src`, so a missed name fails the suite. `src/index.ts` enumerates `./lib` rather than starring it, so the four lib names had to be named there too — and are |
| 4 | **Does not fork or duplicate an existing primitive** | PASS | `Table` is not forked, wrapped or given a prop. The picker is this package's `Select`; the arrows are its `Button`. No second dropdown idiom, no second button style, no new token, no new dependency |
| 5 | **Additive — no existing caller is disturbed** | PASS | `src/` is **+24 / −0**: zero deletions, zero modified lines, zero exports moved. The two new files are files nothing imports yet. Toolbar snapshot hash unmoved (`ce7bd849…`); 189 existing specs pass unedited |
| 6 | **No consumer pin bumped** | PASS | No consumer file touched. Each consumer moves its own pin, in its own change, against the **merged** `main` sha — never a branch sha (KI-M001E19-002) |
| 7 | **No coordinated multi-app migration created** | PASS | Nothing renders differently in any app on the day this merges. No consumer must change a line to accommodate it; adoption is opt-in, per app, per screen, on each app's own clock |
| 8 | **Cross-system seams identified, not discovered later** | PASS | Five, in §2 below — including the one the request called out as the thing that makes this more than a button pair |
| 9 | **Pure presentation; no scope, permission or tenancy logic leaks in** | PASS | TECH-COMP-003 / ADR-001: no network, no fetch, no `warehouse_id`, no `legal_entity`, no session read. `page`, `pageSize` and `totalCount` are plain numbers; `offset` is arithmetic on the caller's own numbers, not an instruction to anybody. Guarded by `tsc --noEmit` with no `@/` alias |
| 10 | **No database, no migration, no app screen** | PASS | None added; the package has none by construction. `migrationExpected: false` |
| 11 | **The estate-wide trap is named and owned, not left implicit** | PASS | Under option (a) the trap moves to the consumer, and that is stated in the three places the plan required: the fenced comment atop `TablePagination.tsx`, `developer-handover.md` §2, `technical-debt.md` TD-1. It is also the only entry in the debt file, so the next closeout folds it into the registers |
| 12 | **Shipping reality stated, so nobody over-reports progress** | PASS | 🔴 **CR-DC-052 is not unblocked when this merges** — only when this merges *and* DC's pin bump merges. Stated in `implementation-summary.md` §5, `qa-report.md` §5, `developer-handover.md` §1, `user-verification-steps.md` and `known-issues.md` D-1 |

## 2. Cross-system seams

### S-1 — this package writes the control; four apps read it, each on its own clock

**Writer:** this change. **Readers:** DC, CRM, org-admin, RMS — **only after each bumps its own pin,
in its own change.** No paged list is declared anywhere and no app file is edited. Nothing renders
differently in any app on the day this merges.

⚠ **A placement obligation rides along.** The owner's layout is two bars, and the package cannot make
a consumer render both — rendering only the top bar is valid code. "Top bar above the table, bottom
bar below it" is therefore a **consumer instruction**, carried in the component's fenced comment and
repeated in `developer-handover.md` §2. `placement` defaults to `"top"` so the lazy call still gets
the complete bar rather than orphan arrows.

### S-2 — 🔴 shipping is two steps, not one

Consumers pin an **exact commit** (DC currently `365be65`). Landing the control does **nothing** for
DC until DC bumps its pin, against the **merged sha on `main`**. Two changes, in that order, in two
different lanes. Nobody may report CR-DC-052 as ready on the strength of this change alone.

### S-3 — 🔴 the client-side-narrowing seam (the trap), as a handoff

**Writer of the contract:** this package. **Owner of obeying it:** every consumer that pages on the
server — CR-DC-052 first. **What this change does not do:** enforce it. Under option (a) the package
cannot detect that a consumer has combined server paging with `useTableControls`; the contract is
prose plus a fenced comment. That is the trade the owner approved, and it is stated in those terms
rather than softened. Option (b) — a controlled/server mode on the toolbar — remains available later
and is **itself additive**, so nothing is foreclosed.

### S-4 — org-admin drives the controls engine from its own UI

Four org-admin screens use `useTableControls` and render their own controls, never
`DataTableToolbar` (CR-003 §1.2). They are unaffected — they import nothing this change adds. They
are named because they are the reason option (b) would be bigger than it looks: a controlled mode on
the **hook** would reach them, not just the toolbar. Named, not solved.

### S-5 — no database seam anywhere

No store, no query, no migration, no column. `totalCount` and `page` are inputs. The nearest thing to
persistence is the consumer obligation that a total must carry the same scope filter as its page
query — which lives entirely in the consumer, and is stated so CR-DC-052 meets it on purpose rather
than by luck.

## 3. Register

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **does not exist in this repo and there is no
`governance/` directory** — the same finding CR-001 recorded as D-12, CR-002 as D-10 and CR-003 as
§7. **Fourth change running to raise it.** Creating one is a governance decision for the owner, not
part of this change; the five seams above are the record in the meantime. `known-issues.md` C-3.
