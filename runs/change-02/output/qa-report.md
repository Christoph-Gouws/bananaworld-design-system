# QA report — CR-DESIGN-SYSTEM-002

**Verdict: PASS.** 14 acceptance criteria, 14 traced to a verdict. 0 open defects.

## 1. Acceptance criteria → verdict

Criteria are taken from the change request's own clauses and the approved plan's §9.

| # | Criterion (source) | How verified | Verdict |
|---|---|---|---|
| AC-1 | **CR-DC-039 has landed — the component reads no session.** "START BY VERIFYING IT ACTUALLY DID; if `useAuth` is still in there, STOP" | Read DC's `src/components/ui/DocumentHeader.tsx` at `main`. No import, no call — the only three occurrences are comments recording its removal. DC's own guard at `transaction-form-standard.test.ts:885` asserts the same | **PASS — gate open** |
| AC-2 | `DocumentHeader.tsx` lands beside Sheet, SlideOver and Modal in `src/components/` | `src/components/DocumentHeader.tsx`, exported the same way as every other primitive | **PASS** |
| AC-3 | Its slot types come with it — the number slot's five states, the date slot's states | `DocumentNumberSlotState` (3 arms / 5 visible states), `DocumentDateSlotState` (2 arms), `DocumentOrigin`, `DocumentHeaderSlot`, `DocumentHeaderProps` — all exported | **PASS** |
| AC-4 | Its slot-order constants come with it | `DOCUMENT_HEADER_SLOTS` and `DOCUMENT_NUMBER_WHERE_TO_SET` exported; test 25 pins the constant verbatim **and** that the render maps it | **PASS** |
| AC-5 | **Byte-identical in what a user sees:** same slots, same order, same five number states, same date behaviour, same empty state | Mechanical: comments stripped, 282 code lines vs 282, **2 differing lines, both import specifiers**. Plus 22 DOM specs covering order, all five number states, all four date moods and the empty state | **PASS — measured, not asserted** |
| AC-6 | The barrel re-exports it, so not one DC import line changes | `src/components/index.ts` + `src/index.ts`. Test 26 imports from the **package root** and renders it — deliberately not from the component file | **PASS** |
| AC-7 | The package builds standalone; no app import reachable from it | `pnpm typecheck` clean with no `@/` alias configured (such an import could not resolve); test 23 scans comment-stripped source for `@/`, `bananaworld-dc` and `./index` | **PASS** |
| AC-8 | The flag coupling is decided and stated, not smuggled | **D-3: no flag prop.** There is no flag left to answer — CR-DC-046 removed `useDocumentNumbering` on 2026-08-12 (DECISION-358). Reasoning stated in the component's own doc comment, in `implementation-summary.md` §4 and in the decision log | **PASS** |
| AC-9 | The CRM does not adopt here; no new slot, no CRM variant, no anticipatory configurability | Nothing in this change reads, writes or names the CRM beyond recording the seam. No prop added beyond what DC shipped. The 60-day threshold is deliberately **not** overridable (D-5) | **PASS** |
| AC-10 | **Additive-only:** no field removed, no default changed, no export surface altered | `git diff --numstat -- src/` → **34 insertions, 0 deletions**. Two new files; three barrels appended to. No existing export renamed, moved or removed | **PASS** |
| AC-11 | No consumer pin bumped | No consumer file touched. `package.json` and `pnpm-lock.yaml` untouched (verified by `git status`) | **PASS** |
| AC-12 | Radix is not hand-rolled away | **N/A with cause, recorded.** This component uses no Radix control — it is a `<dl>` of slots plus the package's own `Input`, which is itself not Radix. Nothing was replaced; `Input` is imported, not re-implemented (§4 below) | **PASS (N/A, recorded)** |
| AC-13 | The eight transitional pieces come across | **Cannot be satisfied as written, and the plan gate approved the alternative.** They were deleted by the owner's own DECISION-358 on 2026-08-12, before this session. `renderedBeforeThisEpic` has zero occurrences in DC's `src/`. Surfaced in the plan's owner brief as a confirm point; plan APPROVED | **PASS (superseded, recorded)** |
| AC-14 | DC's fourteen forms render as before, flag ON and flag OFF, proved rather than asserted | **Partially provable here, and the limit is stated rather than papered over.** Provable: byte-identity of the source (AC-5) and the mirrored DOM suite. Not provable here: DC's own suites (§3). **Flag-OFF is not testable by anyone — there is no flag** | **PASS with a stated limit** |

