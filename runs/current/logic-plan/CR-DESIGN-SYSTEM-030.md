# CR-DESIGN-SYSTEM-030 — a print panel that lives inside a slide-out (`PrintPreviewPanel`) — Logic Plan

> Raised by owner ruling 2026-11-08, for packhouse EPIC-006-M-02 (delivery note) and M-03 (Farm Crate Note).
> **This was a planning session only. No feature code was written.** `bananaworld-dc`, `bananaworld-ph` and the other
> apps were only read. Base: `main` @ `d8309b5` (CR-DESIGN-SYSTEM-029, PR #47, kit **0.12.0**). Branch
> `change/cr-design-system-030`.

<!-- OWNER-BRIEF-START -->

**What you'll get.** The packhouse can show a delivery note or a Farm Crate Note inside the slide-out it already uses, on a floor tablet or an office computer, in English or Portuguese. There are two buttons, Print and Download. Nothing ever opens in a new window or tab.

If the packhouse refuses a print, for example because the note is out of date, nothing opens. If a device cannot show the note, it says so, and Print saves the file instead so the device can print it.

**Please decide.** Pick a layout:
- **A (recommended):** the note first, the two buttons underneath.
- **B:** the buttons on top, the note underneath.
- **C:** one big Print, with Download as a small line below.

**Not included.** Switching the packhouse screens over, which the packhouse does next. The print screen the other apps have today stays exactly as it is.

**Risks.** We can prove the print window is asked for, but not that paper comes out. A real office printer and the real floor tablets still have to be checked during the packhouse work.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **Role:** planner. **Compliance heartbeat:** next estate session due **2027-01-10**. Not overdue.
- **This worktree has no `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md`** (the standing finding since
  CR-013). The rules come from the conductor's project rules, the estate `CLAUDE.md` and `runs/current/SESSION_HANDOVER.md`.
- **First plan, not a revision.** No owner responses are recorded.
- **No clarify round used** (3 remain). The request settles scope, behaviour at the edges and what is out. The one open
  thing is presentation, and it goes to the owner as a pick (brief b).
- **Read in this repo:** `src/components/PrintPreview.tsx` (whole), `SlideOver.tsx`, `Sheet.tsx`, `Button.tsx`,
  `ExportButton.tsx`, `src/components/index.ts:125-154`, `tests/components/DragBoard.additive.test.tsx:1-140`,
  `src/lib/tokens.css` colour tokens, `quality-sensors.json`, `package.json`, `README.md:1-80`, the CR-029 plan and
  estimate, `runs/change-26/output/defect-log.md:8`, `runs/change-27/output/known-issues.md`.
- **Read in `bananaworld-ph` (read only):** `runs/current/logic-plan/EPIC-006-M-02.md` (summary, owner questions Q1-Q5,
  the floor and office flows, the §6.2 kit API, the findings list); `tailwind.config.ts`; `package.json`.
  ⚠ **That plan was being edited while this session read it:** §6.2 moved about 26 lines between two reads, so it is cited
  by section, not line. The §6.2 API text was the same in both reads. The build must re-read §6.2 and report any drift.
- **Search caveat:** a search from the estate-level `projects/` folder returned nothing, even for a hit that a search
  inside `bananaworld-dc` then found. The callers in §6 were therefore searched **one project at a time**.
- 🔴 **The kit has no Storybook** (no `*.stories.*` anywhere under `src/`). The request's "stories" are met the way
  CR-028 §4 and CR-029 §4 met them: a README section and the browser-proof fixture page (D-11).

## 1. What exists today, and why it cannot serve

`PrintPreview` (`src/components/PrintPreview.tsx`):

| Problem for the packhouse | Where |
|---|---|
| It is a `Modal` (click-to-dismiss pop-ups are prohibited, packhouse PRD-NFR-005) | `:189-191` |
| Closed list of two DC formats | `:42` |
| Fixed English words | `:115`, `:133`, `:183`, `:217`, `:224` |
| No Download | `:211-226` |
| Its `pdfUrl` path opens a new tab | `:171` |

It stays exactly as it is. It is not touched, wrapped or refactored (D-1).

## 2. Decisions taken here (the chassis is mine; each goes in the decision log at build)

### D-1 — One new file, one new export, nothing shared with `PrintPreview`

- New `src/components/PrintPreviewPanel.tsx`. Barrel gains `PrintPreviewPanel`, `type PrintPreviewPanelProps` and
  `type PrintPreviewPanelWords`.
- **No extraction of common code from `PrintPreview`.** The two share only "an iframe in a box". Extracting would edit a
  file every existing caller runs, for no gain. `git diff d8309b5 -- src/components/PrintPreview.tsx` must be empty.
- The kit makes no network call: all file access is through the caller's three functions (TECH-COMP-003).

### D-2 — Props: exactly the proposed API, plus nothing

```ts
export interface PrintPreviewPanelWords {
  readonly print: string;
  readonly download: string;
  readonly noViewer: string;
  readonly loading: string;
  readonly failed: string;
}

export interface PrintPreviewPanelProps {
  /** The preview file. Called once on mount; not called when the device has no PDF viewer. */
  readonly load: () => Promise<Blob>;
  /** Records the print and returns the final file. `null` = refused: the panel opens nothing. */
  readonly print: () => Promise<Blob | null>;
  /** Records the print and returns the final file. `null` = refused: the panel saves nothing. */
  readonly download: () => Promise<Blob | null>;
  /** The saved file's name; also the preview frame's accessible title. */
  readonly fileName: string;
  /** Every visible word; the caller supplies them in the screen's language. No defaults. */
  readonly words: PrintPreviewPanelWords;
}
```

- **`fileName` doubles as the iframe `title`** (axe `frame-title`). A sixth word would widen the packhouse's agreed API
  (§6.2) for no visible gain.
- No `className`, no `...rest`, no surface prop. The host wraps it, and the kit `Button` already reads `data-surface`.
- The blobs must be typed `application/pdf`. This is the caller's contract, stated in the JSDoc and the README. The panel
  does not rewrite them.

### D-3 — Lifecycle: one load, no stale results, no leaked files

- **`load()` runs once per mount**, from a mount-only effect. The three callbacks and `fileName` are read through a
  latest-value ref, so a parent's inline arrow function does not refetch on every render. The host's Sheet or SlideOver
  unmounts the body on close, so reopening starts fresh.
- A per-effect `cancelled` flag drops a result that arrives after unmount, and a slow preview that arrives after Print
  never overwrites the final file.
- **Every object URL is revoked** when replaced or on unmount, and never straight after a save starts (Firefox and Safari
  can cancel the save).

### D-4 — Print with a viewer

1. A press calls `print()` once. `null` → nothing happens: no message, no navigation, the buttons re-enable.
2. A blob → object URL, the print is **armed** (a ref), and the preview iframe remounts on the new URL (`key={url}`).
   **The key is deliberate:** changing an existing iframe's `src` adds a browser-history entry, and Back would then step
   through iframes instead of leaving the screen.
3. `onLoad`: only when armed, disarm, focus the frame, call `iframe.contentWindow.print()`, then return focus to the Print
   button. The panel lives in a Radix focus trap, and focus left inside a PDF frame would stop Escape reaching Radix.
   A preview's own `onLoad` never prints, because it is not armed.
4. `contentWindow.print()` throwing shows `words.failed` (D-7). The user can press Download. The print was already
   recorded, and a reprint writes nothing in the packhouse.

### D-5 — Print with no viewer, per the ruling

- **No viewer means strictly `navigator.pdfViewerEnabled === false`.** `undefined` (older browsers) counts as having one.
- It is read in the mount effect, not during render, because the component is server-rendered and `navigator` does not
  exist there. The first paint is `words.loading` with both buttons disabled, identical on server and client.
- No viewer: the preview area shows `words.noViewer`, **`load()` is not called** (no one could see the result), and the
  iframe never renders.
- **Print still calls `print()`, never `download()`.** It then saves the returned file exactly as Download does. The caller
  records what the person pressed. The packhouse counts either as printed (EPIC-006-M-02 Q5), so nothing is lost.

### D-6 — Download

`download()` once. `null` → nothing. A blob → a temporary `<a href=objectUrl download=fileName>` with **no `target`**,
appended inside the panel root, clicked and removed. The preview is untouched. No `window.open` exists in the file, and a
guard spec reads the source to keep it so.

### D-7 — Busy, double taps, failures

- **A synchronous in-flight ref** is the double-tap guard, because React state is too late for a second tap on the same
  frame and each call may write a record. The pressed button gets `inflight`, the other `disabled`.
- **Failures:** `load()` rejecting shows `words.failed` in the preview area. `print()` / `download()` rejecting, or
  `contentWindow.print()` throwing, shows `words.failed` as an inline `<p role="alert">` above the buttons, cleared on the
  next press.
- **A failed preview does not block Print or Download:** the final file comes from its own call and is shown when it
  arrives. Failure wording is one line, as the five-word API implies. No retry button: closing and reopening remounts.
- **`null` is not a failure.** The caller explains a refusal in its own host (S2).
- Status text: `words.loading` is `role="status"`, and the preview box carries `aria-busy` while loading.

### D-8 — Layout and tokens

- Root `flex min-w-0 flex-col gap-3`. The iframe is `block h-full w-full`. Preview box `h-[60vh]`, the `PrintPreview.tsx:199`
  height; with no viewer it shrinks to the message (`h-auto`).
- **Phones:** the two buttons split the width equally (below `sm`). **From `sm` up:** right-aligned, except Option C.
- **Sizes:** the kit `Button` gives 56 px on `data-surface="tablet"` and 36 px in the browser. Coarse-pointer browsers get
  the `ExportButton.tsx:44` 44 px floor.
- **Tokens only:** `bg-surface-sunken`, `border-border`, `text-fg-muted`, `text-danger-fg`. Icons are `lucide-react`
  (`Printer`, `Download`), already a dependency. `text-foreground-muted` (`PrintPreview.tsx:206`) is **not** a token and is
  not copied; it is left where it is.
- **At 360×640 in a Sheet:** my estimate of header + title + padding + `60vh` + buttons is about 626 px, so both buttons
  should be visible without scrolling. This is an estimate, and the browser proof measures it (§5.4). If it does not fit,
  the preview height comes down.

### D-9 — The layout pick

| Option | Order | Buttons | Note |
|---|---|---|---|
| **A (recommended)** | Preview, then buttons | Download `secondary`, Print `primary`, side by side | Kit's own "actions at the bottom right" idiom; the buttons sit at thumb height on a phone |
| B | Buttons, then preview | Same | Buttons above the fold whatever the host does; the note reads second |
| C | Preview, then buttons | Print full width, Download `tertiary` under it | Hardest to miss; on a phone the second row costs 64 px of note |

The pick changes the JSX order and two class strings. Nothing else in this plan depends on it.

### D-10 — Radix

No Radix control is replaced. The body contains two kit `Button`s and an iframe. Hosts supply the Radix `Sheet` or
`SlideOver`, and with them the focus trap, Escape and scroll lock. D-4 returns focus so those keep working.

### D-11 — Stories, sensors, dependencies

- **Stories:** a README section with the Sheet and SlideOver hosting examples and the words contract, plus the proof
  fixture page (§5.4).
- **RC-04 (50-line functions):** split into a non-exported state hook, a preview-area component, a pure `saveBlob` helper
  and the render, none over 50 lines.
- **RC-05 (`index.ts` is exactly 300 lines by the sensor's count, and over 300 is a finding):** adding one export line
  needs one line folded, as CR-028 did (`runs/change-26/output/defect-log.md:8`). Comment text only; no export moves.
- `"use client"` as in every interactive kit file. No new dependency.

## 3. Barrel, version, README

- **`src/components/index.ts`:** one export line for the three names, one comment line folded (D-11).
- **`tests/components/DragBoard.additive.test.tsx`:** one line under `ADDED_SINCE_011` with the CR id (+1 comment). This
  inventory is what holds "added exactly this and nothing else".
- **`package.json`:** `version` **0.12.0 → 0.13.0** (additive minor).
- **`README.md`:** Changelog **0.13.0** and a "Print panel" section (D-11).

## 4. Why this is additive

A new file and a new name. No existing prop, default, class string or export changes. A consumer that does not import
`PrintPreviewPanel` runs no new code.

## 5. Proof (to be done at build, NOT claimed now)

1. **Re-measure the baseline first** at `d8309b5` (the handover records 782/782). Use
   `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=60000`.
2. **Additive proof:** `git diff d8309b5 --stat -- src/` lists only `components/PrintPreviewPanel.tsx` and
   `components/index.ts`, and the `index.ts` diff is one added export and one folded comment. Every other kit test passes
   unedited apart from the one inventory line.
3. **Unit tests, new `tests/components/PrintPreviewPanel.test.tsx`** (happy-dom; `createObjectURL`, `pdfViewerEnabled` and
   `contentWindow.print` stubbed):
   - loading shows `words.loading`; the preview shows the blob; the iframe title is `fileName`; `load` runs once across
     re-renders with new inline callbacks;
   - `load` rejects: `words.failed`, and Print still works;
   - Print: `print()` once, frame remounts on the new URL, one `contentWindow.print()` on its `onLoad`; **the preview's own
     `onLoad` never prints**;
   - `print()` → `null`: no remount, no print, no save, no message, buttons re-enable;
   - `download()` → `null`: no save;
   - rejections and a throwing `contentWindow.print()`: `words.failed` in an alert, cleared by the next press;
   - two presses in the same tick: **one** call. Print while Download is in flight: disabled;
   - `pdfViewerEnabled === false`: `words.noViewer`, `load` never called, no iframe; Print calls `print()` once and
     `download()` never, and saves as `fileName`; `undefined` behaves as a viewer;
   - save: `a.download === fileName`, no `target`;
   - unmount mid-call: no print, no save, every URL revoked;
   - `window.open` is never called in any path; a source-reading guard finds no `window.open`, `_blank` or hex colour;
   - all words come from the prop (no English literal in the file);
   - `renderToString` works and shows `words.loading`, with no `navigator` access during render;
   - axe 0 violations in each state, inside a real `Sheet` and a real `SlideOver`.
4. **Real browser** (the committed Edge driver pattern, `runs/change-26/evidence/browser-proof/proof.mjs`; a scratch
   fixture outside the estate tree), hosted in a real `Sheet` and a real `SlideOver`, at **360, 390, 768 and 1440 px**, on
   both `data-surface="tablet"` and browser, in packhouse teal and DC yellow:
   - `scrollWidth === innerWidth`, no `popup` event and no new page in any path, `window.open` spy at 0;
   - the panel fits inside the host; at 360×640 both buttons are in view;
   - a real save has the suggested file name;
   - **Print:** on an HTML-typed blob a frame init script counts one `print()` call. On a real PDF blob, a smoke test checks
     nothing throws and no window opens. Whether the print dialog really appears on a real PDF is the manual check in S1;
   - Back after a Print leaves the screen in one step (D-4);
   - axe 0 violations including contrast; frames to `runs/change-NN/evidence/frames/`.
5. **DC + CRM render check, required by this request** (the CR-015 method, `runs/change-12/evidence/dc-crm-recheck.md`):
   fresh clones in `%TEMP%`, throwaway branch with only the kit pin moved to this branch head, each app's unit suite,
   typecheck, build and screenshot set, before and after. Expected: suite-identical and pixel-zero, including DC's
   `/design-system` gallery print section and its `PrintPreview` unit test. No app's `main` pin moves. No estate folder is
   touched.
6. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`; "ANCHOR NOT FOUND" exits non-zero), each mutant
   turning a **named** spec red: the preview's load prints; `null` still prints; `null` still saves; no-viewer Print calls
   `download()`; no-viewer still calls `load()`; `=== false` becomes `!`; the in-flight ref removed; the URL not revoked;
   `target="_blank"` added; `load` in the effect's dependencies; the iframe `key` removed.
7. **Other checks:** `pnpm typecheck`, `pnpm audit --prod --audit-level=high`, `quality-sensors.mjs` LF-normalised, and
   `prettier --check --print-width 100` on the touched files.

## 6. Existing callers checked (the additive claim)

Each searched separately for `\bPrintPreview\b` (§0 caveat).

| Caller | What was found | Why unaffected |
|---|---|---|
| **DC** (pin `5c14f37`) | `app/design-system/_components/GallerySections.tsx:55,707` (the gallery's `pdfUrl` demo); barrel re-export `src/components/ui/index.ts:130-131`, named items only | `PrintPreview.tsx` does not change. The new name does not reach DC's barrel unless DC adds it. Re-checked anyway (§5.5). `GallerySections.tsx:716` mentions other consumers, but `<PrintPreview` appears nowhere else in `app/` or `src/` |
| **CRM** (pin `54597ac`) | None | Re-checked anyway (§5.5) |
| **RMS, Org Admin** | None in `src/` | They see nothing unless they import it |
| **Hub, Manga Verde** | None | Same |
| **Packhouse** (pin `d8309b5`) | None in `src/` | It adopts the panel in its own M-02 after pinning the merged sha |
| Kit tests | Export inventory pinned | One declared line added (§3); every other test unedited |

## 7. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/PrintPreviewPanel.tsx` | New | 150 |
| `src/components/index.ts` | One export, one comment folded | 2 |
| `README.md` | Changelog + "Print panel" | 28 |
| `package.json` | `version` 0.13.0 | 1 |

Paper trail (not in the estimate): the new spec file; the one inventory line; the browser fixture, proof and frames; the
DC + CRM record; the mutation battery; decision-log entry `CR-DESIGN-SYSTEM-030` (D-1 to D-11 and the owner's pick); the
refreshed handover; `known-issues.md`. The archive goes in the slot the conductor names. No migration. No new dependency.
**No consumer pin is bumped.** No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` is created or written.

## 8. Cross-app intersection map

No shared data record is touched: the kit has no database and makes no call. The seams are the package hand-off and the
contract between the panel and its caller. **The kit writes the panel. Each app reads it only when it moves its own pin,
to the MERGED sha on `main`, never a branch sha (KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | `PrintPreviewPanel` → packhouse M-02 floor `Sheet` (FS-11) and office `NotePanel` `SlideOver`; later M-03 | Kit | Packhouse | New export, matching EPIC-006-M-02 §6.2 | **M-02** pins the merged sha, supplies EN + PT words, and does the manual real-printer check (its Gate D, QA-UAT-002, OQ-10) |
| S2 | "May this print happen?" | **Caller** decides; returns `Blob` or `null` | Kit obeys | On `null` the panel opens nothing and says nothing | **M-02's host** says why (its plan §10 "the panel says so" must be read as its own `NotePanel` / `Sheet`, not the kit) |
| S3 | "What counts as printed" | **Caller** records inside `print()` / `download()` | Kit calls each exactly once per press | One call per press (D-7) | None |
| S4 | No-viewer Print → which callback | Kit calls `print()`, saves the result | Caller | D-5 | M-02 expects `print()` in that path |
| S5 | Browser security policy on the host page | **App** | Kit needs `blob:` frames | Packhouse sets no policy today (`next.config.ts` searched) | Any app adding a Content-Security-Policy must allow `frame-src blob:` or the preview goes blank. DC's `X-Frame-Options: DENY` does not apply to `blob:` frames |
| S6 | Blob type | **Caller** returns `application/pdf` | Kit | Contract in JSDoc and README | M-02 route handlers set the type |
| S7 | Existing `PrintPreview` → DC gallery | Kit | DC | **Untouched** | None |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo (glob at orientation), so S1-S7 go to
`known-issues.md` at build. Whether to create the register stays the owner's call.

## Rule sites

**No business rule changes.** The rules about when a note may print, what counts as printed and how a reprint behaves are
the packhouse's (EPIC-006-M-02 Q2, Q5, §4); the kit only obeys `null` (S2).

One presentation constraint is new, so I list it the same way: **this panel never opens a window or tab**. Today the kit
has one such opener; after this change it has the same one.

| Site | Change / leave | Reason |
|---|---|---|
| `src/components/PrintPreview.tsx:171` `window.open(state.signedUrl, "_blank", "noopener")` | **leave** | Must stay byte-identical for DC; the new panel is the path that forbids it |
| `src/components/ExportButton.tsx:105-106` `<a href download>` | **leave** | A plain download link, no window; the save pattern D-6 follows |
| `src/components/PrintPreviewPanel.tsx` (new) | **add** | No opener; guarded by a source-reading spec (§5.3) |

**Search terms used:**
- Kit `src/`, `tests/`: `window\.open|createObjectURL|revokeObjectURL|contentWindow|pdfViewerEnabled|surface-sunken|foreground-muted|\.download\b|download=`.
- Kit all except `runs/`: `PrintPreview`.
- Each of DC (`app/`, `src/`), CRM, RMS (`src/`), Org Admin (`src/`), Hub, Manga Verde and packhouse (`src/`): `\bPrintPreview\b`.
- Packhouse `src/`, `next.config.ts`, and its code and config files: `Content-Security-Policy|frame-src|object-src|frame-ancestors|X-Frame-Options`. DC `next.config.*` likewise.
- Packhouse EPIC-006-M-02 plan: `6\.2|PrintPreviewPanel|pdfViewerEnabled|noViewer`, `(?i)download|OQ-10|UX-DOC-003|PRD-NFR-005`.

## 9. Residuals and open questions

- **Owner pick:** layout A (recommended) / B / C (D-9).
- **R1 — Paper is unproven here.** No automated proof can show paper coming out, or a real print dialog on a real PDF
  (§5.4). Packhouse Gate D and QA-UAT-002 carry it. The brief says so.
- **R2 — Browser timing.** `contentWindow.print()` on a just-loaded PDF is the approach the request names and is commonly
  used, but viewers differ. If a real office browser prints blank at M-02's check, the likely remedy is a short delay
  inside `onLoad`, a one-line kit change. Not added now, because nothing shows it is needed.
- **R3 — Safari and iPad.** iOS may show only part of a PDF in a frame and may ask before printing. The packhouse plan
  expects Android on the floor (its device-reality step), so this is not on the critical path, and no iOS device is tested.
- **R4 — A save after an `await`** has no fresh user gesture. Chromium, Edge and Firefox allow it; Safari may ask. The
  browser proof covers Edge only.
- **R5 — The re-check (§5.5) can come back red on an app's `main`** for reasons outside this change. That would be
  recorded with evidence, not fixed (the CR-015 practice).
- **R6 — Version collision:** if another kit change merges 0.13.0 first, this one takes the next minor at build.
- **R7 — CR-029's "no importer anywhere" grep** may have run from the estate folder, where search returned nothing here.
  It does not affect this change. A per-project grep for `TruckDiagram` at build settles it.
- **Standing, carried:** no cross-system register; no CR-008 decision-log entry; 4 inert `ignoreGhsas`; OQ-8; the `.snap`
  CRLF artefact (do not stage); `prettier --print-width 100`; the gitleaks scan check (K-1); the CR-025/026/028/029
  re-checks and batteries (this change's §5.5 re-check covers the same head and the record says so).

## 10. After merge

- Report the **merged** `main` sha in the close-out and the handover.
- Build note for packhouse M-02: pin the merged sha, host the panel in the floor `Sheet` and the office `SlideOver`,
  supply EN + PT words, return `application/pdf` blobs, say why on a refusal (S2), and run the real-printer check.
- DC, CRM, RMS, Org Admin, Hub and Manga Verde see nothing until they move their own pins, and nothing changes for them
  when they do.

## 11. Not an epic

One new body-only component, one barrel line, a changelog and a version bump. It touches no service, integration,
permission model or data, and I cannot name five milestones it would decompose into.
