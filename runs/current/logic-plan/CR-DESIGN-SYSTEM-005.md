# CR-DESIGN-SYSTEM-005 — the depot slot's label is chosen by the app wearing the header

> Logic plan. Written 2026-08-20 against `main` @ `0633476` (CR-DESIGN-SYSTEM-004 merged, PR #14).
> **Nothing has been built. No source file has been edited. No test has been run.**

<!-- OWNER-BRIEF-START -->

## What this gets you

Every form in the depot system carries the same strip of four boxes across the top. The second box has
the word **"DC"** printed over it, and that word is fixed in the shared kit. That is why the customer
system's change has been stuck since 18 August: it has no depots, so the word is wrong for it.

After this, **each app prints its own word over that box** — just as each form already chooses whether
the first box says "Date" or "Order date". The depot system prints "DC" exactly as today; not one of
its forms moves or reads differently.

## What I need you to confirm

**When an app has nothing at all to put in that box, what should it show?** Three pictures are attached.

- **A — my recommendation.** The box stays, showing the faint dash it already uses for anything not
  filled in.
- **B.** An app may drop the box. I advise against it: with three boxes the document number slides out
  of the top-right corner, which was your ruling of 8 August.
- **C.** The box stays and the app may add a short line under it, such as "Not applicable".

## Not included

The customer system's own work — it moves to this version in its own change, when it chooses. No other
box changes, none moves, none is added, nothing is restyled.

## Risk

A safety check inside the depot system reads the exact wording of this file. Nothing breaks today, but
one line of that check needs updating when the depot system next moves across. Written down now so it
is not a surprise later.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 1. What is true today — verified this session, not re-derived

Every fact below was read from the worktree at `0633476` during this planning session.

| # | Fact | Location |
|---|---|---|
| F-1 | `export const DOCUMENT_HEADER_SLOTS = ["Date", "DC", "Raised by", "Document no."] as const;` | `src/components/DocumentHeader.tsx:74` |
| F-2 | `const slots = DOCUMENT_HEADER_SLOTS;` and the render is `slots.map((slot) => …)` | `DocumentHeader.tsx:259`, `:263` |
| F-3 | The depot slot renders on ONE line: `if (slot === "DC") return <HeaderSlot key={slot} label="DC" value={props.origin.dcName} />;` | `DocumentHeader.tsx:291` |
| F-4 | `dateLabel?: string` — the precedent. Defaulted at the point of use: `label={props.dateLabel ?? "Date"}` (twice, lines 272 and 281) | `DocumentHeader.tsx:186`, `:272`, `:281` |
| F-5 | `DocumentOrigin` carries `dcName: string \| null` on both arms; the file states the value is already app-neutral | `DocumentHeader.tsx:162–182` |
| F-6 | `HeaderSlot` renders a `null` value as `—` with `border-dashed border-border bg-surface-muted text-fg-subtle` — the empty state already exists | `DocumentHeader.tsx:344–353` |
| F-7 | The grid is `grid-cols-1 … sm:grid-cols-2 lg:grid-cols-4` — sized for exactly four children | `DocumentHeader.tsx:262` |
| F-8 | The barrel exports `DocumentHeaderProps` as a type. A new optional field on it needs **no barrel edit** | `src/components/index.ts:157–166` |
| F-9 | 🔴 **This repo's own spec scans the source for `'label="DC" value={props.origin.dcName}'`** | `tests/components/DocumentHeader.test.tsx:465` |
| F-10 | This repo already pins the byte-exact declaration of `DOCUMENT_HEADER_SLOTS` and `const slots = DOCUMENT_HEADER_SLOTS;` in a source scan | `tests/components/DocumentHeader.test.tsx:469–481` |
| F-11 | `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist**, and there is no `governance/` directory | verified by search |

**F-9 is the one thing the change request did not know about, and it changes the shape of the work.**
See §5.

## 2. The design — one optional prop, defaulted at the point of use

Follow the `dateLabel` precedent exactly, as instructed. Nothing else.

### 2.1 One new field on `DocumentHeaderProps`

Added immediately **above** `origin`, because `origin.dcName` is the value it labels — the same
grouping the date props already use.

```ts
  /**
   * Defaults to "DC". The word printed over the SECOND slot, and nothing more.
   *
   * 🔴 IT NAMES THE SLOT; IT DOES NOT MOVE IT, AND IT IS NOT AN IDENTITY.
   *    `DOCUMENT_HEADER_SLOTS` remains the ONE expression of which slots exist and in what order —
   *    "DC" is this slot's canonical NAME there and stays exactly as it reads. This prop is
   *    presentation sitting beside it: the array says WHICH slot, this says what THIS APP calls it.
   *
   * ⚠ SAME SHAPE AS `dateLabel`, DELIBERATELY. Bananaworld-DC passes nothing and gets "DC", so every
   *   one of its thirteen live render sites is byte-identical. An app whose equivalent concept is not
   *   a depot at all passes its own word — which is what `DocumentOrigin`'s "the component is never
   *   told what the depot IS, only what it is CALLED" already made possible for the VALUE.
   */
  readonly dcLabel?: string;
```

### 2.2 One changed render line

```tsx
        if (slot === "DC") {
          return <HeaderSlot key={slot} label={props.dcLabel ?? "DC"} value={props.origin.dcName} />;
        }
```

`??`, not `||` — identical to `dateLabel`. A caller passing `""` gets an empty label under both
props; the two must not drift apart, and a special case on one of them would be a divergence from the
precedent this change was told to follow. Pinned by a spec (§7, T-9).

### 2.3 What is NOT touched, and is checkable

- `DOCUMENT_HEADER_SLOTS` — **not one character**. Still four entries, still `"DC"` second.
- `const slots = DOCUMENT_HEADER_SLOTS;` and `slots.map(` — unchanged.
- `DocumentOrigin`, its `new`/`existing` discriminant, `dcName`, `raisedBy` — untouched (CR-DC-039).
- The Document no. slot's states, the Date slot's states, `dateLabel`, `dateHint`, `HeaderSlot`,
  every class name and every string — untouched.
- **All three barrels** (`src/index.ts`, `src/components/index.ts`, `src/lib/index.ts`) — untouched.
  No new export, no new type, no moved symbol. The export surface is **byte-identical**.
- No new dependency. No token. No Radix control added or replaced — this change adds no interactive
  element at all, so the Radix rule has nothing to bite on here.

## 3. The omission decision — stated, not left for the CRM to discover

**The question:** what does an app do when it has nothing for that slot at all?

**The answer this plan builds: A — the slot is always present. Omission is NOT offered.**

The header renders four slots, always, in the canonical order. An app with nothing for the depot slot
passes `dcName: null` and gets the empty state the slot already has: an em dash in a dashed, dimmed
box that reads as "not filled in". That behaviour exists today (F-6), is already spec'd, and needs no
new prop.

### 3.1 Why omission is not offered

Three reasons, in order of weight.

1. 🔴 **It moves the document number out of its corner.** The grid is `lg:grid-cols-4` (F-7). Three
   children put Document no. in column 3 of 4 on a wide screen, and — because `sm:grid-cols-2` wraps
   — bottom-**left** on a narrow one. "The document number top right" is the owner instruction of
   2026-08-08, anchored at the top of the file. Making omission honest therefore means changing the
   header's own layout classes, which this change is explicitly forbidden from doing ("do not restyle
   the header"). That is not a detail to work around; it is the request's own fence.
2. **Four slots in this order is what "homogeneous" means.** The file states it: *"'Homogeneous' means
   these four slots, in this order, on every desk form"* (epic brief §5). A per-app slot count makes
   the standard a suggestion.
3. **No caller has asked.** CR-CRM-015 needs a word, not a hole. Building the hole now is exactly the
   "configurability added in anticipation" that D-3 and D-13 already refused in this component.

### 3.2 What omission would cost if the owner picks B anyway

It is buildable and it would stay additive, and the order rule can be honoured — the skip lives
*inside* the existing `slots.map`, returning `null` for the depot slot, so `DOCUMENT_HEADER_SLOTS`
remains the single expression of order and no second list appears. But it needs:

- a discriminated `dcLabel?: string | null` (`null` = omit) or a second prop `omitDcSlot?: boolean`;
- a computed grid class (`lg:grid-cols-3` when a slot is dropped), i.e. the restyle above;
- an answer for the narrow breakpoint, where three items in two columns leave Document no. bottom-left
  whatever the wide-screen class says.

I do not recommend it, and I would want the layout question answered before building it.

### 3.3 Option C, if the owner wants the blank box explained

`dcHint?: string`, mirroring the existing `dateHint?: string`, rendered through `HeaderSlot`'s
existing `hint` prop. One more optional field, one more render argument, no layout change, fully
additive. It lets an app write "Not applicable" under a dash instead of shipping a mystery.

**Not recommended, on one ground only:** no caller has asked for it. If the owner knows CR-CRM-015
wants it, it is cheap and I would build it with A.

## 4. Cross-app intersection map — who writes, who reads

**Seams are real here. This is a package four apps pin by git sha.**

| # | Seam | Who WRITES | Who READS | Decision |
|---|---|---|---|---|
| S-1 | The depot slot's printed word | **This package** writes the default `"DC"` and the mechanism | DC, CRM, RMS, org-admin — **each only after it bumps its own pin** | The package owns the default; the wearing app owns the word. No consumer pin is bumped here. |
| S-2 | CR-CRM-015's unblock | This package (this change) **and** the CRM (its own pin bump + adoption) | — | **Two changes, two lanes, in that order.** This change alone does not unblock CR-CRM-015; the CRM moves against the **merged** `main` sha, never this branch's sha (KI-M001E19-002). |
| S-3 | DC's `tests/contract/transaction-form-standard.test.ts` — a source-text contract on **this file** | This package writes the source | **DC reads it as text** once DC adopts | Held by keeping the declaration byte-identical. §5. |
| S-4 | DC's thirteen live render sites (twelve forms) | DC | This package's default | Unaffected — they pass no `dcLabel`, get `"DC"`, render byte-identically. Proof plan in §8. |
| S-5 | The export surface (three barrels) | This package | All four consumers, at bump time | **No seam movement at all** — zero barrel edits, zero new exports. A consumer on an older pin that upgrades sees only a widened optional prop. |
| S-6 | Database / migration | — | — | **None.** This package has no database by construction, and the slot's value is a plain `string \| null` name — no `warehouse_id`, no tenancy identifier (F-5). |

**Cross-system register:** `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and there is no
`governance/` directory (F-11). Creating one is a governance decision, not something a change may
invent — this is now the **fifth consecutive change** to raise it (CR-001 D-12, CR-002 D-10,
CR-003, CR-004). The seams above are recorded here, in the estimate, and will go into the change's
own evidence pack instead. Carried as open question OQ-3.

## 5. 🔴 The cross-repo trap, and the part of it the request did not know about

### 5.1 The two strings the request named — both survive untouched

DC's contract test asserts the byte-exact declaration and the render expression. **Neither changes.**
The array keeps `"DC"` as its second entry; `const slots = DOCUMENT_HEADER_SLOTS;` is not replaced.
The override sits beside the array as presentation, exactly as instructed. **No DC assertion on those
two strings can go red because of this change**, whenever DC bumps.

DC's `slotLabels()).toEqual([...DOCUMENT_HEADER_SLOTS])` also survives: DC passes no `dcLabel`, so the
rendered labels are still `["Date", "DC", "Raised by", "Document no."]`. And no fifth slot is added,
so `SalesOrderForm`'s "fenced at exactly four" comment stays true.

### 5.2 🔴 The third string — a NEW finding, declared rather than discovered

**This repo's own spec at `tests/components/DocumentHeader.test.tsx:465` scans for:**

```js
expect(code).toContain('label="DC" value={props.origin.dcName}');
```

and its comment says it *"mirrors DC's `transaction-form-standard.test.ts:883`, which asserted exactly
this before the move."* The change request did not name this one.

**The render line in §2.2 breaks that exact substring.** So:

- **In this repo** the assertion is narrowed to the half it is actually about — the spec's title is
  *"reads NO session — the middle two slots come from the origin prop"*, and the value half is what
  carries that meaning:
  ```js
  expect(code).toContain("value={props.origin.dcName}");        // the spec's actual subject, kept
  expect(code).toContain('label={props.dcLabel ?? "DC"}');      // and the default, now pinned
  ```
  **This is the ONE existing assertion this change edits.** It is narrowed, never relaxed: the
  session-guard property it exists to prove is strictly better covered afterwards, because the default
  is pinned too. Declared here so it is a decision at the gate and not a diff nobody read.

- **In Bananaworld-DC** I **cannot verify** whether the mirror scans the full concatenated substring or
  only the value half. Consumer repos are not readable from a build worktree (SESSION_HANDOVER note 8)
  and I did not read one. **Nothing here claims DC was checked.** If DC's mirror does pin the full
  string, DC's adoption change narrows it identically — one line, in DC's lane. That assertion is
  already inside the set that `runs/change-02/evidence/developer-handover.md` §3 says **goes red by
  design at DC's adoption and must be inverted, never relaxed**, so it is a line DC already has to
  visit. It is added to the developer handover and to `SESSION_HANDOVER.md` at close.

**This does not turn DC red today.** DC pins `365be65`; nothing here reaches it until DC bumps.

### 5.3 The new guard this change owes in return

Per the request, the cross-repo negative is pinned **in this repo** so a future change here cannot
break DC silently. The existing scan (F-10) already does the character-for-character check; this change
re-fences it with a comment naming DC's contract test as the reason, and adds the assertions in §7
(T-10, T-11) so that "the label became overridable" can never quietly become "the array became
editable".

## 6. Files expected to touch

| File | Change | Rough size |
|---|---|---|
| `src/components/DocumentHeader.tsx` | `+1` optional prop with its fence comment; `1` render line rewritten (one-line `return` → braced block for line length) | **+15 / −1** |
| `tests/components/DocumentHeader.test.tsx` | ~9 new specs; **1 existing assertion narrowed** (§5.2) | **+95 / −1** |

**Two files. No barrel, no config, no `package.json`, no `pnpm-lock.yaml`, no new file.**

Explicitly NOT touched: any file under `src/` other than `DocumentHeader.tsx`; any consumer repo; any
`runs/epic-*/` or `milestone-NN/` path; `runs/current/epic-plan/`. This change lands in
`runs/change-05/` and creates no epic or milestone folder.

## 7. Testing plan

Run `pnpm test` **before any edit** to record the baseline (expected: 235 passed / 13 files, per
CR-004's close), then after. Existing specs must pass unedited apart from the single narrowed
assertion in §5.2, which is itemised in `changed-files.md`.

| # | Spec | What it holds |
|---|---|---|
| T-1 | No `dcLabel` → `slotLabels()` equals `[...DOCUMENT_HEADER_SLOTS]` | **Every existing caller is byte-identical.** The four labels, in order, unchanged. |
| T-2 | `dcLabel="Branch"` → `["Date", "Branch", "Raised by", "Document no."]` | The word lands in the right slot and the other three are untouched. |
| T-3 | `dcLabel="Branch"` → the slot is still **second**; Date is first, Document no. fourth | Naming a slot must not move it — the same property `dateLabel` already has a spec for. |
| T-4 | `dcName: null`, no `dcLabel` → `"—"` and `border-dashed` | The empty state is unchanged under the default label. |
| T-5 | `dcName: null`, `dcLabel="Branch"` → `"—"` and `border-dashed`, under the word "Branch" | The empty state is unchanged under an overridden label. **This is the omission answer, asserted.** |
| T-6 | 🔴 **Four slots always** — with and without `dcLabel`, with `dcName` null and non-null, the header renders exactly 4 `dt`/`label` elements | **The omission decision, pinned.** It would fail the day somebody adds a hole. |
| T-7 | `dcLabel` and `dateLabel` together → both independent, order intact | The two label props do not interact. |
| T-8 | `dcLabel="Date"` → the depot slot is still second and the Date slot is still first | A label cannot impersonate a slot identity. |
| T-9 | `dcLabel=""` behaves exactly as `dateLabel=""` does | `??` semantics pinned so the two props cannot drift. |
| T-10 | 🔴 **Cross-repo negative.** Source contains, character for character, `export const DOCUMENT_HEADER_SLOTS = ["Date", "DC", "Raised by", "Document no."] as const;` **and** `const slots = DOCUMENT_HEADER_SLOTS;` **and** `slots.map(` | **DC's contract test, mirrored here.** Extends F-10 with a comment naming DC as the reason. |
| T-11 | Source contains no second array literal of slot names, and `DOCUMENT_HEADER_SLOTS` has exactly 4 entries with `"DC"` second | Order and identity stay in one place; `dcLabel` never becomes a second slot list. |
| T-12 | The package root barrel still exports the same eight symbols, and `[...pkg.DOCUMENT_HEADER_SLOTS]` still equals the four strings | The export surface did not move (extends the existing barrel spec). |

## 8. Additive proof — what will actually be shown at the gate

Assertion, not vibes. At close, the evidence pack will carry:

1. `git diff --numstat -- src/` — expected **+15 / −1**, with the single deleted line itemised (the
   one-line depot-slot `return` replaced by its braced form).
2. `git diff -- src/components/index.ts src/index.ts src/lib/index.ts` — expected **empty**.
3. `pnpm typecheck` clean; `pnpm test` green, with the before/after spec counts and the **one** edited
   assertion named.
4. **Which existing callers were checked and why they are unaffected**, stated plainly:
   - **Bananaworld-DC** — thirteen render sites across twelve forms (`SalesOrderForm`, the delivery
     run, `AdjustmentSheet`, and the rest). None passes `dcLabel`; `props.dcLabel` is `undefined`;
     `?? "DC"` yields the identical string; `HeaderSlot` receives the identical props. Unaffected.
     🔴 **DC's own suites were NOT run and nothing will claim they were** — consumer repos are not
     readable from this worktree (SESSION_HANDOVER note 8). The argument above is a code argument.
   - **Bananaworld-CRM, RMS, org-admin** — none imports `DocumentHeader` today (the CRM's adoption is
     CR-CRM-015, still in its own lane). Nothing to be affected.
   - **This package's own 235 specs** — 12 of them render `DocumentHeader`; all pass unedited except
     the narrowed source scan.
5. A dependency audit reproduced in Node (`pnpm audit` is permission-blocked in build sessions), read
   rather than trusted — CR-004's own probe mis-parsed pnpm's peer-suffixed store dirs and reported
   three false blocking advisories (`runs/change-04/output/defect-log.md` DEF-2). No dependency
   changes here, and 🔴 an unchanged tree is **not** evidence of audit health (CR-002 learned that).
6. **No migration** — this package has no database. **No consumer pin bumped.**

## 9. Open questions

| # | Question | Blocking? | Default if unanswered |
|---|---|---|---|
| OQ-1 | **The omission decision — A, B or C** (§3). Three rendered options. | **Decide-point at the gate.** | **A** — the slot is always present; the existing empty state is the answer. This plan is written to do A. |
| OQ-2 | Does DC's `transaction-form-standard.test.ts` pin the full `label="DC" value={props.origin.dcName}` substring, or only the value half? **Not answerable from here** (§5.2). | No — cannot turn DC red today. | Assume the worst: record it as a one-line narrowing DC must make at adoption, in the developer handover and in `SESSION_HANDOVER.md`. |
| OQ-3 | Should this repo have `governance/CROSS_SYSTEM_CHANGE_REGISTER.md`? **Fifth consecutive change to ask.** | No. | Not created — a governance decision, not a change's to invent. Seams recorded in §4 and in the evidence pack. |
| OQ-4 | Does the same argument apply to the "Raised by" slot's label? | No — **explicitly out of scope.** | Not built. The request names the depot slot only, and no caller has asked. Noted in `technical-debt.md` as a one-prop follow-up if a second app ever needs it. |

## 10. Scope fences carried from the request

- **No change to Bananaworld-DC and no change to Bananaworld-CRM.** Package only.
- **No consumer pin bumped**, and never against a branch sha (KI-M001E19-002).
- `DocumentOrigin`, its discriminant and the reason it exists (CR-DC-039) — untouched.
- The Document no. slot's five states and the Date slot's states — untouched; both are contract.
- **No fifth slot. No reorder. No restyle. `dateLabel` neither removed nor folded into a shape with
  `dcLabel`** — two independent optional props, exactly as `dateLabel` stands today.
- If the build finds the change cannot be made additively, it **stops and says so at the gate**. On
  the evidence in §1–§8 it can: one optional prop, one defaulted expression, zero barrel movement.