## 2. The additive claim — the lane's core requirement

Five repos pin this package by git sha and each bumps when it chooses, so "additive" is a hard rule.
Proved four ways:

1. **0 deletions.** `git diff --numstat -- src/` reports `17/0`, `7/0`, `10/0` — insertions only,
   across all of `src/`.
2. **Nothing existing was touched.** The two source files are new. The three barrel edits **append**;
   no existing export line was renamed, reordered or removed.
3. **No default changed.** This change introduces no default into any existing component. The one
   default inside the new component (`dateLabel ?? "Date"`) arrived with it from DC, unchanged.
4. **The existing suite is untouched and still green** — 79/7 before, the same 79 inside 115/9 after.
   Not one existing spec was edited.

## 3. Which existing callers were checked, and why they are unaffected

| Consumer | Pinned at (per SESSION_HANDOVER §1) | Effect of this change | Basis |
|---|---|---|---|
| **Bananaworld-DC** | `b1373c78` | **None until DC bumps its own pin.** DC still renders its own local `src/components/ui/DocumentHeader.tsx`; this change did not touch, delete or re-point it. Thirteen render sites across twelve files are unchanged | DC source read at `main`; no DC file in this diff |
| **Bananaworld-CRM** | `4bc1f220` | **None.** Gains an export it does not import | Additive-only; no removal, no default change |
| **RMS** | `ecba2218` | **None.** Same | Same |
| **org-admin** | `ecba2218` | **None.** Same | Same |
| **Mangaverde** | `e3a88e35` | **None.** Same — a fifth consumer the change request did not name | Same |

**The general argument, and it is the strong one:** every consumer pins a *sha*. A consumer on an
older sha cannot see this change at all. A consumer that bumps to the merged sha sees **34 added
lines and zero removed lines**, none of which alters an existing export, an existing default or an
existing component's render path. There is no code path by which an existing caller's output can
differ.

**Its limit, stated:** this session is sandboxed to its own worktree and cannot check out the four
non-DC consumer repos, so those four rows rest on the additive proof rather than on a re-read of
their source. DC's row is stronger — its actual source was read. Residual risk **LOW**, discharged
at each consumer's own pin bump.

⚠ **One forward requirement for the CRM only, carried not solved:** the header uses `text-2xs`, the
`warning-*` / `info-*` / `danger-*` token families and `bg-surface-muted`. All exist in this
package's `tokens.css` (verified: lines 30, 39–40, 53–63) and in DC's Tailwind theme. **The CRM's
Tailwind theme must define the same scale before it renders the header** — the package's standing
consumer requirement, checked in the CRM's adoption change, not here.

## 4. Standards held

| Standard | Held? |
|---|---|
| **Pure presentation only** (TECH-CON-004 / TECH-COMP-003) | ✅ No session read, no network, no permission logic, no `warehouse_id`/`legal_entity`, no business rule. `DocumentOrigin` carries plain `string \| null` **names** — the component is never told what the depot *is*, only what it is *called*, which is what makes it wearable by an app whose equivalent concept is not a depot |
| **Radix underpins the interactive primitives; no hand-rolled replacement** | ✅ Nothing was hand-rolled. The component contains no Radix control to preserve — it renders a `<dl>` and delegates its two inputs to the package's own `Input`, imported unmodified. The two `<button>`s (Undo) are native buttons and arrived that way from DC |
| **Accessibility carried, not re-derived** | ✅ `<dl>`/`<dt>`/`<dd>` for read-only slots (nothing there is an input, and a `<label>` with no control is a lie to a screen reader); a real `<label htmlFor>` on the two slots that ARE controls; `role="alert"` + `aria-invalid` on both refusal paths. Tests 14, 21 and 22 pin these |
| **No database, no migrations, no app screens** | ✅ None added; the package has none by construction |
| **No new dependency** | ✅ `package.json` and `pnpm-lock.yaml` untouched. `useId` is React; every Tailwind token used already exists in `tokens.css` and is already used by shipped primitives |
| **Comments are load-bearing and travel** | ✅ Every 🔴/⚠ fence crossed with its DC anchor intact (D-6). The four adapted comments are listed in `changed-files.md` §3 |

## 5. Defects

4 found and closed during the build; **0 open.** See `defect-log.md`.
