# CR-DESIGN-SYSTEM-029 — a compact size for the truck loading picture on phones (`TruckDiagram density`) — Logic Plan

> Raised by owner ruling 2026-11-08, from the packhouse EPIC-006-M-01 mockup-fidelity review. It follows on from
> CR-DESIGN-SYSTEM-028 (kit 0.11.0, `eefc0c8`).
> **This was a planning session only. No feature code was written.** `bananaworld-dc` and `bananaworld-ph` were only
> read. Base: `main` @ `eefc0c8` (CR-DESIGN-SYSTEM-028, PR #46, kit **0.11.0**). Branch `change/cr-design-system-029`.

<!-- OWNER-BRIEF-START -->

**What you'll get.** A shorter truck picture on phones, ready for the packhouse loading screen. Each space becomes one slim row, close to your mockup, with the space number and pallet number side by side. These all stay: the drop lines, Cab and Doors, "taken" with no pallet number, and the past-30 warning. Tablets, desk screens and printouts stay exactly as they are today. No other app changes.

**Please decide.**
- **How tall a space must be to tap it.** Today it is 56 on the packhouse phone, against about 33 in your mockup.
  - **40 (recommended).** Smaller than our usual minimum, but still safe: each space is very wide, and a wrong tap is undone by tapping again.
  - **44** if dispatchers wear gloves on the phone.
  - **36** is the smallest I would accept.
- **Pick a look.**
  - **A (recommended):** one line, the space number then the pallet number.
  - **B:** two short lines, like your mockup.
  - **C:** like A, at the smallest size.

**Not included.** Switching the loading screen over. The packhouse does that next.

**Risks.** The truck picture gets about a third shorter, but that does not close the whole gap. Most of the extra length on the phone is the list of pallets still to load, and fixing that is the packhouse's own job.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **Compliance heartbeat:** the next estate session is due **2027-01-10** (CR-028 plan §0, same register). It is not
  overdue.
- **This worktree has no `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md`** (I searched). That has
  been the standing finding since CR-013. The rules come from the conductor's project rules, the estate `CLAUDE.md` and
  `runs/current/SESSION_HANDOVER.md`.
- **This is a first plan, not a revision.** `runs/current/logic-plan/CR-DESIGN-SYSTEM-029.md` did not exist before.
  There are no recorded owner responses.
- **No clarify round was used** (3 remain). The request names the one owner decision itself (the tap size, at the plan
  gate). The other edges are presentation, so they are mine, and they are put to the owner as picks in brief (b).
- **Read in this repo:**
  - `src/components/TruckDiagram.tsx` (whole, 267 lines) and `tests/components/TruckDiagram.test.tsx` (whole).
  - `src/lib/tokens.css:130-164` (the tablet surface: `--control-h-md: 56px`, "gloved hands").
  - `src/lib/cn.ts` (`twMerge(clsx(...))`).
  - `README.md:120-229` (Changelog, "Truck loading picture").
  - `package.json` (`version` 0.11.0).
  - The CR-028 plan (whole), its comparison page, `runs/change-26/evidence/developer-handover.md` and
    `runs/change-26/output/known-issues.md`.
  - The density precedent: `Table.tsx:120` `TableDensity = "default" | "compact"`, and `GridHeadCell.tsx:101-110` /
    `GridFilterRow.tsx:146-171`, where each density has its own complete class string and the `default` entry is the
    shipped string, byte for byte.
  - Touch floors in the kit: `Button.tsx:12` (browser 36 px, tablet 56 px), `ChoiceGroup.tsx:19,107` (tablet 48 px,
    UX-PRINCIPLE-006 gloved hand), `TruckDiagram.tsx:83-84` (`min-h-12` / tablet `min-h-14`).
- **Read in bananaworld-ph (read only):**
  - `runs/epic-06/milestone-01/evidence/mockup-fidelity.md`: picked option **D**. Every phone and tablet loading frame
    reads "DIFFERS … TruckDiagram rows (about 48 px, taller than the mockup rows)".
  - Frames `02-loading-scan-accepted-phone.{mockup,built}.png`. The mockup is 390×1556 and the built screen 390×3828
    (2.46×).
  - `runs/current/mockups/EPIC-006-M-01/option-d.html`: spaces are `--sh:30px` with two lines (pallet number 14 px, then
    "space N" 11 px, line-height 1.1). That renders about **33 px** tall, with a 4 px gap and a 28 px row-number gutter.
  - 🔴 **`src/app/(floor)/layout.tsx:22` `<AppDocument surface="tablet">`** — the packhouse floor shell, which includes
    the dispatcher **phone**, sets `data-surface="tablet"` on `<body>` (`AppDocument.tsx:16`). So on the packhouse phone
    the truck spaces today are **56 px** (`[[data-surface=tablet]_&]:min-h-14`), not 48. The built frame agrees: about
    56 px spaces and an 8 px gap. **Compact must therefore win over the tablet surface rule on a phone-width screen**,
    or it would do nothing on the one screen that asked for it. This drives D-3.
- **Read in DC (read only):** a grep of every project's `.ts/.tsx` for `TruckDiagram|truckDiagramRows` finds **no
  importer anywhere** on disk — not DC, not CRM, and not the packhouse's checked-out `main` (its M-01 build sits on its
  own branch).

