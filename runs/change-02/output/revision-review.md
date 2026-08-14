# Revision review (Stage 05) — CR-DESIGN-SYSTEM-002

**Verdict: PASS.** Reviewed exactly the 7 files in `changed-files.md`.

## 1. Built to the approved plan? — clause by clause

| # | Plan clause | Built? |
|---|---|---|
| 1 | §1 — verify CR-DC-039 landed before doing anything | ✅ verified against DC's `main` first; 4 independent checks, all pass |
| 2 | §3 — `DocumentHeader.tsx` lands as `src/components/DocumentHeader.tsx` beside Sheet/SlideOver/Modal | ✅ |
| 3 | §3 — the listed exports and privates cross with it | ✅ all 8 exports; `HeaderSlot`, `DocumentDateSlot`, `DocumentNumberSlot`, `UndoDate`, `slotMood`, `moodBorder`, `dateBorder`, `DocumentNumberMood` stay private, as today |
| 4 | §3.1 — "five states is three kinds", carried as-is, not "fixed" | ✅ carried, **and fenced** so the next reader does not reconcile it. All five asserted separately |
| 5 | §3.2 — every comment travels with its DC anchors | ✅ with four stated exceptions (`changed-files.md` §3), each of which would otherwise be a false statement |
| 6 | §4 — option A: the pure describer moves to `src/lib/document-date.ts`; SQL/column/validation stay in DC | ✅ 54 code lines crossed, all verbatim; nothing else |
| 7 | §5 — no data model, no migration | ✅ `migrationExpected: false` held |
| 8 | §6 — no permission logic | ✅ none present, none added |
| 9 | §7.1 — the exact export additions | ✅ both blocks as written, **plus `src/index.ts`** (defect D-1) |
| 10 | §7.2 — only the two import lines change | ✅ **measured: 282/282 code lines, 2 differing, both imports** |
| 11 | §7.3 — the listed files stay untouched | ✅ all of them; verified by `git status` |
| 12 | §9.1 — the mirrored suite, the standalone-build proof, the barrel proof, the additive proof | ✅ 36 specs; all four proofs present |
| 13 | §10 D-1…D-10 — the ten decisions | ✅ all held. D-10 (do not invent the cross-system register) held: nothing created |

**One deliberate extension, not a deviation:** `src/index.ts` (defect D-1). The plan's §7.1 intent —
that consumers can reach the describer — required it; the plan's §7 file table was one file short of
its own §7.1. Additive, and it is what makes DC's follow-up compile.

## 2. Six review dimensions

### 2.1 Correctness

The strongest available check was run and it is mechanical, not a reading: comments stripped, code
lines compared position by position against DC's `main`. **282 vs 282, two differences, both the
predicted import specifiers.** The describer's 54 code lines all appear verbatim in DC's file. There
is no room for a subtle behavioural change to hide.

### 2.2 Does it hold the lane rule?

`git diff --numstat -- src/` → **34 insertions, 0 deletions**. No export renamed, moved or removed;
no default changed; no existing component's render path touched. The pre-existing 79 tests pass
unchanged.

### 2.3 Is the package still pure?

Yes, and it is now guarded twice rather than argued once: `tsc --noEmit` cannot resolve an `@/…`
import (no alias configured), and test 23 scans the comment-stripped source for `@/`,
`bananaworld-dc` and `./index`. The scan is checked for vacuity — the same stripped string must also
*contain* two real code fragments (tests 24, 25), so it cannot pass by eating the file.

### 2.4 Naming and shape

Names crossed unchanged from DC, which is correct here for a stronger reason than consistency: DC's
follow-up compiles against them. `DOCUMENT_HEADER_SLOTS`, `DOCUMENT_NUMBER_WHERE_TO_SET`,
`DocumentNumberSlotState`, `DocumentDateSlotState`, `DocumentOrigin`, `DocumentHeaderProps` are all
spelled exactly as DC spells them today. **Renaming anything here would be a second migration for
DC to absorb, invisibly.**

### 2.5 Tests

36 new specs. The three the change request specifically demanded — standalone build, barrel
re-export, and the slot-order/number-state contract — are each present and each pinned to something
that can actually fail. The barrel spec imports from `../../src`, **not** from the component file;
that distinction is the whole point and is called out in the spec's own comment.

### 2.6 The honest gap

DC's suites cannot run here and nothing in this pack claims they did. This is stated in
`test-results.md` §4, `qa-report.md` AC-14, `deployed-verification.md` and the developer handover —
four places, because an unstated limit reads as a pass.

## 3. Anything that should NOT have been built?

**No over-build found.** Three specific temptations were declined:

| Tempting | Declined because |
|---|---|
| A `warnDays` prop to make the 60-day threshold configurable | "No configurability added in anticipation" (the request). Uniformity is the point; an override is an additive prop later, if ever needed (D-5) |
| A `numberingEnabled` flag prop, as the request expected | There is no flag left to answer (D-3). A prop for a closed question is dead weight that every future caller must read past |
| Collapsing the two date-slot arms, or splitting the number slot's mood into five type arms | Either changes what a user sees (plan §3.1). Fenced in the source instead |
