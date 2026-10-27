# CR-DESIGN-SYSTEM-023 — a linked-records line (`LinkedRecords`) and one optional `linked` slot on `DocumentHeader` — Logic Plan

> Companion of **CR-DC-223** (DC linked documents box; plan approved, **layout A**, ship on-green). CR-DC-223 is
> blocked at build until this change merges and DC pins the merge sha. Its plan §8.1 governs where this brief is
> shorter, and it forbids a DC-local copy. **This was a planning session only. No feature code was written.**
> `bananaworld-dc` and the CR-DC-223 worktree were only read. Base: `main` @ `bb6c22e` (CR-DESIGN-SYSTEM-021, PR #39,
> kit **0.6.0**). DC's pin, from its own `package.json:57`: `bb6c22ea493ee857da69e969d2482ca7acaab15d`.

<!-- OWNER-BRIEF-START -->

**What you'll get.** The shared screen kit gets the "Linked" line you picked for the warehouse change. It is one line at the foot of a document's header. It lists the linked documents by type, with a number and a date for each. Rest the mouse on a number, or move to it with the keyboard, and a small card shows its type, status and a few facts. On a phone or tablet, a small "i" appears beside each number. Tapping it brings the card up from the bottom, with a way to open that document. A document you may not open shows in grey with a small lock and no card. When nothing is linked, one quiet line says so.

**Please confirm.** The line is the look you already chose (A). The only new choice is the card on a phone or tablet:
- **A (recommended).** A short panel, just tall enough for the card. This is how you saw it.
- **B.** The kit's usual tall panel, which fills the screen.
- **C.** Like A, but with no thin divider above the line, and "Linked" written like the header's other labels.

**Not included.** The warehouse screens and finding the documents. They come in the warehouse change waiting on this one. No app changes until it chooses to update.

**Risks.** None for live apps. Nothing they show today changes.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md:1`: the next estate session is due **2027-01-10**. It
  is not overdue.
- **No `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md` exists in this worktree** (searched; the
  same finding has been recorded since CR-013). The standing rules come from the conductor's project rules, the
  estate `CLAUDE.md` and `runs/current/SESSION_HANDOVER.md`.
- **No existing plan for this CR.** This is a fresh plan, not a revision. No owner responses are recorded.
- **No clarify round was used.** The request and CR-DC-223 §8.1 settle the scope, the layout (A) and every edge the
  owner owns. The one visible choice left (how tall the touch panel is) is a mockup pick, brief (b).
- **Read in this repo:**
  - `src/components/DocumentHeader.tsx` (whole), `Tooltip.tsx`, `Sheet.tsx`, `Icon.tsx`, `index.ts` (whole).
  - The signatures of `Skeleton.tsx:21` and `StatusBadge.tsx:68-80`.
  - `package.json`, `README.md:1-80`.
  - `tests/components/DocumentHeader.test.tsx` (whole) and `tests/components/DragBoard.additive.test.tsx` (the
    export inventory).
  - The CR-021 plan (format precedent) and `runs/current/SESSION_HANDOVER.md`.
- **Read in the CR-DC-223 worktree (read only):**
  - `runs/current/logic-plan/CR-DC-223.md`, whole. §2 option A, §8.1 and §11 are the spec.
  - `runs/current/mockups/CR-DC-223/option-a.html`, the approved picture.
- **Read in DC (read only):**
  - `package.json:57` (the pin).
  - `src/components/reports/DrillCell.tsx:68-90` (`DrillLink`: a plain function component, **no `forwardRef`, no
    props spread**, which confirms the wrapping-span rule).
  - `app/{browser-admin,tablet-pwa,design-system}/layout.tsx` (each mounts `TooltipProvider delayDuration={200}`).
  - The `<DocumentHeader` call sites (15 files, 16 render sites).
  - `tests/unit/components/DocumentHeader.test.tsx:58-80` and `tests/unit/adjustment/adjustment-sheet.test.tsx:395`
    (both read the header's `dt` order off the DOM).
  - `tests/contract/transaction-form-standard.test.ts:714-727, 1556-1670` (a scan of this package's header source).
- **Not readable from here:** the CRM, RMS and Org Admin. No claim is made about their code.
- **Searched:** `LinkedRecords|linked|role="group"|useSyncExternalStore` in the kit's `src/` finds only the two
  existing `role="group"` uses (`GridGroupStrip.tsx:244`, `Keypad.tsx:86`). So the kit at `bb6c22e` has no
  LinkedRecords part and no linked slot, which confirms the request. `LinkedRecords|\blinked=` in DC's `src/ app/
  tests/` has **0 hits**, so no DC caller passes `linked` today and no DC name collides.

## 1. Decisions taken here (the chassis is mine; each is recorded in the decision log at build)

### D-1 — The linked line sits inside the header **frame**, but outside the `<dl>`

The brief says: *rendered full width beneath the four slots inside the same dl frame as a div with role group after
the slots, so the dl stays valid.* The goal is a valid `<dl>`. **A `<div role="group">` as a child of `<dl>` does not
meet that goal:**
- In HTML, a `div` child of `dl` must wrap `dt`/`dd` groups.
- axe-core's `definition-list` rule (`only-dlitems` check) unwraps a `div` only when it has **no role**. A `div` with
  `role="group"` is counted as a disallowed child, so the rule reports a violation.
- I could not open axe's source from this session (no `node_modules` in the worktree), so this claim comes from
  memory of the rule. **The build verifies it first**: it renders the brief's literal shape, runs axe over it, and
  records the result in evidence. If axe passes that shape, the build still uses D-1, because D-1 is also valid
  HTML. The finding goes to the decision log either way.

The alternative of adding a fifth full-width `<div><dt>Linked</dt><dd>…</dd></div>` keeps the `dl` valid. It is
rejected because it puts a **fifth `dt`** in the header. DC's `DocumentHeader.test.tsx:58-80` and
`adjustment-sheet.test.tsx:395` read the header's `dt` order off the DOM and expect exactly the four slots. Every DC
form that adopts the line in CR-DC-223 would turn those specs red, a delayed-action failure handed to another lane.

**So, when `linked` is given**, the header renders:

```tsx
<div className="rounded-lg border border-border p-4">                      // the same frame, now on a wrapper
  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{cells}</dl>
  <div className="mt-4 border-t border-border pt-3 empty:hidden">{props.linked}</div>