## 1. What exists today

- `TruckDiagram` (CR-028) draws every space with `SPACE` (`TruckDiagram.tsx:82-84`):
  `min-h-12` (48 px), `[[data-surface=tablet]_&]:min-h-14` (56 px), `print:min-h-8`, a `flex-col` with the position
  number on its own line above the pallet number, `px-2 py-1`. The list gap is `gap-2` (8 px, `LIST` `:76`), and the
  dividers and end blocks are `py-2`.
- **The truck picture's share of the length gap, measured on the fidelity frames** (approximate, read off the PNGs):
  - The built truck (40 spaces, 20 rows) is about **1,400 px**. The mockup truck (30 spaces, 15 rows) is about
    **685 px**.
  - The "not on the truck yet" list is about **1,530 px** built (18 cards) against about **250 px** in the mockup
    (3 cards plus "+2 more · scroll").
  - So **most of the 2.46× is the loading screen's own list, header and column**, which belong to the packhouse
    (EPIC-006-M-01), not to the kit. That is the brief's risk line, and it is recorded in S1.

## 2. Decisions taken here (the chassis is mine; each goes in the decision log at build)

### D-1 — One new optional prop, `density?: "default" | "compact"`. Absent means today

- The literal union is inline in `TruckDiagramProps`. **No new export:** I am not re-using `TableDensity`, because a
  "table" name on a truck would mislead, and a new exported type would grow the export surface for nothing. The
  barrel, the export inventory (`DragBoard.additive.test.tsx`) and `src/components/index.ts` (which is at the 300-line
  sensor limit) are **not touched**.
- `density` is destructured from props, so it never reaches the root `<div>` through `...rest`. An unknown value is
  treated as `"default"`.
- **The default path is byte-identical.** I follow the `GridHeadCell.tsx:101-102` rule: one complete class string per
  density, and the `default` entry *is* the existing constant (`SPACE`, `LIST`, `DIVIDER`, `END_BLOCK`, `WARNING`), left
  untouched. With no `density` (or `"default"`), every element, attribute and class string is the same as at `eefc0c8`.
  §5.2 proves it.

### D-2 — What compact changes, and what it never changes

