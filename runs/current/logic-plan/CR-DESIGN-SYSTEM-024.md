# CR-DESIGN-SYSTEM-024 — `TablePagination` gets an optional `labels` prop so consumers can translate it — Logic Plan

> Companion of **CR-MANGAVERDE-095** (Manga Verde list paging; its plan §2 item 1 and step 1). CR-MANGAVERDE-095 is
> blocked at build until this change merges and Manga Verde pins the merge sha. **This was a planning session only. No
> feature code was written.** `bananaworld-dc` and the CR-MANGAVERDE-095 worktree were only read. Base: `main` @
> `6a25c8d` (CR-DESIGN-SYSTEM-022, PR #42, kit **0.7.1**).

<!-- OWNER-BRIEF-START -->

**What you'll get.** The page-turning bar on long lists ("Showing 1–25 of 312", "Rows per page", Previous and Next) can speak the app's own language. Manga Verde can show it in Portuguese: "A mostrar 1–25 de 312", "Linhas por página", "Anterior", "Seguinte". The words read aloud to someone using a screen reader change too, so nobody hears English on a Portuguese screen. This is the piece Manga Verde's list change is waiting for.

**Please confirm one look.**
- **A (recommended).** Portuguese looks exactly like English today, with the two numbers slightly darker than the words.
- **B.** The Portuguese sentence in one even shade, numbers the same as the words.

**Not included.** Manga Verde's own screens and its Portuguese wording come in Manga Verde's change, which waits on this one. Nothing else on the bar changes, and no other part of the shared screens changes.

**Risks.** None for live apps. Every other app keeps exactly the English it shows today, and gets nothing new until it chooses to update.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md:1`: the next estate session is due **2027-01-10**. It is
  not overdue.
- **No `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md` exists in this worktree** (searched; the
  same finding has been recorded since CR-013). The standing rules come from the conductor's project rules, the estate
  `CLAUDE.md` and `runs/current/SESSION_HANDOVER.md`.
- **No existing plan for this CR.** This is a fresh plan, not a revision. No owner responses are recorded.
- **No clarify round was used.** The request settles the scope, the label keys, the defaults and every rule to keep.
  The only owner-visible choice left (whether translated numbers keep the emphasis) is a mockup pick, brief (b).
- **Read in this repo:**
  - `src/components/TablePagination.tsx` (whole), `src/lib/table-paging.ts` (whole), `src/index.ts` (whole),
    `src/components/index.ts:55-75`, `src/components/ChangeTable.tsx:30-80` (the `headings` / `DEFAULT_HEADINGS`
    precedent), and the `words?` idiom in `Keypad.tsx:35` and `LinkedRecords.tsx:61-85`.
  - `tests/components/TablePagination.test.tsx` (whole), `Grid.additive.test.tsx:155-180`, and
    `DragBoard.additive.test.tsx:64-116` (the export inventory).
  - `package.json`, `README.md:60-130` (Changelog), the CR-023 plan and estimate (format precedent), the CR-004
    mockup `option-a.html` (the bar's approved look) and `runs/current/SESSION_HANDOVER.md`.
- **Read in the CR-MANGAVERDE-095 worktree (read only):** `runs/current/logic-plan/CR-MANGAVERDE-095.md` §F8, §2,
  the seam row (`:334`) and the build order (`:411`).
- **Read in Manga Verde (read only):** `package.json:35`, which pins the kit at `3953e6d7` (0.5.0).
- **Read in DC (read only):** `package.json:57` (pin `5c14f377`, kit 0.7.0) and
  `src/components/list-paging/ListPagination.tsx` (whole), DC's only adopter of the bar.
- **Snapshots:** the only `.snap` file in the kit is `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap`.
  `TablePagination` has no snapshot today, so "snapshots unchanged" holds trivially and the new byte-identity spec
  (§5.2) is the proof the request asks for.

## 1. What the bar says today, and where (the denylist)

Every English word in `src/components/TablePagination.tsx` at `6a25c8d`, found by reading the whole file and confirmed
with the searches listed under Rule sites:

| Line | Text | Visible / announced | New key |
|---|---|---|---|
| `:101` | `<ChevronLeft …/> Previous` | visible + button name | `previous` |
| `:110` | `Next <ChevronRight …/>` | visible + button name | `next` |
| `:118` | `aria-label="List paging, end of list"` (bottom `nav`) | announced | `listPagingEnd` |
| `:128` | `aria-label="List paging"` (top `nav`) | announced | `listPaging` |
| `:136-139` | `"Showing "` … `" of "` around the two numbers | visible + live region | `range` |
| `:148` | `<span>Rows per page</span>` | visible | `rowsPerPage` |
| `:155` | `SelectTrigger aria-label="Rows per page"` | announced | `rowsPerPage` (same key, so the two can never disagree) |

That is seven sites and six keys. Nothing else in the file is a word: `positionLabel` (`:178-181`) prints digits and an
en dash only, and the page-size options print numbers.

## 2. Decisions taken here (the chassis is mine; each is recorded in the decision log at build)

### D-1 — `range` is a function, not a template

The request allows either. A function wins:
- A template needs the kit to parse `{from}`/`{to}`/`{total}` tokens. That is a small string engine the kit would own.
- next-intl (Manga Verde) would have to read a raw message to stop its own ICU formatter swallowing the braces.
- A function lets the app use `t()` or `t.rich()` directly, and return either plain text or its own markup.

```ts
readonly range: (r: {
  readonly from: number;
  readonly to: number;
  readonly total: number;
  /** The kit's own position text: "1–25", "312–312", or "0" for an empty list (D-8). */
  readonly position: string;
}) => ReactNode;
```

### D-2 — `range` also receives `position`, so a translation keeps D-8 without re-deriving it

The request's signature is `{ from, to, total }`. One field is **added**: `position`, the string `positionLabel(range)`
already produces.
- D-8 says "Showing 312–312 of 312" stays literal and the empty list reads "0", not "0–0".
- A consumer that builds the position from `from` and `to` itself would print "0–0" on an empty list. It could also
  collapse "312–312" to "312", or swap the en dash for a hyphen.
- With `position` handed over, the obvious translation (`"A mostrar {position} de {total}"`) keeps every D-8 behaviour
  for free. `from`, `to` and `total` are still passed, as the request asks, for a language that needs them apart.
- This is a superset of the request's shape. A function that ignores `position` still type-checks.

### D-3 — The defaults are one frozen, exported object; missing keys fall back one by one

```ts
export const DEFAULT_TABLE_PAGINATION_LABELS: TablePaginationLabels = Object.freeze({
  previous: "Previous",
  next: "Next",
  rowsPerPage: "Rows per page",
  listPaging: "List paging",
  listPagingEnd: "List paging, end of list",
  range: ({ position, total }) => (
    <>
      {"Showing "}
      <span className="font-medium text-fg">{position}</span>
      {" of "}
      <span className="font-medium text-fg">{total}</span>
    </>
  ),
});
```

- **The default `range` returns today's four children exactly.** A fragment adds no DOM node, so the `<p role="status">`
  holds the same children in the same order.
- **Fallback per key, with `??`**, never `{ ...DEFAULT, ...labels }`. A spread lets `{ previous: undefined }` (legal in
  a `Partial`) blank the button. With `??`, a missing or `undefined` key gets today's English.
- **`Object.freeze`.** One shared object backs every bar in an app. A consumer that mutated it would silently change
  every list. Frozen, the mutation throws in strict mode instead.
- **An empty string is passed through as given.** `previous: ""` would leave an icon-only button with no name. It is
  the app's word to choose, and the README says not to. The kit does not police content (the `ChangeTable` `headings`
  precedent).

### D-4 — The two arrow labels stay ONE text node each

Today `:101` renders `<ChevronLeft/> Previous`. That is one JSX text, `" Previous"`. The tempting
`<ChevronLeft/> {labels.previous}` renders **two** text nodes (`" "` + `"Previous"`). In the browser, `innerHTML` is the
same. But React's server render (`renderToString`, which Next.js uses) puts a `<!-- -->` marker between adjacent text
nodes, so **the server HTML would change** for every DC list.

So the build writes a single expression:
- `{` ${previous}`}` after the left chevron;
- `{`${next} `}` before the right chevron.

The byte-identity spec compares **server markup as well as client DOM** (§5.2), and mutation M1 (§5.5) proves that
spec catches this exact slip.

### D-5 — `labels` is the same object for both bars, like every other prop

The component header already says to pass one props object to both placements. `labels` follows the same rule.
- The bottom bar reads `previous`, `next` and `listPagingEnd`.
- The top bar reads everything except `listPagingEnd`.
- Neither placement gains anything it does not render today.

### D-6 — Visual option A or B is the owner's pick; the kit code is the same for both

The default (English) keeps the emphasis spans, and that is fixed. For a translation, the kit renders whatever node the
app's `range` returns.
- **A (recommended):** the README's example, and the Portuguese spec, wrap `position` and `total` in the same
  `font-medium text-fg` span. A Portuguese bar is then pixel-for-pixel the English layout.
- **B:** the example returns a plain string, so the sentence is one muted shade.

Either way the `<p role="status">` and its `tabular-nums` class stay the kit's, so "the numbers stay tabular" holds
whatever the app returns. The pick decides what the README recommends, what the Portuguese spec pins, and what
CR-MANGAVERDE-095 is told to pass. It does **not** change a line of `TablePagination.tsx`.

## 3. The component change (`src/components/TablePagination.tsx`)

1. **Header comment.** Every existing paragraph stays verbatim: the layout, the consumer obligation, D-19 (only the top
   bar is `role="status"`) and D-20 (the picker in the top bar only). One paragraph is **appended**:
   > CR-DESIGN-SYSTEM-024 — `labels` translates every word, visible and announced. Absent, the bar renders
   > byte-identically. Translated, the structure does not move: the same live region, the same picker, the same
   > positions. `range` receives the kit's own `position` text so a translation keeps D-8.
2. **Types.** `export interface TablePaginationLabels` (six readonly keys, §2 D-1) and
   `export const DEFAULT_TABLE_PAGINATION_LABELS` (§2 D-3). `import { type ReactElement, type ReactNode } from "react"`.
3. **Prop.** `readonly labels?: Partial<TablePaginationLabels>;` with a JSDoc that cites this CR, "absent ⇒ today's
   English, byte-identical", and "pass the same object to both bars".
4. **Resolve once**, at the top of the function, per key: `const previous = labels?.previous ??
   DEFAULT_TABLE_PAGINATION_LABELS.previous;` and the same for the other five keys.
5. **Substitute at the seven sites in §1.** No class, element, attribute order, role or handler changes:
   - Line 101 becomes `{` ${previous}`}` and line 110 becomes `{`${next} `}` (D-4).
   - `aria-label={listPagingEnd}` and `aria-label={listPaging}`.
   - `<span …>{rowsPerPage}</span>` and the trigger's `aria-label={rowsPerPage}`.
   - The four children of the `<p role="status">` become
     `{range({ from: r.from, to: r.to, total: r.total, position: positionLabel(r) })}`. Here `r` is the existing
     `range` local, renamed `paging` so it does not shadow the label. The rename is internal: no prop, export or
     rendered byte changes.
6. **`positionLabel` stays exactly as it is,** with its D-8 comment. It is now called once, to build `position`.

Nothing changes in `src/lib/table-paging.ts`, `Select.tsx`, `Button.tsx`, `Table`, `DataTableToolbar` or any other
component.

## 4. Barrel, inventory, version, README

- **`src/components/index.ts`.** The existing `./TablePagination` block gains `DEFAULT_TABLE_PAGINATION_LABELS` and
  `type TablePaginationLabels`, and its comment gets one line citing CR-024.
  - `src/index.ts` re-exports `./components` with `export *`. So both names reach the package root with **no edit**
    there, which satisfies request item (4). The test imports them from `../../src`, which proves it.
  - The block's three existing names do not move.
- **`tests/components/DragBoard.additive.test.tsx`.** `ADDED_SINCE_011` gains `"DEFAULT_TABLE_PAGINATION_LABELS"`
  under `// CR-DESIGN-SYSTEM-024`. That is **one runtime name**; the type is erased. `EXPORTS_AT_8387F66B` is not
  edited.
- **`package.json`.** `version` goes **0.7.1 → 0.8.0** (an additive minor, request item 6). The stale description is
  left alone, as at CR-021 and CR-023.
- **`README.md`.**
  - A Changelog entry for **0.8.0**: "`TablePagination` accepts optional `labels` (with
    `DEFAULT_TABLE_PAGINATION_LABELS` and the `TablePaginationLabels` type) to translate every word, including the
    two screen-reader names. Without `labels` it renders byte-identically."
  - A short `## Translating the paging bar` section, about 15 lines:
    - a next-intl example in the shape the owner picks (A: `t.rich` with the emphasis span; B: `t`);
    - "use `position`, not `from`–`to`" (D-8);
    - "pass the same `labels` to both bars";
    - "never an empty string".

