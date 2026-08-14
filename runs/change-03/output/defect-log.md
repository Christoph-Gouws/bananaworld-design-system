# Defect log — CR-DESIGN-SYSTEM-003

| Found | Closed | Open |
|---|---|---|
| **4** | **4** | **0** |

Everything found during the build is here, including the ones a session is tempted to fix silently.

## D-1 · MEDIUM · The union widening broke two writes that TypeScript caught — closed

**Found by** `pnpm typecheck` immediately after the union gained its third member.
**Symptom** `TS2322` in two places where a `string | undefined` from an indexed read was assigned to a
`string`: `multiSelectTriggerLabel`'s fallback name and `storedFromFilterValue`'s single-value return.
**Cause** This repo compiles with `noUncheckedIndexedAccess`, so `values[0]` is `string | undefined`
even inside a `length === 1` branch.
**Fix** Explicit fallbacks (`?? ""`, `?? null`) rather than a non-null assertion — an assertion would
have silenced the compiler at the exact point where an empty list is the interesting case.
**Verified** `pnpm typecheck` clean.

## D-2 · LOW · The first characterisation spec asserted the wrong thing — closed

**Found by** the spec failing on its first run, against **unmodified** source.
**Symptom** "no element has an empty-valued attribute" failed: today's toolbar legitimately renders
`value=""` on the search input and both date inputs.
**Cause** The CR-DESIGN-SYSTEM-001 rule is *assert the new attributes are absent, not empty* — the
spec had over-generalised it into "no empty attribute anywhere".
**Fix** Narrowed to the markers the new control actually introduces: `aria-haspopup`,
`menuitemcheckbox`, `data-multi-select`, the strings `multiSelect` and `chosen`.
**Why it is logged rather than quietly corrected** It failed against untouched source, which is
exactly what a characterisation spec is for: it caught a wrong assertion instead of a wrong product.

## D-3 · LOW · `import.meta.url` is not a file URL under the happy-dom transform — closed

**Found by** the no-app-import scan spec failing with `ENOENT … /tests/components/undefined`.
**Cause** Under the `components` vitest project, `import.meta.url` is not a `file:` URL — the same
wart CR-DESIGN-SYSTEM-002 recorded in `DocumentHeader.test.tsx`.
**Fix** Resolve from the vitest root (`resolve(process.cwd(), path)`), matching the idiom already in
this repo rather than inventing a second one. Comment left in place so the next session does not
rediscover it.

## D-4 · HIGH (prevented, not shipped) · The menu would have closed after every tick — closed

**Found by** deliberate mutation, not by luck. The plan named `onSelect` preventDefault as *the one
Radix gotcha* (D-5), so instead of trusting the line, it was replaced with a no-op and the suite re-run:

```
× 🔴 ticks with Space and THE MENU STAYS OPEN across several toggles
  Unable to find role="menuitemcheckbox"
```

**Why it is HIGH** A rep picking three depots would have re-opened the menu three times — the change
would have shipped looking correct and failing at the thing it exists to do.
**Closed** The line is present and the guard spec fails without it, so it cannot be removed silently
by a future refactor.

## Checked and NOT a defect — recorded so the check is not repeated

| Check | Finding |
|---|---|
| Does "Clear" light up on a screen that adopts a multi-select with nothing chosen? | **No.** The plan's `hasActiveControls` trap (`:88`) was handled; pinned by an engine spec **and** a UI spec |
| Does an all-chosen multi-select show the same rows as none-chosen? | **No, and correctly so.** Rows whose accessor is `null`/`""` drop out the moment anything is chosen — exactly as a single-select drops them. Asserted explicitly so the difference is intentional, not incidental |
| Does the trigger shuffle when the rep ticks in a different order? | **No.** "First" is first in **displayed option order**; the stored list is normalised to that order on every toggle. Asserted by ticking Durban *then* Cape Town and expecting `Cape Town+1` |
| Does a stale chosen value (an option the data no longer offers) linger? | **No.** The same normalisation pass drops values that are not in the current options — the rep sees the menu, not a hidden filter |
| Does the new control leak into a screen that declares nothing? | **No.** Snapshot hash unchanged across the seven screens, plus three explicit absence assertions |
| Is a Radix Checkbox nested inside the menu item? | **No** — the tick is `DropdownMenu.ItemIndicator`. Nesting two interactive roles was the trap the plan warned about (§6.2) |
| Does anything reach for an app path? | **No** — `tsc --noEmit` with no alias, plus a source scan for `@/` and `bananaworld-` |
| Did a new dependency creep in? | **No** — `package.json` and `pnpm-lock.yaml` are untouched; the tree is identical to `9aa20f7` |

## Deferred to their owners — not defects of this change

| Item | Owner | Where recorded |
|---|---|---|
| CRM's saved-view reconciler must learn both stored shapes before it adopts | CRM lane | `developer-handover.md` §3 (seven points) |
| DC keeps a stale private copy of `table-controls.ts` that nothing imports and that will drift further | DC lane | `known-issues.md` D-1 (seam S-4) |
| `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist in this repo — third change to raise it | Owner / governance | `known-issues.md` C-3 |
