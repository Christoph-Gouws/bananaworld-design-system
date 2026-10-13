# CR-DESIGN-SYSTEM-019 — a busy button can still be tapped, so a second tap double-submits — Logic Plan

> Raised by the owner's ruling of 2026-10-13 after a live double purchase at Manga Verde (Macia buying station,
> 14:15:23 and 14:15:24 Maputo). **This was a planning session only. No feature code was written.** `bananaworld-dc` was only read
> (reads and greps). Base: `main` @ `f508f99` (CR-DESIGN-SYSTEM-018, PR #35, kit 0.3.0). DC's pin, from its own
> `package.json:57`: `cde6f4e`.

<!-- OWNER-BRIEF-START -->

**What you'll have.** Once a button has been pressed and is waiting for an answer, it can't be pressed again. A second tap does nothing, so the same purchase, save or send can't go through twice. Today the button only looks busy. It still takes a second tap, which is how Liliana's purchase was recorded twice.

**Please confirm.**
1. While it waits, the button greys out, just like the busy buttons on other screens already do. I recommend A in the pictures. B and C change how every busy button looks in every app.
2. I checked every busy button in the warehouse app. None of them is meant to stay tappable while busy. I can't see inside the other apps. Each one checks its own screens when it takes the update.

**Not included.** The separate fix to the Manga Verde purchase screen. Switching each app over. Every app takes the fix in its own small step: Manga Verde, the warehouse app, the sales app, Org Admin, the store app and the packhouse.

**Risks.** Twelve warehouse buttons will now grey their button while saving. That is the intended look. Nothing changes in any app until it takes the update.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **No `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md` exists in this worktree** (recorded since
  CR-013). The standing rules come from the conductor's project rules, the estate `CLAUDE.md` and
  `runs/current/SESSION_HANDOVER.md`.
- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md:1`: next estate session due **2027-01-10**. Not overdue.
- **No existing plan for this CR**, so this is a fresh plan, not a revision. No owner responses are recorded. I used no
  clarify round: the owner already ruled on the fix itself, and the one judgement left (how a busy button looks) is
  a mockup pick, not a question.
- **Read in this repo:** `src/components/Button.tsx` (whole), `package.json`, `README.md` headings + `### Changelog`,
  kit-internal `<Button` callers (`DateRangeChrome.tsx:186`, `ChangeTable.tsx:144`, `ExportButton.tsx:41`,
  `PrintPreview.tsx:212,219`, `TablePagination.tsx:94,103`, `Select.tsx:70`), `tokens.css` colour tokens, the CR-018
  plan (format precedent).
- **Read in DC (read only):** `package.json:57` (pin `cde6f4e`), `src/components/ui/index.ts:18-19` (DC re-exports the
  kit `Button`, it has no private copy), `tests/unit/components/Button.test.tsx` (whole), every `inflight=` site under
  `src/` and `app/` (grep, 63 hits / 33 files), with context read at `DeliveryRunBoard.tsx:1103-1116`,
  `SyncStatusDetail.tsx:397-413`, `UnfinishedTray.tsx:385-416`, `DocumentActions.tsx:120-167`.
- **CRM, RMS, Org Admin, Manga Verde, Packhouse: not readable from here.** No claim is made about their code. The
  request's figures ("~10 `disabled + inflight` sites, `inflight=` in ~85 files across DC, CRM and Manga Verde") are
  the owner's. DC's share is measured in §3.

## 1. The defect, exactly

`src/components/Button.tsx:100` is `disabled={disabled ?? inflight}`. `??` only falls through on `null`/`undefined`.
A caller writing `disabled={!formValid}` passes **`false`** once the form is valid, and `false ?? true` is `false`.
So `inflight` never disables the button. Only `aria-busy="true"`, `data-inflight` and `cursor-progress` are applied,
and the button still takes clicks. The prop's own contract (`Button.tsx:74`: "UX-DS-021 — disable + show progress
feedback"), DC's README (`src/components/ui/README.md:51`: "`inflight` (disables + sets `aria-busy`…)") and DC's
test title (`tests/unit/components/Button.test.tsx:32`: "renders as inflight (disabled + aria-busy)") all say a busy
button is disabled. The implementation only honours that when the caller passes no `disabled` at all.

## 2. The fix

```tsx
disabled={Boolean(disabled) || inflight}
```

One expression in one file, plus the `:74` comment made explicit ("an in-flight button is never clickable, whatever
`disabled` says"). No new prop, no new export, no default changed (`inflight = false` stays). No change to classes,
`data-inflight` or `aria-busy`.

**The truth table: the only cell that changes is the bug.**

| `disabled` | `inflight` | today `disabled ?? inflight` | after `Boolean(disabled) \|\| inflight` | Changed? |
|---|---|---|---|---|
| undefined | false (default) | false | false | no |
| undefined | true | true | true | no |
| true | false | true | true | no |
| true | true | true | true | no |
| false | false | false | false | no |
| **false** | **true** | **false** ← the defect | **true** | **yes, the fix** |
| null (untyped JS) | any | = inflight | = inflight | no |

`false` and `undefined` both render no `disabled` attribute in React 19, so the unchanged cells produce identical
DOM, not just equivalent DOM.

**What the operator sees in the changed cell.** The base classes already carry `disabled:cursor-not-allowed
disabled:opacity-50` (`Button.tsx:27`). A button in that cell now **greys to 50%** while in flight, exactly as every
`inflight`-only button already does today (e.g. DC `SyncStatusDetail.tsx:400-413`, `UserFormPanel.tsx:484`). That
is why this change is UI-bearing, and it is mockup option **A**. Options B and C are in §8 with their costs. Both
would change the look of *every* busy button in every app, including the ~50 DC sites that are correct today, so I
do not recommend either.

### 2.1 The lane rule, stated plainly

The lane rule says every existing caller must render byte-identically. **This change deliberately does not do that
for exactly one caller state:** `disabled={false}` together with `inflight={true}`. That state is the defect the owner
ruled must be fixed. Every other state is byte-identical (§4, proof 1). This is not an API change. The prop, its
type, its default and the export surface are untouched, and the documented contract is restored, not altered. A
consumer that wanted "looks busy but still clickable" would be relying on a behaviour the prop's own doc comment
denies. §3 looks for such a consumer in DC and finds none. It is still a behaviour change at each consumer's next pin
bump, so §7 tells every consumer, and the README changelog names it as a **behaviour fix** rather than "additive".

## 3. Does any consumer rely on a busy button staying clickable? (requested check)

**DC: no.** Method: grep `inflight` across `src/` + `app/`, then a multiline grep for a `disabled=` within the same
JSX element as `inflight=` (search terms in §Rule sites). Every site was then read in context.

**A. DC sites whose behaviour CHANGES at DC's next pin bump.** `disabled` can be `false` while `inflight` is `true`,
so today a second tap goes through:

| # | Site | `disabled=` | What a second tap does today |
|---|---|---|---|
| 1 | `src/components/ui/DocumentActions.tsx:159-160` (Save draft) | `props.disabled === true` | saves the draft twice |
| 2 | `src/components/transfer/MoveSheet.tsx:751-752` | `tally.canPost === false` | posts the move twice |
| 3 | `src/components/transfer/MovePalletForm.tsx:497-498` | `canSubmit === false` | posts the pallet move twice |
| 4 | `src/components/cycle-count/FoundBatchSheet.tsx:225-226` | `!ready` | records the found batch twice |
| 5 | `src/components/cycle-count/BatchStackEntry.tsx:85-86` | `!valid` | submits the stack twice |
| 6 | `src/components/stations-admin/StationFormPanel.tsx:452-454` (Pair) | `isInactive` | pairs twice |
| 7 | `src/components/stations-admin/StationFormPanel.tsx:549` (Save) | `isInactive` | saves twice |
| 8 | `src/components/adjustment/BucketWasteCard.tsx:249-250` | `issue !== null` | posts the waste twice |
| 9 | `src/components/adjustment/BucketCorrectionCard.tsx:205-206` | `issue !== null` | posts the correction twice |
| 10 | `src/components/adjustment/AdjustmentSheet.tsx:545-546` | `tally.canPost === false` | posts the adjustment twice |
| 11 | `src/components/adjustment/AdjustmentForm.tsx:155-156` | `wp.canSubmit === false` | submits twice |
| 12 | `src/components/adjustment/AdjustmentForm.tsx:165-166` | `cp.canSubmit === false` | submits twice |

None of these twelve is a "cancel" or any other action meant to stay pressable while busy. Each is the submitting
action itself, and a second press repeats the write. Whether each server write is idempotent is DC's question, not
this change's. The kit fix closes the second tap regardless. The build re-greps and records the final count.

**B. DC sites that ALREADY work around the defect (unchanged, because `disabled` already includes the busy flag):**
`cycle-count/NewCountForm.tsx:201-202` (`disabled={busy}`) and `:233-236` (the comment at `:234` reads "🔴 A CREATED
COUNT CANNOT BE CREATED AGAIN — without this, a second press would schedule a second count", which is this defect,
patched locally), `cycle-count/CycleCountDetailPanel.tsx:584-585` (`cancelling || …`), `po/PurchaseOrderEditor.tsx:559-560`
and `:610-611` (`busy !== null`). These render byte-identically after the fix. The redundancy is DC's to simplify,
in its own lane, if it wants to.

**C. DC sites with `inflight` and no `disabled` (unchanged, already disabled today):** the remaining ~50 hits, e.g.
`UserFormPanel.tsx:434,471,484`, `SyncStatusDetail.tsx:404,510,783,787`, `StorageFullBanner.tsx:91`,
`DisconnectPhoneDialog.tsx:45`, `SchedulesTab.tsx:267,279,452`, `CycleCountDetailPanel.tsx:528,662,671`,
`MasterFormPanel.tsx:491,541,674`, `CustomFieldDefinitionPanel.tsx:500,533`, `UnfinishedTray.tsx:317,395`,
`DraftListPanel.tsx:148,280`, `TrackerPhonePanel.tsx:178,189`, `PurchaseOrdersGridView.tsx:310`, `adjustment-shared.tsx:131,140`,
`CycleCountBatchRows.tsx:89,98`, `BatchPicker.tsx:129`, `MovedInCallout.tsx:88`, `CycleCountsView.tsx:507`,
`CycleCountFlow.tsx:372`, `BatchStackEntry.tsx:238`, `StationFormPanel.tsx:463,489,516`, `GallerySections.tsx:180`.
The closest thing to a "stay pressable" intent is `delivery-run/DeliveryRunBoard.tsx:1106-1112` ("NEVER DISABLED
BEFORE IT IS PRESSED"). It passes no `disabled`, so it is already disabled while `inflight` today, and its comment
explicitly wants that ("a press WHILE THE LIST IS STILL COMING is acknowledged"). Unchanged.
`SyncStatusDetail.tsx:397-399` documents relying on `inflight` to disable. Unchanged.

**D. `asChild` + `inflight` in DC: 0 hits.** (See residual R1: `disabled` cannot stop a link.)

**Kit-internal callers:** no kit component passes `inflight` (`grep inflight src/` → only `Button.tsx`). All eight
internal `<Button` sites are unaffected.

**Other apps:** not readable. Each app's pin-bump change must run the same two greps (§Rule sites) on its own tree.
For each site in class A it must confirm the action is not meant to stay pressable, and it must say so in its own
plan. If any app finds a genuine "busy but pressable" control, that control should pass `inflight={false}` and show
its own busy text. That is the app's change, not this one.

## 4. The proof (to be done at build, NOT claimed now)

1. **Byte-identity harness** (`runs/change-NN/output/byte-identity-019.harness.test.tsx`, the CR-013 pattern): a
   frozen copy of `Button.tsx` from `f508f99` rendered side by side with the new one over the matrix `disabled ∈
   {omitted, undefined, true, false}` × `inflight ∈ {omitted, false, true}` × `variant` (4) × `size` (3) × `block`
   (2) × `asChild ∈ {false, true with <a>}` × `className`/`type`/`aria-label` present or not. Assert identical
   `outerHTML` for **every shape except `disabled=false, inflight=true`**. For those shapes, assert the only
   difference is the added `disabled=""` attribute. On `asChild` the `<a>` receives `disabled=""` too, which has no
   browser effect (R1).
2. **New unit test** `tests/components/Button.test.tsx` (the kit has no Button test today), happy-dom +
   `@testing-library/user-event`:
   - `disabled={false} inflight` → `button.disabled === true`, `aria-busy="true"`, `data-inflight` present.
   - `disabled={false} inflight onClick={fn}`: `user.click` → `fn` not called. Also `fireEvent.click`, so the guard is
     the native disabled state, not pointer-events.
   - The in-flight-then-settled sequence: render `inflight`, click (not called), rerender `inflight={false}
     disabled={false}`, click (called once). This is the double-tap scenario from the live repro.
   - Unchanged cells still hold: `inflight` alone → disabled; `disabled` alone → disabled; neither → enabled and
     clickable; `disabled={false} inflight={false}` → enabled.
   - `type="submit"` inside a `<form onSubmit={fn}>` with `disabled={false} inflight` → pressing the button submits
     nothing (the Manga Verde shape: a submit button with a validity `disabled`).
3. **Export inventory** (`tests/components/DragBoard.additive.test.tsx`): unchanged. No name is added or removed,
   and it must stay green as is.
4. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`, "ANCHOR NOT FOUND" exits non-zero): revert to
   `disabled ?? inflight`; `Boolean(disabled) && inflight`; `Boolean(disabled)` alone; `inflight` alone. Every
   mutant must turn a test red.
5. Re-measure the baseline first (handover: 517 tests / 25 files at CR-018), then `pnpm test`, `pnpm typecheck`,
   `pnpm audit --prod --audit-level=high`, `quality-sensors.mjs` (LF-normalised), `prettier --check --print-width
   100` on touched files.
6. **Real-browser check** (the committed Edge driver, `runs/change-10/evidence/browser-proof/proof.mjs` pattern), on a
   scratch fixture page outside the estate tree. Use a submit button with `disabled={false}` and `inflight` set from a
   2.5 s simulated server answer, the owner's repro. Double-click and fast double-tap (touch emulation at 820×1180,
   `data-surface="tablet"`) → **exactly one** submit recorded; frames of ready / busy (greyed) / settled to
   `runs/change-NN/evidence/frames/`. This is the owner's live repro, inverted.

## 5. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/Button.tsx` | `:100` the expression; `:74` the comment made explicit | 3 |
| `package.json` | `version` 0.3.0 → **0.3.1** (patch: a behaviour fix, no new surface). No dependency, export-map or peer change; lockfile untouched (`pnpm install --frozen-lockfile`) | 1 |
| `README.md` | `### Changelog` **0.3.1** entry, worded as a *behaviour fix*: "a button with `inflight` is now always disabled, even when `disabled={false}` is passed; callers that passed both will see the button grey while in flight, like every other busy button" | 4 |

Paper trail (not in the estimate): `tests/components/Button.test.tsx` (new), the byte-identity harness, the mutation
battery, the browser-proof frames, the decision-log entry `CR-DESIGN-SYSTEM-019`, the handover / active-milestone
refresh, and `known-issues.md` carrying R1–R3 and the §7 owed bumps. The archive goes in the slot the conductor names
(never overwrite; handover item 13). No migration (no database). No `runs/epic-NN/`, `milestone-NN/` or
`runs/current/epic-plan/` is created or written. **No consumer pin is bumped by this change.**

## 6. Release

Merge to `main` on green. The **merged** `main` sha is the version every consumer pins (never the branch sha,
KI-M001E19-002). `package.json` says `0.3.1`. The handover records the merged sha once the conductor has merged.

## 7. Cross-app intersection map, and the consumer pin bumps owed

No shared data record is touched. This is the behaviour of one control inside one browser tab. The seams are the
package hand-off to each consumer. **The kit writes the behaviour. Each app reads it only when it moves its own pin.**

| # | Seam | Who WRITES | Who READS | This change | Pin bump owed (each app's own change, to the MERGED sha) |
|---|---|---|---|---|---|
| **S1** | Kit `Button` → **Manga Verde** | Kit | Manga Verde | Fix ships in 0.3.1 | **Owed, priority.** Bundle it into Manga Verde's purchase-screen change raised alongside this one (owner's instruction). Its purchase submit is the live double-post. Run the §3 greps on its tree |
| **S2** | Kit → **DC** (pin `cde6f4e`) | Kit | DC | 12 DC sites change behaviour (§3 A). All are submit actions, now single-tap | **Owed.** DC's change bumps `package.json:57` to the merged sha, re-runs the §3 greps, and keeps `tests/unit/components/Button.test.tsx` green (it already asserts the right behaviour). Note DC is 4 kit versions behind (`cde6f4e` → 0.1.x). Its bump also takes CR-015/018's opt-in additions, which stay off by construction |
| **S3** | Kit → **CRM** | Kit | CRM | Unknown here | **Owed.** Grep + bump in a CRM change |
| **S4** | Kit → **Org Admin** | Kit | Org Admin | Unknown here | **Owed.** Can share its CR-ORGADMIN-015 follow-up bump (CR-018) if that has not merged yet |
| **S5** | Kit → **RMS** | Kit | RMS | Unknown here | **Owed.** Grep + bump |
| **S6** | Kit → **Packhouse** (`bananaworld-ph`) | Kit | Packhouse | Unknown here | **Owed**, if its `package.json` depends on the kit (the CR-015 theme suggests it does). Pre-live, so low urgency |

Other apps: `bananaworld-sw-hub` is in Planning. If it ever depends on the kit, it should start at ≥0.3.1. No other
registry engagement is known to depend on the package (`organization/REGISTRY.md`; I could not read every app's
`package.json` from here, so each app confirms its own dependency).

The `seams` estimate field carries the short form. `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not
exist** in this repo. This is the thirteenth change to raise it, and the decision is the owner's. S1–S6 go to
`known-issues.md` at build.

## Rule sites

**The rule.** *Today:* "a button that is busy cannot be pressed again" holds **only when the screen passes no
'ready' check of its own". When it does, the busy button still takes a press. *After:* **a busy button can never be
pressed, whatever else the screen says.**

**Sites, found by searching:**

| Site | Change / leave | Reason |
|---|---|---|
| `src/components/Button.tsx:100` `disabled={disabled ?? inflight}` | **change** | The rule itself |
| `src/components/Button.tsx:74` `inflight?: boolean; // UX-DS-021 — disable + show progress feedback` | **change** (comment only) | Make "whatever `disabled` says" explicit so the next reader does not reintroduce `??` |
| `src/components/Button.tsx:97,101,102` (`cursor-progress`, `data-inflight`, `aria-busy`) | leave | Presentation of the busy state, not the rule. Changing them would alter every busy button (§2) |
| `README.md` (kit) | change (changelog only) | No existing `inflight` text to amend (grep: 0 hits); the 0.3.1 entry states the rule |
| DC `src/components/ui/README.md:51` | leave (read-only repo) | Already states the correct rule ("disables") |
| DC `tests/unit/components/Button.test.tsx:32-37` | leave (read-only repo) | Already pins the correct rule for the no-`disabled` case; stays green after the bump |
| DC `cycle-count/NewCountForm.tsx:202,236`, `CycleCountDetailPanel.tsx:585`, `po/PurchaseOrderEditor.tsx:560,611`, `document-draft/UnfinishedTray.tsx:412`, `ui/DocumentActions.tsx:149` | leave (read-only repo) | Local re-spellings of the rule inside `disabled`. Correct and harmless after the fix. DC may simplify them in its own lane |
| DC §3 A sites (12) | leave (read-only repo) | They gain the rule automatically at DC's pin bump. No edit is needed in DC |
| Kit-internal `<Button` callers (8, §0) | leave | None passes `inflight` |
| CRM / RMS / Org Admin / Manga Verde / Packhouse | not visible | Each runs the searches below in its own pin-bump change |

**Search terms used** (rerun them as-is): `inflight` (kit `src/`, kit `README.md`, DC `src/` `app/` `tests/`);
`\?\? inflight|disabled \?\?` (kit `src/`; 1 hit, `Button.tsx:100`); multiline
`(disabled=\{[^}]*\}[^<]{0,400}inflight=|inflight=\{[^}]*\}[^<]{0,400}disabled=)` (DC `{src,app}/**/*.tsx`; 18 elements);
`asChild[^>]*inflight|inflight[^>]*asChild` (multiline, DC; 0 hits); `<Button\b` (kit `src/`; 8 sites);
`aria-busy|cursor-progress` (kit; `Button.tsx`, `PrintPreview.tsx:201`, `NavigationBusy.tsx`, which are separate
busy states and left alone).

## 8. Mockup options (`runs/current/mockups/CR-DESIGN-SYSTEM-019/`)

All three block the second tap. They differ only in how the busy button looks.

- **A: greys out while busy (recommended).** This is what the fix produces with no further code. It is how every
  `inflight`-only button already looks in every app, so busy buttons look the same everywhere. 3 lines.
- **B: keeps full colour, shows a "working" pointer.** It needs `data-[inflight]:opacity-100
  data-[inflight]:cursor-progress` on the base class. That **changes the look of every busy button in every app**
  (~50 correct DC sites included) at their next bump. It breaks the lane rule beyond the defect, and a full-colour
  button that ignores taps reads as broken. Not recommended.
- **C: A plus an automatic spinner inside the button.** The kit would add an element to every busy button. That
  changes the DOM for all ~85 files, and it **doubles the spinner** where an app already draws its own (DC
  `SyncStatusDetail.tsx:407-411`). Not recommended. An opt-in spinner prop could be a later additive change if the
  owner wants one.

## 9. Residuals and open questions

- **R1: `asChild` cannot be stopped by `disabled`.** `<Button asChild inflight><a/></Button>` passes `disabled` to the
  link, which browsers ignore. This is true before and after this change, and DC has 0 such sites. Out of scope; recorded
  in `known-issues.md`. A fix would need `aria-disabled` + click suppression, which is new behaviour and would be a
  separate change.
- **R2: `cursor-progress` is dead on a disabled button.** `disabled:cursor-not-allowed` (`:27`, a pseudo-class
  variant) out-specifies `cursor-progress` (`:97`), so a busy button shows "not allowed", not "working". This is
  already true for every `inflight`-only button, and the fixed cell joins them. Left alone: changing it alters every
  busy button (option B's cost). Recorded.
- **R3: a double-tap faster than React's re-render.** `inflight` only bites once the consumer has set its busy state
  and React has committed. Two taps inside the same event-loop turn, before the commit, could both fire. This kit fix
  closes the window the owner reproduced (second tap 1 s later; repro 2.5 s). A synchronous guard belongs in the
  consumer's submit handler and server idempotency (`client_request_id` reuse), which is Manga Verde's own change
  and out of scope here. Stated so nobody assumes the kit alone makes double-posting impossible.
- **Owner confirm 1:** the look (A recommended). **Owner confirm 2:** other apps check their own screens at their
  bump (§3).
- Standing, carried: no cross-system register; no CR-008 decision-log entry; 4 inert `ignoreGhsas`; OQ-8; the
  `.snap` CRLF artefact (do not stage).

## 10. Not an epic

One expression, one version line, one changelog entry. I cannot name five milestones it decomposes into. The six
consumer bumps are each app's own change, not milestones of this one.
