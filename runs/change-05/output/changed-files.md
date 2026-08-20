# Changed files — CR-DESIGN-SYSTEM-005

> 🔴 **Stage 05 reviews ONLY the files listed here**, so this list is complete rather than
> representative. Every path below was produced by `git status` / `git diff --numstat`, not from memory.

## 1. Source — one file

| File | Change | `--numstat` |
|---|---|---|
| `src/components/DocumentHeader.tsx` | `+1` optional prop (`dcLabel?: string`) with its fence comment; **1** render line rewritten from a one-line `return` to its braced form | **+30 / −1** |

**The single deleted line, itemised** — this is the whole of the `−1`:

```tsx
-        if (slot === "DC") return <HeaderSlot key={slot} label="DC" value={props.origin.dcName} />;
```

replaced by:

```tsx
+        // ⚠ AND THE WORD OVER IT IS THE WEARING APP'S (CR-DESIGN-SYSTEM-005). `??`, not `||` —
+        //   identical to `dateLabel` above, so a caller passing "" gets the same thing from both props
+        //   and the two cannot drift. The slot itself is not optional: see `dcLabel`.
+        if (slot === "DC") {
+          return <HeaderSlot key={slot} label={props.dcLabel ?? "DC"} value={props.origin.dcName} />;
+        }
```

The braced form is required only because the defaulted expression pushes the one-liner past the line
width the rest of the file keeps. **No behaviour rides on it.** The plan estimated `+15 / −1`; the
actual `+30 / −1` is entirely the two fence comments (the `dcLabel` doc block and the three-line render
comment) being written out in full rather than abbreviated. Recorded, not hidden: see
`revision-review.md` DEV-1.

## 2. Tests — one file

| File | Change | `--numstat` |
|---|---|---|
| `tests/components/DocumentHeader.test.tsx` | **11 new specs**; **1 existing assertion narrowed**; 1 existing spec given a comment (no assertion changed) | **+256 / −1** |

### 2.1 🔴 The ONE existing assertion this change edited — declared, not buried

Spec: **"reads NO session — the middle two slots come from the origin prop"** (was line 465).

```js
-    expect(code).toContain('label="DC" value={props.origin.dcName}');
+    expect(code).toContain("value={props.origin.dcName}");
+    expect(code).toContain('label={props.dcLabel ?? "DC"}');
```

**Narrowed, never relaxed.** The spec's subject is the session guard — that the slot's CONTENT comes
from `origin` and not from a `useAuth()` — and the value half carries that meaning entirely. The label
half necessarily moved when the label became overridable. The new default is then pinned separately,
so the file asserts strictly more after this change than before. The `−1` above is this line.
Reasoning in full: `known-issues.md` A-1 · `defect-log.md` NAD-1 · `implementation-summary.md` §3.

### 2.2 The existing spec that gained a comment and nothing else

**"declares the canonical order ONCE and RENDERS BY MAPPING IT"** — the byte-exact source scan (T-10).
Its three assertions are **unchanged**. It gained a fence naming Bananaworld-DC's
`tests/contract/transaction-form-standard.test.ts` as the reason it exists, so a future session cannot
edit it without reading who it is for.

### 2.3 The 11 new specs

| # | Spec | Holds |
|---|---|---|
| T-1 | prints "DC" when no label is given | **the additive claim itself** |
| T-2 | prints the app's word, other three untouched | the word lands in the right slot |
| T-3 | keeps the slot SECOND when named | naming must not move |
| T-4 | empty state unchanged under the default label | `dcName: null` behaviour held |
| T-5 | empty state unchanged under an overridden label | **the omission answer, asserted** |
| T-6 | renders FOUR slots always (4 cases) | **the omission decision, pinned** |
| T-7 | independent of `dateLabel` | the two props do not interact |
| T-8 | `dcLabel="Date"` cannot impersonate the date slot | a label is not an identity |
| T-9 | `dcLabel=""` behaves as `dateLabel=""` | `??` not `||`; no drift |
| T-11 | ORDER stays in exactly one place | `dcLabel` never becomes a second slot list |
| T-12 | the barrel re-exports the same eight header symbols | the export surface did not move |

## 3. Files NOT touched, and why — checked, not assumed

| File | Why it is untouched |
|---|---|
| `src/index.ts` · `src/components/index.ts` · `src/lib/index.ts` | **All three barrels: `git diff` is empty.** A new optional field on an already-exported interface needs no export change (F-8). Verified as a command, not asserted |
| `package.json` · `pnpm-lock.yaml` | No new dependency. Not opened for edit |
| `src/components/Input.tsx` and every other `src/components/*` | Nothing else imports or re-declares the depot slot |
| `src/lib/document-date.ts` | The date slot is untouched; `describeDocumentDate` is not reached by this change |
| `tests/components/__snapshots__/` | No snapshot covers `DocumentHeader`; none regenerated, none deleted |
| `.github/workflows/ci.yml` | Baseline CI jobs may be added to, never weakened. Nothing needed adding |
| Any consumer repo (DC, CRM, RMS, org-admin) | **Out of lane, and unreadable from here.** No consumer pin bumped |
| `runs/current/logic-plan/CR-DESIGN-SYSTEM-005.md` | The approved contract. Read, never edited |

## 4. Files created

| Path | Note |
|---|---|
| `runs/change-05/output/*.md` (12) · `runs/change-05/evidence/*.md` (4) · `runs/change-05/technical-debt.md` | This change's paper trail |
| `runs/current/decisions-pending/` | **not created for this change** — no decision gate was hit |

**No `runs/epic-NN/` folder, no `milestone-NN/` folder, and nothing under `runs/current/epic-plan/`.**

## 5. Throwaway files created and deleted

| Path | Purpose | State |
|---|---|---|
| `.audit-probe.mjs` | Reproduced CI's `pnpm audit --prod --audit-level=high` in Node, because `pnpm audit` is permission-blocked in build sessions | **Deleted.** Not committed, not staged. Its output is quoted in `test-results.md` §5 |

## 6. Modified files reconciled against `git status`

Tracked files modified: **2** (`src/components/DocumentHeader.tsx`,
`tests/components/DocumentHeader.test.tsx`). Tracked files deleted: **0**. Tracked files renamed: **0**.
Source files added: **0**.

Also updated outside the archive, as the paper trail requires:
`source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` · `runs/current/SESSION_HANDOVER.md` ·
`runs/current/active-milestone.md` · `organization/CONTEXT_USAGE_LOG.md` (estate file, appended by the
kernel script, outside this worktree and outside this branch's diff).