| Changes in compact (phone width only, D-3) | Never changes |
|---|---|
| Space height (the owner's pick: 40 recommended, 44 or 36) | The DOM: same elements, same order, same `<ol start>`, same groups |
| Space body on one line: the position number (small), then the pallet number or "Taken" (bold), wrapping to a second short line only for a note, a drop tag or a long label | Accessible names ("Position 7 1N2602-07", "Position 3 Taken", "… Selected", "… Drop 1"), because the text nodes are the same |
| Row gap 8 → 4 px; the column gap stays 8 px | Which spaces are buttons (`taken` never; read-only without `onSlotTap`) |
| Divider, warning and Cab/Doors bars `py-2` → `py-1` | `taken` never shows a pallet number (the layout drops it, `truck-diagram-layout.ts`, untouched) |
| The selected check icon sits vertically centred at the right, with room reserved so a label never runs under it | Drop dividers and their words, Cab and Doors labels, the past-30 warning `<p>` |
| | `truckDiagramRows`, and therefore the PDF delivery note (M-02) |
| | Tablet (≥ 640 px), desk and print rendering (D-3) |

- **Look A (recommended) is CSS only:** `flex-row flex-wrap items-center` instead of `flex-col`. The `SpaceBody` markup
  is identical, so DOM order equals visual order and the names cannot move.
- **Look B (two short lines like the mockup)** needs the space body visually re-ordered (pallet number above, "Position
  N" below, centred) and the position word made visible in compact. The accessible name stays the same, because DOM order
  is unchanged and the word is the same `words.position`. However, the visible order then differs from the name's order
  (WCAG 2.5.3 is still met, because the name contains all the visible text, but this is not the best-practice
  "name starts with the visible label"). B also edits `SpaceBody`, not just class strings. That is why A is recommended.
- **Look C** is A at 36 px.
- **No row-number gutter** (the mockup has one). The space number is already in every space. A gutter would be a second
  numbering, and it would change the DOM. This is the CR-028 D-10 reasoning against look B there.

### D-3 — Compact applies below 640 px only, and it beats the tablet surface there

- **Why phone width only:** the ruling is "compact size for **phones**". The tablet surface's 56 px exists for gloved
  cold-room hands (`tokens.css:130,151`; UX-PRINCIPLE-006). An upright tablet (768/800 px), a desk and an A4 print page
  (≈ 794 CSS px) are all ≥ 640 px. They therefore keep today's look **by construction**: there, compact computes exactly
  the default styles.
- **Why it must beat the tablet rule:** the packhouse phone *is* `data-surface="tablet"` (§0). Below 640 px, compact sets
  the chosen height even under the tablet surface.
- **How (build detail, proved in the browser, §5.4):** every compact difference is scoped to below `sm` (`max-sm:`
  variants, or an unprefixed compact value with the default restored at `sm:`). The compact string drops the bare
  `[[data-surface=tablet]_&]:min-h-14` and restores it as `sm:[[data-surface=tablet]_&]:min-h-14`, so there is no
  specificity contest between a media query and an attribute selector. Tailwind 3.4 in the packhouse and DC supports
  both forms. Because `cn` is `twMerge`, the build checks that the merged compact string keeps every intended class
  (a unit test pins the final class string).
- A phone turned sideways (≥ 640 px wide) shows the default size. That is acceptable: it is the roomier shape, and the
  dispatcher holds the phone upright to scan.

### D-4 — The tap size: proposed 40 px, and how it squares with the 48 px floor

| Size | What it is | Verdict |
|---|---|---|
| 56 px | Today on the packhouse phone (tablet surface); the gloved-hand floor (`tokens.css:151`) | Unchanged on tablets |
| 48 px | The kit's picture floor (CR-028 D-7; Material 48 dp) | Unchanged for every default caller |
| 44 px | WCAG 2.5.5 (AAA) and the Apple guideline | Offered if gloves are worn on the phone |
| **40 px** | **Recommended.** With the 4 px row gap the row pitch is 44 px. Each space is about 130–170 px wide at 360–390 px | Meets WCAG 2.2 **2.5.8 (AA, 24 px)** by a wide margin; just under AAA in height only |
| 36 px | The kit's own browser control height (`Button.tsx:12`) | The smallest I would accept |
| ~33 px | The mockup | Not offered: below the kit's smallest control |

- **Why 40 is safe here, even though it is below 48:**
  1. **Opt-in and narrow.** Only a caller that passes `density="compact"` gets it, only below 640 px, and only on this
     picture. The 48/56 floors stay the kit default everywhere else.
  2. **The targets are very wide.** The floor exists because a fingertip is about 10 mm across. The miss risk is
     vertical only, and 40 px plus a 4 px gap gives a 44 px pitch.
  3. **A wrong tap is cheap and reversible.** A move is two taps: the first selects (and is shown "Selected" with a
     check), the second places. A wrong first tap is undone by tapping again, and a wrong second tap by moving the
     pallet again. A `taken` space is never a button, so a mis-tap can never land on another packhouse's space.
- **The honest cost:** gloved hands on a phone at 40 px will mis-tap more than at 56. If dispatchers load with gloves
  on, the owner should pick 44. Whatever is picked is written into the decision log as an explicit, owner-approved
  exception to the 48 px picture floor for `density="compact"` below 640 px. It is not a change to the floor.
- The pick changes one class token (`min-h-9` / `min-h-10` / `min-h-11`) and the matching test and proof numbers.

### D-5 — Print and the PDF are unchanged

- **The default path prints exactly as today:** its class strings are untouched (D-1).
- **A compact picture prints like a default one:** print pages are ≥ 640 CSS px wide (A4 ≈ 794, Letter 816), so every
  compact difference is switched off (D-3). The browser proof compares print-emulated screenshots of default and
  compact at A4 width and expects them to be pixel-identical.
- **The delivery-note PDF draws `truckDiagramRows`** (CR-028 D-9), which this change does not touch.

### D-6 — Server rendering, Radix, dependencies

- Still no client directive and no hook (the guard spec reads the file). `density` is a string, so a server component
  can pass it.
- Still native `<button>`s. Nothing about the control changes, only its box. There is no Radix control to preserve.
- No dependency moves.

## 3. The change, in shape

```ts
// src/components/TruckDiagram.tsx — additions only
export interface TruckDiagramProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  // … every existing prop unchanged …
  /** "compact": slim one-line spaces below 640 px (phones). Absent = today, on every surface. */
  readonly density?: "default" | "compact";
}

// one complete string per density; the default entries ARE today's constants, untouched
const SPACE_BY_DENSITY = { default: SPACE, compact: SPACE_COMPACT } as const;
const LIST_BY_DENSITY = { default: LIST, compact: LIST_COMPACT } as const;
// … DIVIDER, WARNING, END_BLOCK likewise; `Section` and `SpaceBody` receive `density`
```

- **Header comment:** one bullet for CR-029 (compact below 640 px; beats the tablet surface there; never changes the
  DOM, names, print or `truckDiagramRows`; owner-approved tap size; the default strings are the shipped strings).
- Look A is about 35 changed lines in the component. Look B adds about 10 more in `SpaceBody`.

## 4. Barrel, version, README

- **`src/components/index.ts`:** no change (no new name).
- **`tests/components/DragBoard.additive.test.tsx`:** no change (no new runtime export).
- **`package.json`:** `version` **0.11.0 → 0.12.0** (an additive minor: a new optional prop).
- **`README.md`:**
  - a Changelog **0.12.0** line;
  - one paragraph and a `density="compact"` line in the "Truck loading picture" example: phones only, beats the tablet
    surface below 640 px, the owner-approved tap size, prints and the PDF unchanged.
  - The README example and the browser-proof fixture page are the kit's "stories" (there is no Storybook; CR-028 §4).

## 5. Proof (to be done at build, NOT claimed now)

1. **Re-measure the baseline first** at `eefc0c8`. The handover records 773/773. Run with
   `--pool=threads --maxWorkers=2 --testTimeout=60000`.
2. **Byte-identity of the default path:**
   - Before any edit, render **six fixtures** with `renderToString` at `eefc0c8`: plain truck, shared 2/1 drops
     interactive, three drops, over-standard 34/30, zero positions, Portuguese words + `dropLabel`.
   - Commit the HTML strings as a frozen fixture. After the change, the same renders with no `density` **and** with
     `density="default"` must equal them **byte for byte**. This is the CR-018 frozen-copy method.
3. **Unit tests, `tests/components/TruckDiagram.test.tsx` (existing specs unedited, new `describe("compact")`):**
   - compact spaces carry the chosen `max-sm` height class, and do **not** carry a bare
     `[[data-surface=tablet]_&]:min-h-14`; default spaces still carry `min-h-12` and `min-h-14` (the existing spec at
     `:190-198` stays as it is);
   - compact and default produce **identical accessible names** for every space (fixture SHARED, interactive);
   - the same buttons, the same `<ol start>` values and the same `role="group"` labels in both densities;
   - `taken` with a label still shows no label in compact; the warning `<p>` and both drop dividers are present in
     compact;
   - `density` never appears as a DOM attribute; an unknown value renders as default;
   - axe shows 0 violations for compact read-only, interactive, three drops and over-standard;
   - `renderToString` works with `density="compact"`; the existing server/hex guard still passes.
4. **Real browser** (the committed Edge driver, `runs/change-26/evidence/browser-proof/proof.mjs` pattern; DC's
   `playwright-core` + `tailwindcss` read-only; a scratch fixture outside the estate tree):
   - **Compact at 360 and 390 px**, each under **both** `data-surface="tablet"` (the packhouse phone) and no surface,
     in packhouse teal and DC yellow:
     - every space box's height is ≥ the chosen size and < 48 px (apart from the rows that wrap a note or a long label);
     - every space is ≥ 48 px wide;
     - `scrollWidth === innerWidth`;
     - the order is Cab, divider, positions, divider, Doors;
     - the 30-space shared truck measures well under the default (target: about two thirds of the default height);
     - axe shows 0 violations, including contrast.
   - **Compact at 768 (tablet) and 1440 px:** pixel-identical to default.
   - **Print at A4 width:** compact and default screenshots are pixel-identical.
   - **Default at 360/390/768/1440:** pixel-identical to the CR-028 frames' fixture rendered at `eefc0c8`.
   - Frames go to `runs/change-NN/evidence/frames/`.
5. **DC + CRM render check** (UX-THM-004 / QA-REG-002, the CR-015 method `runs/change-12/evidence/dc-crm-recheck.md`):
   - fresh clones in `%TEMP%`, with throwaway branches whose only diff is the kit pin set to this branch head;
   - each app's unit suite, typecheck, build and the CR-015 screenshot set, before and after.
   - Expected: suite-identical and pixel-zero. Neither app imports `TruckDiagram` (§0).
   - This also discharges the re-check CR-028 left unrun (`runs/change-26/output/known-issues.md:3`), and CR-025's and
     CR-026's, because this head contains all three. The record says so.
   - No pin moves on any app's `main`, and no estate folder is touched.
6. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`; "ANCHOR NOT FOUND" exits non-zero). Each
   mutant must turn a **named** spec red:
   - M1: the compact height is applied without `max-sm`. The 768 px pixel-identity check goes red (browser), and the
     class spec goes red (unit).
   - M2: compact keeps the bare tablet `min-h-14`. The class spec goes red.
   - M3: `density` defaults to `"compact"`. The byte-identity spec goes red.
   - M4: the default `SPACE` string is edited (one class reordered). The byte-identity spec goes red.
   - M5: `density` leaks into `...rest`. The no-attribute spec goes red.
   - M6: compact drops the position text node. The equal-names spec goes red.
7. **Other checks:**
   - `pnpm typecheck` and `pnpm audit --prod --audit-level=high`;
   - `quality-sensors.mjs`, LF-normalised;
   - `prettier --check --print-width 100` on the touched files;
   - `git diff eefc0c8 --stat -- src/` shows **only** `components/TruckDiagram.tsx`.

## 6. Existing callers checked (the additive claim)

| Caller | Why unaffected |
|---|---|
| **DC** (pins kit 0.7.0-era sha) | Does not import `TruckDiagram` (grep, §0), and its pin predates it. The kit's other files do not change. Re-checked anyway (§5.5) |
| **CRM** | Same: no importer. Re-checked anyway (§5.5) |
| **RMS, Org Admin, Hub, Manga Verde** | No importer (same grep). They gain the prop only when they move their pin |
| **Packhouse** | Its `main` does not import it yet. The M-01 branch's existing call has no `density`, so it renders byte-identically (§5.2) until M-01 opts in, after pinning this change's **merged** sha |
| Kit tests | All pass **unedited**. No inventory line changes, because there is no new export |

The only `src/` file touched is `TruckDiagram.tsx`. No default changes, no export is added or removed, and no existing
prop changes meaning.

## 7. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/TruckDiagram.tsx` | The `density` prop, five compact strings, passing `density` to `Section`/`SpaceBody`, and the header bullet | 40 (A) / 50 (B) |
| `README.md` | Changelog 0.12.0, plus the compact paragraph and example line | 12 |
| `package.json` | `version` 0.12.0 | 1 |

Paper trail (not in the estimate):
- the new compact specs and the frozen byte-identity fixture;
- the browser fixture, proof and frames; the DC + CRM record; the mutation battery;
- the decision-log entry `CR-DESIGN-SYSTEM-029` (D-1 to D-6, with the owner's tap-size ruling);
- the refreshed handover;
- `known-issues.md`, with what the packhouse owes.

The archive goes in the slot the conductor names; never overwrite. No migration (there is no database). **No new
dependency. No consumer pin is bumped.** No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` is created
or written, here or in any sibling repo.

## 8. Cross-app intersection map

No shared data record is touched. The kit has no database and makes no call. The seams are the package hand-off and
the presentation hand-off inside the component. **The kit writes the prop. Each app reads it only when it moves its own
pin, to the MERGED sha on `main`, never a branch sha (KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | `TruckDiagram density="compact"` → **packhouse EPIC-006-M-01** loading screen (FS-10, dispatcher phone) | Kit | Packhouse M-01 | Adds the compact size the fidelity review asked for | **M-01** pins the merged sha and passes `density="compact"`. **M-01 also owns the rest of the length gap**: the "not on the truck yet" list (about 1,530 px against 250 px in the mockup), the header and the 768 px column (§1). Not done here |
| S2 | Surface attribute: app → kit | **App** (`data-surface="tablet"` on the floor shell, `ph src/app/(floor)/layout.tsx:22`) | Kit | Compact deliberately overrides the tablet height below 640 px (D-3) and leaves it alone at ≥ 640 px | None. The packhouse keeps its surface as it is |
| S3 | `truckDiagramRows` → packhouse M-02 delivery note PDF | Kit (layout) | Packhouse M-02 | **Untouched.** The note is unchanged | None |
| S4 | Tap: kit → app | Kit reports `onSlotTap(position)` | App | Same calls, same positions, smaller box | None |
| S5 | Same component → **DC, CRM, RMS, Org Admin, Manga Verde, Hub** | Kit | No importer today | Default path byte-identical (§5.2) | None |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo (glob at orientation). This is the
twenty-first change to note it, and the decision is the owner's. S1–S5 go to `known-issues.md` at build.

## Rule sites

**No business rule changes.** The change decides nothing about what may be loaded, by whom, how many or in which
order. The four packhouse rules the picture draws (the standard 30, "taken" without a number, numbered from the cab,
last drop at the cab — CR-028 Rule sites 1–4) are untouched: `truck-diagram-layout.ts` does not change.

What does change is a **design floor**, not a business rule. I list it the same way so the reviewer can check it:

- **Today:** every truck space is at least 48 px tall, and 56 px on the tablet surface.
- **After:** the same for every caller, except `density="compact"` below 640 px, which is the owner-approved size
  (40 recommended).

| Site | Change / leave | Reason |
|---|---|---|
| `src/components/TruckDiagram.tsx:82-84` `SPACE` (`min-h-12`, `[[data-surface=tablet]_&]:min-h-14`, `print:min-h-8`) | **leave** (the default entry) + **add** `SPACE_COMPACT` | The default must stay byte-identical (D-1) |
| `src/components/TruckDiagram.tsx:76` `LIST` `gap-2`, `:77-81` `DIVIDER`/`WARNING` `py-2`, `:73-74` `END_BLOCK` `py-2` | **leave** + **add** compact twins | Same |
| `src/components/TruckDiagram.tsx:126` check icon `absolute right-1 top-1` | **leave** for default; compact positions it via its own class | Same |
| `tests/components/TruckDiagram.test.tsx:190-198` "every space has the 48 px and the tablet 56 px floors" | **leave, unedited** | It pins the default, which does not change. The compact spec is new |
| `src/components/Button.tsx:12` (browser 36 / tablet 56) | leave | A different control; quoted in D-4 as the kit's smallest control |
| `src/components/ChoiceGroup.tsx:19,107` (tablet 48, UX-PRINCIPLE-006) | leave | A different control |
| `src/lib/tokens.css:151-154` (`--control-h-*` tablet) | leave | Tokens unchanged; the picture never used them |
| ph `src/app/(floor)/layout.tsx:22` `surface="tablet"` | leave (read-only repo) | The reason compact must beat the tablet rule (S2) |
| ph `runs/epic-06/milestone-01/evidence/mockup-fidelity.md:8-62` "about 48 px" | leave (read-only repo, closed-milestone evidence) | It is the trigger. It actually measured the 56 px tablet floor (§0) |

**Search terms used:**
- Kit `src/`, `README.md`, `source-documents/`: `(?i)48 ?px|min-h-12|touch floor|touch target|tap target`;
  `UX-PRINCIPLE-006|gloved`; `density|compact|size\?:\s*"`; `TableDensity\b.*=`.
- All projects' `.ts`/`.tsx` (excluding `node_modules`): `TruckDiagram|truckDiagramRows`.
- Packhouse `src/`: `data-surface`, then `surface[=:]…(tablet|browser)|<AppDocument`.
- Packhouse `runs/`, `source-documents/`: `(?i)fidelity|2\.5 times|compact|density`.
- Packhouse mockup `option-d.html`: `--sh:\d+px`, and the `.sp`/`.truck`/`.blk` rules.

## 9. Residuals and open questions

- **Owner decision:** the tap size, 40 (recommended) / 44 / 36 (D-4).
- **Owner pick:** look A (recommended) / B / C (D-2). C is A at 36. Picking C answers the size question too.
- **Owner confirm (carried in the brief as "tablets … stay exactly as they are"):** compact applies below 640 px only
  (D-3). If the owner later wants a compact tablet, that is a further additive change, because tablets sit on the
  gloved-hand floor.
- **R1 — Most of the length gap is not the kit's** (§1, S1). This change shortens the truck by roughly a third; the
  packhouse must still tighten its list, header and column in M-01. Said plainly in the brief.
- **R2 — Specificity of the tablet override.** It is designed out (D-3: the bare tablet class is not in the compact
  string), but it is proved only in a real browser (§5.4), because happy-dom applies no CSS.
- **R3 — `twMerge` could fold a compact class into a default one.** A unit test pins the final merged compact class
  string (§5.3).
- **R4 — Look B's visible order differs from the name's order** (D-2). It is WCAG-conformant but not best practice,
  which is one reason A is recommended.
- **R5 — The re-check (§5.5) can come back red on an app's `main`** for reasons outside this change. That would be
  recorded with evidence, not fixed (the CR-015 practice).
- **R6 — Version collision:** if another kit change merges 0.12.0 first, this one takes the next minor at build. That
  is a version-line edit only.
- **Standing, carried:**
  - no cross-system register;
  - no CR-008 decision-log entry;
  - 4 inert `ignoreGhsas`;
  - OQ-8;
  - the `.snap` CRLF artefact (do not stage);
  - `prettier --print-width 100`;
  - the gitleaks scan check (K-1);
  - the CR-025/026/028 mutation batteries (028's re-check is discharged here, §5.5).

## 10. After merge

- Report the **merged** `main` sha in the close-out and the handover.
- Build note for packhouse M-01:
  - pin the merged sha;
  - add `density="compact"` to the loading screen's `TruckDiagram`;
  - tighten the rest of the phone screen against the option-D mockup (S1).
- DC, CRM, RMS, Org Admin, Hub and Manga Verde see nothing until they move their own pins, and nothing changes for
  them when they do.

## 11. Not an epic

This is one optional prop on one component, with a changelog line and a version bump. It touches no service,
integration, permission model or data, and I cannot name five milestones it would decompose into.