## 5. Proof (to be done at build, NOT claimed now)

1. **Re-measure the baseline first** at `6a25c8d` (handover: 682 tests / 35 files at CR-022).
2. **Byte-identity without `labels`** (request item 2). This is new; it lives in
   `tests/components/TablePagination.labels.test.tsx`.
   - The file as it stands at `6a25c8d` is committed as a frozen fixture,
     `tests/fixtures/TablePagination.at-6a25c8d.tsx`, with only its relative imports adjusted (the CR-018 and CR-023
     frozen-copy precedent).
   - A matrix is rendered through both components:
     - placement `top`, `bottom` and omitted;
     - `(page, pageSize, total)` = `(1,25,312)`, `(7,25,312)`, `(13,25,312)`, `(4,25,100)`, `(1,25,0)`,
       `(13,26,313)` (D-8), `(9,25,100)` (the stale page);
     - `pageSizes` default and `[10, 20]`;
     - `className` absent and present;
     - `labels` **omitted**, `undefined`, `{}`, `{ previous: undefined }` and `DEFAULT_TABLE_PAGINATION_LABELS`.
   - For every cell, both of these must be equal:
     - **`renderToString`** output (server markup, including React's `<!-- -->` text markers). This is what catches
       D-4.
     - Client `container.innerHTML` after normalising `useId`-derived `id`/`aria-controls` values.
   - One extra cell **opens the picker** and compares the listbox markup.
   - The existing `TablePagination.test.tsx` and `Grid.additive.test.tsx` run **unedited** and green.
3. **The Portuguese spec** (request item 5), in the same new file. Labels used:
   - `range` gives `A mostrar <position> de <total>`, with emphasis spans if A is picked;
   - `rowsPerPage: "Linhas por página"`, `previous: "Anterior"`, `next: "Seguinte"`;
   - `listPaging: "Paginação da lista"`, `listPagingEnd: "Paginação da lista, fim da lista"`.

   The request typed "Linhas por pagina" without the accent. The spec uses the correct "página", because a translated
   label with non-ASCII text is the realistic case. The status reads `A mostrar 1–25 de 312`, with the kit's en dash,
   because `position` is the kit's.

   Assertions, both bars around one table (the existing `ListHarness` shape):
   - **Words render in both placements:**
     - the top bar has the status text, "Linhas por página" (visible), the combobox named "Linhas por página",
       "Anterior" and "Seguinte";
     - the bottom bar has "Anterior" and "Seguinte";
     - no English word ("Showing", "Rows per page", "Previous", "Next", "List paging") appears in `textContent` or
       in any `aria-label`. This is the denylist, so a missed label fails the test.
   - **Same accessibility tree.** A helper walks both renders in document order, collecting
     `[role, accessible name, disabled]` for every `navigation`, `status`, `combobox` and `button`. The English and
     Portuguese outlines must have **identical role sequences and disabled states**, and every name must map
     one-to-one through the labels.
   - **Structure rules hold:** exactly one `status`, inside the top `navigation` (D-19); `combobox` only in the top
     bar (D-20); the status has no `aria-label` (spec 13); the `tabular-nums` class sits on the status.
   - **The keyboard order is unchanged:** picker, Anterior, Seguinte, the row, Anterior, Seguinte. Paging from the
     bottom bar moves the top status to `A mostrar 26–50 de 312`.
   - **D-8 through a translation:** `(13,26,313)` reads `A mostrar 313–313 de 313`, and `(1,25,0)` reads
     `A mostrar 0 de 0`.
   - **Partial labels:** `{ next: "Seguinte" }` alone translates Next and leaves every other word English.
   - **The default is frozen:** assigning to `DEFAULT_TABLE_PAGINATION_LABELS.next` throws.
   - **axe**, 0 violations, for both bars in Portuguese.
4. **The additive claim:**
   - The export inventory stays green with exactly one declared runtime addition.
   - `git diff 6a25c8d --stat -- src/` must show only `components/TablePagination.tsx` and `components/index.ts`.
   - `pnpm typecheck` is clean. Every existing spec passes unedited, apart from the one inventory line.
5. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`; "ANCHOR NOT FOUND" exits non-zero). Each mutant
   must turn a **named** spec red:
   - M1: `<ChevronLeft/> {previous}`, two text nodes. The `renderToString` byte-identity spec goes red.
   - M2: the labels merge by spread. The `{ previous: undefined }` cell goes red.
   - M3: the trigger's `aria-label` stays hard-coded `"Rows per page"`. The Portuguese denylist and the outline go red.
   - M4: the bottom `nav` uses `listPaging`. The outline goes red (the bars are no longer distinguishable).
   - M5: `range` is passed `from–to` in place of `position`. The `0 de 0` spec goes red.
   - M6: the default `range` drops a `font-medium` span. Byte-identity goes red.
   - M7: `role="status"` is added to the bottom bar. The one-live-region spec goes red.
   - M8: `Object.freeze` is removed. The frozen spec goes red.
6. **Other checks:**
   - `pnpm test`, `pnpm typecheck`, `pnpm audit --prod --audit-level=high`.
   - `quality-sensors.mjs`, LF-normalised.
   - `prettier --check --print-width 100` on the touched files.
7. **Real-browser proof** (the committed Edge driver pattern, `runs/change-10/evidence/browser-proof/proof.mjs`).
   - Setup: DC's `playwright-core` and `tailwindcss`, both read-only, with a scratch fixture outside the estate tree.
   - Pages: the English bar and the Portuguese bar (the picked look), both placements, at 1270 px and 375 px.
   - Assertions:
     - the English page's HTML equals the frozen copy's;
     - the Portuguese bar wraps without sideways scroll at 375 px ("Linhas por página" is longer than "Rows per
       page");
     - axe in the page shows 0 violations.
   - Frames go to `runs/change-NN/evidence/frames/`.

## 6. Existing callers checked (the additive claim)

| Caller | Why unaffected |
|---|---|
| **DC** (pin `5c14f377`, kit 0.7.0). `src/components/list-paging/ListPagination.tsx:67-76` (top) and `:91-97` (bottom) are DC's **only** `TablePagination` render sites. Every DC list view goes through them (`CratesView`, `TransfersView`, `FuelMonthView`, `FarmCrateNotesList`, `RipeningRunsView`, `CycleCountsView`, `ReportTable`, `ReportGrid`, `PostingUnitLine`, found by grep) | Neither site passes `labels`, so both take the default path, which §5.2 proves byte-identical in client DOM and server markup. DC's own English echo (`ListPagination.tsx:83-90`, `:104-107`) is DC code and is not touched. DC gets nothing until it moves its pin |
| DC tests (`tests/**`) | Grep for `TablePagination\|"Rows per page"\|List paging` finds no assertion on the kit's words; the one hit is a path guard (`no-new-list-on-old-path.test.ts`). Nothing reads markup this change could move |
| **Manga Verde** (pin `3953e6d7`, kit 0.5.0) | Uses no paging component today (CR-MANGAVERDE-095 F9). It adopts the bar, with `labels`, in CR-MANGAVERDE-095 |
| **CRM** (`app/`), **Org Admin** (`app/`, `src/`), **RMS** (`src/`, `app/`) | Grep `TablePagination`: **0 hits** in each. They cannot be affected, and gain the new names only when they move their pin |
| Kit tests | `TablePagination.test.tsx` (40 specs), `Grid.additive.test.tsx:165-178` and every other file pass **unedited**, apart from the one inventory line (§4) |

## 7. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/TablePagination.tsx` | The appended header paragraph, `TablePaginationLabels`, `DEFAULT_TABLE_PAGINATION_LABELS`, the `labels` prop, per-key resolution, and seven substitutions (§3) | 50 |
| `src/components/index.ts` | +2 names and +1 comment line in the existing block | 3 |
| `README.md` | Changelog 0.8.0 and "Translating the paging bar" | 22 |
| `package.json` | `version` 0.8.0 | 1 |

Paper trail (not in the estimate):
- Tests: `tests/components/TablePagination.labels.test.tsx`, the frozen fixture and the inventory line.
- The browser proof and its frames, and the mutation battery.
- The decision-log entry `CR-DESIGN-SYSTEM-024` (D-1 to D-6).
- The refreshed handover and active milestone.
- `known-issues.md`: R1–R3, plus what CR-MANGAVERDE-095 owes.

The archive goes in the slot the conductor names (never overwrite; handover item 13). No migration (no database). No new
dependency. **No consumer pin is bumped.** No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` is created
or written.

## 8. Cross-app intersection map

No shared data record is touched. The kit has no database and makes no call. The only seams are the package hand-off
to each consumer, plus one presentation hand-off inside the component. **The kit writes the control. Each app reads it
only when it moves its own pin, to the MERGED sha on `main`, never a branch sha (KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | `TablePagination.labels`, `TablePaginationLabels`, `DEFAULT_TABLE_PAGINATION_LABELS` → **Manga Verde** (pin `3953e6d7`) | Kit | Manga Verde (CR-MANGAVERDE-095's `ListPagingBar`) | Adds what CR-MANGAVERDE-095 §2 item 1 needs | **CR-MANGAVERDE-095's build** pins the merge sha verified on `refs/heads/main`. ⚠ **Key names differ from its plan:** it wrote `showing`/`of`/`navLabel`/`navLabelEnd`. This change ships the owner's CR-024 keys: `range` (one function, not two words, so Portuguese word order is the app's), `listPaging` and `listPagingEnd`. Recorded in `known-issues.md` for that build. Not done here, and that plan is not edited |
| S2 | Same prop → **DC** (pin `5c14f377`), CRM, RMS, Org Admin | Kit | Each app, only if it passes `labels` | Absent ⇒ byte-identical (§5.2). DC's two sites pass nothing; the others render no bar | None |
| S3 | Words: app → kit | **App** owns the translation (Manga Verde: next-intl messages, EN/PT) | Kit places each word at its fixed site | The kit never chooses a language, reads a locale or formats a number by locale. `position` and `total` stay the kit's plain digits unless the app's `range` formats them | None |
| S4 | The D-8 position text: kit → app | **Kit** (`positionLabel`) | App's `range` function | Handed over as `position` (D-2), so a translation does not re-derive it | The README tells apps to use it |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo. This is the seventeenth change to
note it; the decision is the owner's. S1–S4 go to `known-issues.md` at build.

## Rule sites

**No business rule changes.** The bar decides nothing about what may happen to a record. The control's own
presentation rules are **kept, not changed**: D-5 (one callback, a complete pair), D-6 (a size change resets to page 1),
D-7 (clamp for render only), D-8 (the literal position), D-19 (one live region) and D-20 (one picker). This change only
replaces where the words come from.

For transparency, every site that spells one of those words or rules:

| Site | Change / leave | Reason |
|---|---|---|
| `src/components/TablePagination.tsx:101` `Previous` | change | → `previous` (D-4: one text node) |
| `src/components/TablePagination.tsx:110` `Next` | change | → `next` (D-4) |
| `src/components/TablePagination.tsx:118` `"List paging, end of list"` | change | → `listPagingEnd` |
| `src/components/TablePagination.tsx:128` `"List paging"` | change | → `listPaging` |
| `src/components/TablePagination.tsx:136-139` `"Showing "` / `" of "` | change | → `range(…)`; the default reproduces these exact children |
| `src/components/TablePagination.tsx:148` and `:155` `Rows per page` | change | → `rowsPerPage`, one key for both |
| `src/components/TablePagination.tsx:135` `role="status"` (D-19) | leave | Kept on the top bar only. Pinned again in Portuguese (§5.3) |
| `src/components/TablePagination.tsx:142-168` the picker in the top branch only (D-20) | leave | Kept. Pinned again in Portuguese |
| `src/components/TablePagination.tsx:175-181` `positionLabel` (D-8) | leave | Kept verbatim; its output is now also handed to `range` |
| `src/components/TablePagination.tsx:90`, `:153` (D-5, D-6) | leave | Behaviour, not words |
| `src/lib/table-paging.ts` (D-7, `TABLE_PAGE_SIZES`) | leave | Arithmetic; no words |
| `tests/components/TablePagination.test.tsx` (every English string) | leave | These pin the default. They must stay green **unedited** |
| `tests/components/Grid.additive.test.tsx:165-178` | leave | Same reason |
| DC `src/components/list-paging/ListPagination.tsx:83-90`, `:104-107` (DC's own English echo and its copy of D-8) | leave (read-only repo) | DC's lane. If DC ever translates, its echo uses `DEFAULT_TABLE_PAGINATION_LABELS.range` or its own words. Noted, not owed |

**Search terms used:**
- Kit `src/` and `tests/`: `TablePagination|table-paging`; `Previous|Next|Rows per page|List paging|Showing`;
  `DEFAULT_[A-Z_]+\s*[:=]|words\?:|Words\b` (the defaults idiom); `**/*.snap` (glob).
- DC `src/ app/ tests/`: `TablePagination|<ListPagination`; DC `tests/`: `TablePagination|"Rows per page"|List paging`.
- CRM `app/`, Org Admin `app/` + `src/`, RMS `src/` + `app/`: `TablePagination`.
- CR-MANGAVERDE-095 plan: `TablePagination|labels|design-system|range`.

## 9. Residuals and open questions

- **Owner pick:** look A or B (§2 D-6). The default is A.
- **R1** — An app can still undo D-8 by ignoring `position` and building its own text from `from`/`to`. The kit cannot
  stop a function. The README steers apps away from it, and Manga Verde's spec in CR-MANGAVERDE-095 is where it is
  pinned for that app.
- **R2** — An app that formats numbers by locale inside `range` (for example "1.284" in Portuguese) prints a different
  digit grouping from the kit's plain digits. The class stays `tabular-nums`, so columns do not jitter. The choice is
  the app's.
- **R3** — Key names differ from CR-MANGAVERDE-095's own plan text (S1). They follow the owner's CR-024 request, which
  is later and specific. It costs that build a rename on paper, and no code exists yet on its side.
- **Standing, carried:** no cross-system register; no CR-008 decision-log entry; 4 inert `ignoreGhsas`; OQ-8; the
  `.snap` CRLF artefact (do not stage); `prettier --print-width 100`.

## 10. After merge

Report the **merged** `main` sha in the close-out and the handover. CR-MANGAVERDE-095 is unblocked with a build note: pin
that sha, use the CR-024 key names, and run its full suites. Its own plan already says the bump brings 0.6.0–0.8.0
(`CR-MANGAVERDE-095.md:236-238`). That is the only pin move this change causes, and it is CR-MANGAVERDE-095's to make.
`package.json` says `0.8.0`. DC, CRM, RMS and Org Admin see nothing until they move their own pins.

## 11. Not an epic

One optional prop on one existing component, one constant, one type, two barrel names, a changelog and a version. I
cannot name five milestones this decomposes into. Manga Verde's adoption is CR-MANGAVERDE-095's own change, not a
milestone of this one.
