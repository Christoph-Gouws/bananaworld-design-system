# Defect log — CR-DESIGN-SYSTEM-002

**4 found · 4 closed · 0 open.**

## Closed

### D-1 (HIGH) — the day-line describer was unreachable from the package root

**Found:** while wiring the barrels, by asking "where does DC's follow-up import this from?"

The approved plan §7.1 adds the describer's four exports to `src/lib/index.ts`. But `src/index.ts`
— the package root, and the only thing consumers can import — **enumerates its `./lib` re-exports by
name rather than starring them**. So `describeDocumentDate` and `DOCUMENT_DATE_WARN_DAYS` would have
existed in the package and been unreachable from outside it.

**Why it would have shipped as a real bug:** DC's `use-document-date.ts` and its specs import both
symbols from DC's own `@/lib/document-number/document-date` today. Under decision D-4 that half of
the file moves here, so at adoption DC re-points those imports at the package — and would have found
nothing to point at. The failure would have surfaced in DC's lane, weeks later, as this change's
problem.

**Fix:** four names added to `src/index.ts` (+7 / −0, purely additive).
**Pinned by:** test 27 — `describeDocumentDate` and `DOCUMENT_DATE_WARN_DAYS` imported from
`../../src` (the root), not from the lib file.
**Recorded as a plan-list extension** in `implementation-summary.md` §1 and `known-issues.md` A-1.

### D-2 (MEDIUM) — four ported comments would have been false statements in their new home

**Found:** during the port, reading each comment against the file's new location.

DC's file carries comments whose subject is *where the file lives*:

- `"Input COMES FROM THE PACKAGE, NOT FROM ./index"` — in the package, "from the package" is
  meaningless.
- `"THE PURE LEAF, never the document-number barrel"` with DC's app path.
- `"THAT MOVE IS ITS OWN CHANGE IN THE DESIGN-SYSTEM LANE. Do not do it here."` — kept verbatim, this
  would have sat in the very file where the move *was* done, instructing a reader not to do it.
- The `DocumentDateSlotState` / `DocumentOrigin` field docs saying "the DC's calendar day".

**Why it matters rather than being cosmetic:** decision D-6 keeps these fences precisely because they
are the record of *why* the code looks as it does. A fence that states something false is worse than
no fence — it teaches the next reader something untrue and gets ignored thereafter.

**Fix:** four comments adapted, each keeping its DC anchor and its reasoning and correcting only the
statement about location. Every one is listed individually in `changed-files.md` §3. **All other
🔴/⚠ fences crossed verbatim** — 282 of 282 code lines identical.

### D-3 (LOW) — a spec asserted the wrong thing about the date-control precedence

**Found:** the spec failed on first run.

`expect(getByLabelText("Order date").getAttribute("value")).toBe(null)` — happy-dom reflects
`defaultValue` into the `value` attribute, so the assertion was simply wrong about the DOM. Worse, it
was testing the wrong property: the claim is *which control rendered*, not what it holds.

**Fix:** rewritten to assert exactly one input exists, that it is the caller's bare `<input>` (empty
`className` — the package's `Input` would carry its styling), and that the shared slot's day line is
absent. A stronger claim than the original and it now tests the actual precedence rule.

### D-4 (LOW) — the source-scan specs could not resolve the component file

**Found:** the whole suite failed to load on first run.

`fileURLToPath(new URL(..., import.meta.url))` throws `TypeError: The URL must be of scheme file`
under the `components` project's happy-dom transform — `import.meta.url` is not a `file:` URL there.

**Fix:** resolved from the vitest root via `resolve(process.cwd(), ...)` instead, with the reason in
a comment so nobody reintroduces the idiom.

## Checked and found NOT to be defects

| Check | Finding |
|---|---|
| **Is the purity scan vacuous?** A `not.toContain("@/")` over comment-stripped source passes trivially if the stripper eats everything | **Not vacuous.** The same stripped string is asserted to *contain* `label="DC" value={props.origin.dcName}` and `slots.map(` in tests 24 and 25. The stripper demonstrably preserves real code, so the negative assertions have something to bite on |
| Does the ported `@/` reference inside an adapted comment trip its own guard? | **No** — the scan strips comments first, deliberately. The comment names the old path as a record of what changed, and naming it must not fail the check |
| Does importing `Input` from `./Input` create a cycle? | **No.** `./Input` imports only `../lib`; `src/lib/*` imports nothing from `src/components`. Importing from `./index` **would** be a cycle (that barrel re-exports this file), which is why test 23 also asserts `from "./index"` is absent |
| Does adding `document-date` to `src/lib/index.ts` collide with `formatters.ts`? | **No.** No name overlaps. `formatDateZA` is a different function for a different job; deliberately not merged — merging would change what an existing caller renders |
| Does the new `aria-invalid` path survive `Input`'s own `invalid` variant? | **Yes.** `Input` renders `aria-invalid={invalid \|\| undefined}` and then spreads `...props`, so the explicitly passed value wins. Tests 14 and 21 assert `"true"`; test 11 asserts the attribute is absent when calm |
| Did the three barrel edits introduce the prettier failure? | **No.** All three **already failed at `HEAD`** — verified by stashing the working tree and re-running prettier on the untouched files. Pre-existing repo-wide drift (`known-issues.md` C-1) |
| Did any existing test change behaviour? | **No.** 79/7 before, and the identical 79 inside 115/9 after. Zero existing specs edited or deleted |

## Deferred — out of this lane, recorded not hidden

| Item | Owner |
|---|---|
| Five assertions in DC's `transaction-form-standard.test.ts` will go red at DC's adoption (lines 671, 692, 699–704, 889, 1515). **This is by design** — line 889 exists to assert the promotion has not happened | Bananaworld-DC's adoption change. Detailed in `evidence/developer-handover.md` §3 |
| DC still holds its own copy of the component until it bumps its pin | Bananaworld-DC. Not drift — it is how a sha-pinned estate moves, and it ends when DC's half lands |
| `pnpm format:check` fails repo-wide on pre-existing drift | Nobody yet; out of lane. CI does not gate on it (`ci.yml` has no format job) |