</div>
```

**When `linked` is absent** (or `null`), the header renders **exactly today's single `<dl>`**, with the same class
string, the same children and the same ids. That is proven byte-identical (§6.2).

This is also what the **approved picture draws**. In `CR-DC-223/option-a.html:98-120`, the frame `.hdr` holds
`dl.slots` and then a sibling `.la` line, separated by a hairline (`border-top`). The `dl` keeps exactly four `div`s,
so DC's `T-6` (`dl > div` = 4) and every `dt`-order spec stay green, whether or not a form passes `linked`.

- **`empty:hidden`**: DC's `LinkedDocumentsBox` returns `null` on a new, unsaved document (CR-DC-223 §8.2). The
  element DC passes is still a non-null node, so without this the header would draw an empty hairline. With
  `:empty`, the strip collapses. This is noted for CR-DC-223 in `known-issues.md`; DC may also simply not pass the
  prop.
- **The role.** The named `role="group"` moves onto `LinkedRecords`' own root (`aria-labelledby` its visible label,
  e.g. "Linked"). That is where a name exists. The header wrapper is a plain `div`, so the line is not two nested
  groups, one of them unnamed. A CRM passing some other node into `linked` gets a plain full-width strip.

### D-2 — "Only under hover: none" is decided in JavaScript, not with a CSS class

The request's test names a `matchMedia` stub, so the info button is **rendered** or **not rendered**; it is not hidden
with CSS. A private hook in `LinkedRecords.tsx`:

```ts
const CANNOT_HOVER = "(hover: none)";
function useCannotHover(): boolean  // useSyncExternalStore(subscribe to matchMedia change, snapshot, server → false)
```

- With no `window` or no `matchMedia` (server render, old engines), the hook returns `false`, so there is no button.
  The tooltip still works.
- **Residual R1:** on a touch device the buttons appear just after hydration (a small, one-time reflow). This is
  accepted. A CSS-only version would always ship the button into the DOM and could not satisfy the requested
  `matchMedia` test.

### D-3 — The kit's built-in words are optional and default to English (the `Keypad` `words` precedent, CR-021)

Every word that is the app's is a required prop: `label` ("Linked"), `emptyText`, the group labels and each item's
`text` and `refusedLabel`. The kit's own control words go in `words?`:

| Word | Default |
|---|---|
| `summaryOf` | `"Summary of"`, giving the info button the name `"Summary of DSP-00131"` |
| `close` | `"Close"` |
| `open` | `"Open"` (printed before the app's link node in the touch panel) |
| `error` | `"Couldn't load the links."` |
| `retry` | `"Retry"` |

- **`label` is an addition to the brief's prop list.** The approved line begins "Linked ·", and the kit may not
  invent an app's word, so `label` is required.
- **No footer line in the card.** The mockup's "Click the number to open it in a new tab" is left out: whether a link
  opens a new tab is the app's anchor's business, not the kit's. If DC wants it, it can be a summary row.

### D-4 — The tooltip needs the app's `TooltipProvider`

The kit does not mount a `TooltipProvider` of its own. The request says the card opens "after the provider delay",
which is the app's delay; DC mounts `delayDuration={200}` in all three shells. A Radix `Tooltip` outside a provider
throws. This is a new component with no existing caller, so the requirement breaks nothing. The README states it on
the component's own line, as the kit already does for `Tooltip`.

## 2. `LinkedRecords` and `LinkedRecordsItem` (new file `src/components/LinkedRecords.tsx`)

**Presentation only.** No data fetching, no app types, no addresses, no permission logic. It imports only kit
siblings (`./Tooltip`, `./Sheet`, `./Icon`, `./Skeleton`, `../lib`) and `lucide-react` (`Info`, `Lock`), which is
already a dependency. **No new dependency.**

### 2.1 Types and props

```ts
export interface LinkedRecordsSummary {
  readonly type: string;                                   // "Dispatch"
  readonly number: string;                                 // "DSP-00131"
  readonly status?: string;                                // "Posted"
  readonly rows: readonly { readonly label: string; readonly value: string }[]; // Date · Customer · Total
}
export interface LinkedRecordsEntry {
  readonly key: string;
  readonly link: ReactNode | null;   // the app's own anchor (DC: <DrillLink/>); null = no address
  readonly text: string;             // the number as plain text ("—" for an unnumbered document, the app's call)
  readonly date?: string;            // already formatted by the app ("7 Oct")
  readonly summary?: LinkedRecordsSummary;
  readonly refusedLabel?: string;    // present ⇒ refused: "You can't open crate corrections"
}
export interface LinkedRecordsGroup {
  readonly key: string;
  readonly label: string;            // "Dispatches"
  readonly items: readonly LinkedRecordsEntry[];
  readonly more?: ReactNode;         // the app's "+N more" (a link or plain text)
}
export interface LinkedRecordsWords { summaryOf?: string; close?: string; open?: string; error?: string; retry?: string }
export interface LinkedRecordsProps {
  readonly label: string;                                  // "Linked"
  readonly groups: readonly LinkedRecordsGroup[];
  readonly emptyText: string;                              // "Nothing linked to this document yet"
  readonly state?: "ready" | "loading" | "error";          // default "ready"
  readonly onRetry?: () => void;
  readonly words?: LinkedRecordsWords;
  readonly className?: string;
}
export type LinkedRecordsItemProps = Omit<LinkedRecordsEntry, "key"> & { readonly words?: LinkedRecordsWords };
```

- `key` lives on the entry and the group (data), never as a component prop, because React reserves it.
- `layout` from CR-DC-223 §8.1 is **not** added. Only layout A is built, so a one-value prop would be configuration
  with nothing to configure (Stage 05 simplification).

### 2.2 `LinkedRecords` render (layout A)

```
<div role="group" aria-labelledby={labelId} aria-busy={loading || undefined}
     class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm min-w-0">
  <span id={labelId} class="text-2xs font-semibold uppercase tracking-wide text-fg-muted">{label}</span>
  loading → <Skeleton class="h-4 w-48" />                        (aria-hidden already; aria-busy on the group)
  error   → <span class="text-fg-muted">{words.error}</span> [<button type="button" class="font-semibold text-info
             underline-offset-2 hover:underline">{words.retry}</button> only when onRetry is given]
  ready, no group has an item → <span class="text-fg-subtle">{emptyText}</span>
  ready → for each group WITH items, in the order given:
          <span class="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1.5 min-w-0
                       [&:not(:nth-child(2))]:sm:border-l sm:pl-4 …">   (a hairline between groups, ≥ sm)
            <span class="font-medium text-fg-muted">{group.label}</span>
            {items → <LinkedRecordsItem …/>}  {group.more}
          </span>
</div>
```

- **One line that wraps.** `flex-wrap` on the line and on each group. At 375 px the groups fall onto further lines.
  Nothing truncates and nothing scrolls sideways (proved in the browser, §6.5).
- The Retry link uses the same classes as DocumentHeader's Undo, the kit's existing quiet inline action.
- **Empty means "no group has an item"**, not `groups.length === 0`. A group with no items is never drawn.
- The kit does no ordering. Groups and items render in the order the app gives them. Capping at six and the "+N
  more" count are CR-DC-223 §2's rule, and the app owns it (`more` is a node).

### 2.3 `LinkedRecordsItem` render

1. **Refused** (`refusedLabel !== undefined`):
   `<span class="inline-flex items-center gap-1 font-medium text-fg-subtle" title={refusedLabel}><Icon as={Lock}
   size="sm" label={refusedLabel}/>{text}</span>`.
   - The `Icon` with a `label` already renders `role="img"` and `aria-label`.
   - **Nothing else renders: no link, no date, no card, no button**, even if the app passed `date` or `summary`.
     The kit never reveals what a refusal hides; that is defence in depth on top of DC's server sending
     `{ id, code }` only.
2. **The number:** `link ?? <span class="font-medium text-fg">{text}</span>`. A `null` link with no refusal is CR-DC-223
   §9's proof of delivery with no run: the number and its card, no link.
3. **With `summary`, mouse and keyboard:**
   ```tsx
   <Tooltip>
     <TooltipTrigger asChild><span className="inline-flex">{numberNode}</span></TooltipTrigger>
     <TooltipContent side="bottom" align="start"
       className="w-[270px] max-w-[72vw] rounded-lg border border-border bg-surface p-3 text-fg shadow-lg">
       <SummaryCard summary={summary} />
     </TooltipContent>
   </Tooltip>
   ```
   - **The trigger is a wrapping `<span>`**, because `DrillLink` neither forwards a ref nor spreads props, and a Radix
     `asChild` child must do both.
   - Focus on the inner anchor bubbles (React `onFocus` is `focusin`), so **keyboard focus opens the card**.
   - Radix supplies the provider delay, Escape-to-close and dismissal.
   - The card holds **no focusable element**, so it is not interactive.
   - `TooltipContent`'s dark defaults (`bg-fg text-bg px-2 py-1`) are overridden through `cn`/tailwind-merge
     (className comes last). `Tooltip.tsx` is not edited.
4. **Date:** `<span class="text-xs text-fg-muted whitespace-nowrap">{date}</span>` after the number.
5. **Info button**, only when `summary` is given **and** `useCannotHover()` is true:
   ```tsx
   <button type="button" aria-label={`${words.summaryOf} ${summary.number}`} aria-haspopup="dialog"
     className="-my-2 inline-flex h-10 w-10 items-center justify-center rounded-full touch-manipulation
                focus-visible:outline-none focus-visible:shadow-focus" onClick={() => setOpen(true)}>
     <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border
                      bg-surface text-fg-muted"><Icon as={Info} size="sm" /></span>
   </button>
   ```
   - The **hit area is 40 × 40 px** (`h-10 w-10`) and the visible circle is 28 px.
   - `-my-2` keeps the line height. The 40 px target overlaps the line's padding, never another target.
6. **Touch panel** (rendered only while open; Radix portals nothing when closed):
   ```tsx
   <Sheet open={open} onOpenChange={setOpen}>
     <SheetContent hideCloseButton className="top-auto max-h-[85vh]">   {/* option A: short panel */}
       <SheetHeader><SheetDescription>{type} · {status}</SheetDescription><SheetTitle>{number}</SheetTitle></SheetHeader>
       <SheetBody width="full"><SummaryRows rows={rows} /></SheetBody>
       <SheetFooter>
         {link !== null && <span className="mr-auto text-sm">{words.open} {link}</span>}
         <SheetClose className="…h-11 px-4 rounded-md border…">{words.close}</SheetClose>
       </SheetFooter>
     </SheetContent>
   </Sheet>
   ```
   - **The Open control is the app's link node again**, as the request specifies. "Open" is printed beside it
     because the app's node cannot be restyled.
   - The package `Sheet` keeps its focus trap, focus return to the info button, Escape and scroll lock (Radix
     Dialog), with no fork. The Dialog `Title` is the number, so the panel has an accessible name.
   - `hideCloseButton` plus a 44 px footer **Close** gives one close control that is big enough for a thumb. The
     panel's existing top-right X is 32 px.
7. **`SummaryCard`** (private, shared by the tooltip and the sheet):
   - The type, in small uppercase, with the status as a neutral pill (`rounded-full border border-border px-2
     text-2xs font-semibold`). **Not `StatusBadge`**: its colours come from a fixed status enum, and these
     statuses are the app's words.
   - The number, bold.
   - A `<dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 gap-y-1">` of the rows. This `dl` is the card's own,
     portalled, and valid (`dt` and `dd` pairs).

### 2.4 Mockup options, and what each changes in code (owner brief (b))

- **A (recommended, the picked look):** everything above. A hairline above the line, a small uppercase label, and the
  short touch panel (`top-auto max-h-[85vh]`).
- **B:** no `className` override on `SheetContent`. The kit's standard sheet fills the screen below the app bar. One
  line of code less; a tall panel for a five-line card.
- **C:** no hairline (the header wrapper drops `border-t pt-3`), and the label uses the slot-label class (`text-xs
  font-medium text-fg-muted`, no uppercase). Short panel as in A.

## 3. `DocumentHeader`: one optional `linked` prop

```ts
/**
 * 🔴 CR-DESIGN-SYSTEM-023 — the linked-records line, full width under the four slots, inside the same frame.
 * Absent (or null) ⇒ the header renders exactly as before: one `<dl>`, same classes, same children.
 * NOT a slot: `DOCUMENT_HEADER_SLOTS` is untouched, and the line sits OUTSIDE the `<dl>` (decision D-1) so the
 * list keeps exactly its four `dt`s — which Bananaworld-DC's specs read in order.
 */
readonly linked?: ReactNode;
```

Render change, the whole of it:
- The `slots.map(...)` expression is assigned to `const cells`. `const slots = DOCUMENT_HEADER_SLOTS;` and
  `slots.map(` stay **verbatim**, because DC's `transaction-form-standard.test.ts:714-727` and this repo's
  `DocumentHeader.test.tsx:667-710` scan the source for both.
- `if (props.linked === undefined || props.linked === null) return <dl className="<today's exact string>">{cells}</dl>;`
- Otherwise the D-1 wrapper is returned.
- **Nothing else changes:** no slot, no label, no state, no string, no existing class, and no `"Date"`-led array
  literal is added (the "exactly one slot array" spec, `:699-700`).

## 4. Barrel, inventory, version, README

- `src/components/index.ts`: one new block after the `Keypad`/`ActionTile` lines, with a CR comment in the file's
  style:
  `export { LinkedRecords, LinkedRecordsItem, type LinkedRecordsProps, type LinkedRecordsItemProps, type
  LinkedRecordsGroup, type LinkedRecordsEntry, type LinkedRecordsSummary, type LinkedRecordsWords } from
  "./LinkedRecords";`
  - **No existing line moves.**
  - The `./DocumentHeader` block is untouched, so its "exactly eight names" spec (`DocumentHeader.test.tsx:740-760`)
    stays green unedited.
- `tests/components/DragBoard.additive.test.tsx`: `ADDED_SINCE_011` gains `"LinkedRecords"` and
  `"LinkedRecordsItem"` under `// CR-DESIGN-SYSTEM-023`. Those are **two runtime names**; the types are erased.
  `EXPORTS_AT_8387F66B` is not edited.
- `package.json` `version` **0.6.0 → 0.7.0** (additive minor). The stale "28 primitives" description is left alone,
  as at CR-021.
- `README.md`:
  - The Changelog gets an entry for **0.7.0**.
  - A new section, `## Linked records` (≈20 lines), covers:
    - a usage example (groups, a `DrillLink`-style app node, `summary`, `refusedLabel`, `state`, `onRetry`);
    - "mount `TooltipProvider` once at the shell" (D-4);
    - the wrapping-span rule ("your link needs no `forwardRef`");
    - `DocumentHeader linked={…}`, and "pass nothing, or a node that renders `null`, for an unsaved document"
      (`empty:hidden`).

## 5. Existing callers checked (the additive claim)

| Caller | Why unaffected |
|---|---|
| DC (pin `bb6c22ea`), the 16 `<DocumentHeader` render sites in 15 files: `SalesOrderForm`, `DispatchForm`, `BrowserReceivingForm`, `FuelEntryPanel`, `MoveSheet`, `NewCountForm`, `FarmCrateNoteForm`, `DeliveryRunsView`, `CrateMovementForm`, `ConversionRunForm`, `ReturnCaptureSheet`, `AdjustmentSheet`, `RipeningRunsView` ×2, plus the two `document-number` hooks that only name the type | None passes `linked` (grep `\blinked=`: 0 hits), so every one takes the unchanged `<dl>` branch, proven byte-identical (§6.2). And DC only gets this code when it moves its pin |
| DC `tests/unit/components/DocumentHeader.test.tsx:58-80`, `tests/unit/adjustment/adjustment-sheet.test.tsx:395` (`dt` order) | No `dt` is added, ever, not even with `linked` (D-1) |
| DC `tests/contract/transaction-form-standard.test.ts:714-727, 1624-1631` (source scan: the slot-array literal, `const slots = DOCUMENT_HEADER_SLOTS;`, each `"<slot>"` literal) | All three strings are kept verbatim. This repo's mirror spec (`DocumentHeader.test.tsx:667-710`) runs unedited |
| DC `Tooltip` / `Sheet` users | `Tooltip.tsx` and `Sheet.tsx` are **imported**, not edited |
| Kit tests (all files) | Pass **unedited**, except the one inventory declaration (§4) |
| CRM, RMS, Org Admin | Not readable. They cannot be affected: the one edited module renders identically without the new prop, and they gain the new names only when they move their pin |

## 6. Proof (to be done at build, NOT claimed now)

1. **Re-measure the baseline first** at `bb6c22e` (handover: 615 tests / 30 files at CR-021).
2. **`DocumentHeader` byte-identity, without `linked`.**
   - The file as it stands at `bb6c22e` is committed as a frozen fixture, `tests/fixtures/DocumentHeader.at-bb6c22e.tsx`,
     on the CR-018 frozen-copy precedent.
   - A matrix is rendered through both: the number slot `absent`, `auto` and `editable` (calm, warn, error); the date
     as a value, a control, a shared editable slot and a shared value; `dcLabel` on and off; `documentPdf` on and
     off; and `linked` omitted, `undefined` and `null`.
   - The test asserts `container.innerHTML` equal after normalising `useId` values (`id`/`for` attributes). React 19
     client ids come from a global counter, so they differ between roots by construction.
   - Additional asserts: `dl` is the root element, and its `className` is the exact string.
3. **`DocumentHeader` with `linked`:**
   - The node renders after the four slots, inside the framed wrapper, and **outside** the `dl`.
   - `dl > div` is still 4, and `dt` order is still `DOCUMENT_HEADER_SLOTS`.
   - A node that renders `null` leaves the wrapper `:empty` and it carries `empty:hidden`.
   - axe shows 0 violations.
   - **Evidence only, not a committed spec:** axe over the brief's literal `<dl>…<div role="group">` shape, to
     settle D-1's claim.
4. **`tests/components/LinkedRecords.test.tsx`** (happy-dom, `user-event`, wrapped in
   `<TooltipProvider delayDuration={0}>`):
   - **Render per state:**
     - `ready`: the label, the groups in the order given, each item's text and date, and a group with no items not
       drawn.
     - `loading`: a skeleton, `aria-busy`, and no items.
     - `error`: the error text, and Retry calls `onRetry`. With no `onRetry` there is no Retry.
     - `ready` with no items: `emptyText` only.
   - **Pointer hover opens the card:** `user.hover` on the number, then `findByRole("tooltip")` holds the type,
     number, status and every row. The link is a **test component with no `forwardRef` that drops unknown props**,
     the `DrillLink` shape. This is the spec that proves the wrapping span.
   - **Keyboard focus opens the card:** `user.tab()` to the link opens it, and `{Escape}` closes it.
   - **The card is not interactive:** the tooltip content contains no focusable element.
   - **The info button only under `hover: none`:**
     - With `matchMedia` stubbed `matches: false` there are 0 buttons.
     - With the stub `true`, there is one per item with a summary, named "Summary of DSP-00131", with `type="button"`
       and `h-10 w-10`.
     - None appears for an item with no summary.
   - **Tap opens the sheet:**
     - Clicking the info button opens `getByRole("dialog")`, named by the number, holding the rows **and the app's
       link node**.
     - Close closes it, and focus returns to the info button.
     - With `link: null`, there is no Open control.
   - **Refused item:**
     - There is an `img` named by `refusedLabel` and the text.
     - **No button** in either `matchMedia` mode, **no tooltip** on hover or focus, and no link.
     - The date and summary are **not rendered even when passed**.
   - **`words` override** all five words.
   - **axe**, 0 violations, in each case: ready, empty, loading, error, refused, info buttons shown, and sheet open.
5. **The additive claim:**
   - The export inventory stays green with exactly two declared runtime additions.
   - `git diff bb6c22e --stat -- src/` must show only `index.ts` (+lines, 0 −lines), `DocumentHeader.tsx`, and the
     new `LinkedRecords.tsx`.
   - `pnpm typecheck` is clean, and every existing spec passes unedited (bar the inventory line).
6. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`; "ANCHOR NOT FOUND" exits non-zero). Each
   mutant must turn a **named** spec red:
   - M1: the info button is rendered regardless of `useCannotHover`.
   - M2: a refused item gets the tooltip and the button.
   - M3: `asChild` goes straight onto the link node (the span is dropped), which reddens the no-`forwardRef` hover
     spec.
   - M4: the header always takes the wrapper branch, which reddens byte-identity.
   - M5: the line goes inside the `dl`, which reddens `dl > div` = 4 and the `dt` order.
   - M6: the empty test checks `groups.length` instead, which reddens "a group with no items".
   - M7: Retry does not call `onRetry`.
   - M8: the sheet's Open control is dropped.
   - M9: a refused item renders its date.
   - M10: `empty:hidden` is dropped.
7. **Other checks:**
   - `pnpm test`, `pnpm typecheck`, `pnpm audit --prod --audit-level=high`.
   - `quality-sensors.mjs`, LF-normalised.
   - `prettier --check --print-width 100` on the touched files.
8. **Real-browser proof** (the committed Edge driver pattern, `runs/change-10/evidence/browser-proof/proof.mjs`).
   - Setup: DC's `playwright-core` and `tailwindcss`, both read-only, with a scratch fixture outside the estate tree.
   - Viewports: 1270 px (mouse), and 820 px and 375 px (`hasTouch`, `isMobile`, so `hover: none` is true).
   - Assertions:
     - hovering a number shows the card after the delay;
     - Tab shows it;
     - Escape hides it;
     - on touch the info target box is ≥ 40 × 40 px;
     - a tap opens the short bottom panel with the Open link;
     - at 375 px the line wraps with `scrollWidth === clientWidth` (no sideways scroll);
     - the header with and without `linked`;
     - axe in the page shows 0 violations.
   - Frames go to `runs/change-NN/evidence/frames/`.

## 7. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/LinkedRecords.tsx` | new: `LinkedRecords`, `LinkedRecordsItem`, the private `SummaryCard` and `useCannotHover` (§2) | 280 |
| `src/components/DocumentHeader.tsx` | `linked?` prop with its comment, `cells` and the two-branch return (§3) | 35 |
| `src/components/index.ts` | +1 export block with a CR comment | 14 |
| `README.md` | Changelog 0.7.0 + the "Linked records" section | 40 |
| `package.json` | `version` 0.7.0 | 1 |

Paper trail (not in the estimate):
- Tests: `LinkedRecords.test.tsx`, the `DocumentHeader` linked and byte-identity specs, the frozen fixture, and the
  inventory line.
- The browser proof and its frames, and the mutation battery.
- The decision-log entry `CR-DESIGN-SYSTEM-023` (D-1 to D-4).
- The refreshed handover and active milestone.
- `known-issues.md`: R1–R4, plus what CR-DC-223 owes.

The archive goes in the slot the conductor names (never overwrite; handover item 13). No migration (no database). No
new dependency. **No consumer pin is bumped.** No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` is
created or written.

## 8. Cross-app intersection map

No shared data record is touched. The kit has no database and makes no call. The only seams are the package hand-off
to each consumer, plus one presentation hand-off inside the component. **The kit writes the controls. Each app reads
them only when it moves its own pin, to the MERGED sha on `main`, never a branch sha (KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | `LinkedRecords` / `LinkedRecordsItem` → **DC** (pin `bb6c22ea`) | Kit | DC (CR-DC-223's box) | Adds the part CR-DC-223 §8.1 requires | **CR-DC-223's build** pins the merge sha verified on `refs/heads/main` and re-exports the names through `src/components/ui/index.ts`. Not done here |
| S2 | `DocumentHeader.linked` → **DC, CRM** | Kit | Each app, only when it passes the prop | Absent ⇒ byte-identical (§6.2). Present ⇒ the line goes outside the `dl`, so DC's `dt`-order specs stay green | CR-DC-223 passes `linked` on its `DocumentHeader` forms. For an unsaved document it passes nothing, or relies on `empty:hidden` |
| S3 | Link node: app → kit | **App** renders the anchor (DC: `DrillLink`, `target="_blank"`, `rel="noopener noreferrer"`) | Kit places it, twice (in the line and in the touch panel) | The kit never builds, reads or rewrites an address; the anchor's security attributes stay DC's | None |
| S4 | Who may see a linked document's details: app → kit | **App** decides (DC: `visibleFinderKinds`, server-side) | Kit shows `refusedLabel` as a lock | The kit enforces only "a refused item reveals nothing" (no date, no card) as defence in depth. The decision stays DC's | None |
| S5 | `TooltipProvider` | App shell | Kit `Tooltip` | Required by the new part (D-4). DC mounts it in all three shells | The CRM must have one before it adopts. Its README line says so |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo. This is the sixteenth change to note
it; the decision is the owner's. S1–S5 go to `known-issues.md` at build.

## Rule sites

**No business rule changes.** The part decides nothing about what may happen to a document. Who may open a linked
document is DC's rule, DECISION-281 applied through `visibleFinderKinds` (CR-DC-223 Rule sites R1). The kit only
**renders** the refusal it is handed and never re-derives it. Capping a group at six and "+N more" is CR-DC-223's
layout bound (its R3), passed in as `more`. No existing rule is moved, retired or re-spelled.

For transparency, the nearby sites that spell something this change sits beside, all **left**:

| Site | Change / leave | Reason |
|---|---|---|
| `src/components/DocumentHeader.tsx:74` `DOCUMENT_HEADER_SLOTS` | leave | The four slots and their order (owner rulings Q12 and 2026-08-08). `linked` is not a slot |
| `src/components/DocumentHeader.tsx:283` `const slots = DOCUMENT_HEADER_SLOTS;` + `:287` `slots.map(` | leave (verbatim) | Scanned by DC's form-standard contract and by this repo's mirror |
| `src/components/Tooltip.tsx`, `src/components/Sheet.tsx` | leave | Composed, not edited |
| DC `src/components/reports/DrillCell.tsx:119` `LINKED_DOCUMENT_LIMIT = 2` | leave (read-only repo) | The grid cell's bound. The box's bound (6) is CR-DC-223's |
| DC `src/lib/document-search/cross-kind.ts:72-79` `visibleFinderKinds` | leave (read-only repo) | The one permission gate. The kit never sees a permission |

**Search terms used:**
- Kit `src/`: `LinkedRecords|linked|role="group"|useSyncExternalStore`; `matchMedia|TooltipProvider|hover:\s*none|hover:none`
  (`src/` + `tests/`); `export (function|const) (Skeleton|StatusBadge)`.
- DC `src/ app/ tests/`: `LinkedRecords|\blinked=`; `TooltipProvider|<Tooltip\b` (DC `src/ app/`); `<DocumentHeader\b`
  (DC `src/`); `dl > div|querySelectorAll\("dt|DOCUMENT_HEADER_SLOTS` (DC `tests/`); `<dl|grid-cols-4|rounded-lg
  border border-border p-4` (DC `tests/`).

## 9. Residuals and open questions

- **Owner pick:** the touch panel, A, B or C (§2.4). The default is A, as approved in CR-DC-223.
- **R1** — The info buttons appear just after hydration on a touch device (D-2). A one-time small reflow.
- **R2** — A screen-reader user on a desktop hears the card only partly. Radix puts `aria-describedby` on the
  wrapping span, not on the app's anchor, which the kit cannot touch. The card is supplementary (type, status, a few
  facts), and on a touch device the info button and panel give full access. If an owner later wants it announced
  everywhere, the fix is in the app's anchor (accept and spread props), which is DC's lane.
- **R3** — Hybrid devices (a touch laptop with a mouse) report `hover: hover`, so there is no info button. The mouse
  gets the card, and a tap on the number navigates as on any link. Accepted.
- **R4 — D-1 deviates from the brief's literal markup** to meet its stated goal, a valid `dl`. The build records
  the axe result for the literal shape (§6.3). If a reviewer prefers the literal shape regardless, it is a one-branch
  change. It would still fail axe, and it would not add a `dt`.
- **Standing, carried:** no cross-system register; no CR-008 decision-log entry; 4 inert `ignoreGhsas`; OQ-8; the
  `.snap` CRLF artefact (do not stage); `prettier --print-width 100`.

## 10. After merge

Report the **merged** `main` sha in the close-out and the handover. CR-DC-223 is reopened with a build note and moves
DC's pin from `bb6c22ea` to that sha. That is the only pin move this change causes, and it is CR-DC-223's to make. The
move carries nothing else new: DC's pin is already at CR-021. `package.json` says `0.7.0`. The CRM sees nothing until
it moves its own pin.

## 11. Not an epic

One new presentation part (two components), one optional prop, one barrel block, a changelog and a version. I cannot
name five milestones this decomposes into. DC's adoption is CR-DC-223's own change, not a milestone of this one.
