# CR-DESIGN-SYSTEM-020 — ExportButton gets a real download link (optional `href` + `fileName`) — Logic Plan

> Companion of **CR-MANGAVERDE-069** (Manga Verde report exports to Excel and PDF, plan approved 2026-10-20). That
> change is blocked at build until this one merges. **This was a planning session only. No feature code was written.**
> `bananaworld-dc` was only read (reads and greps). Base: `main` @ `1fefb6c` (CR-DC-247, PR #37, kit **0.4.0**).
> DC's pin, from its own `package.json:57`: `1fefb6c6038a52a96a44eae8be93472254ab7f89`.

<!-- OWNER-BRIEF-START -->

**What you'll have.** On Manga Verde's report screens, the Excel and PDF buttons will really download the file. Tap it and the file lands on the phone or computer like any other download. Today the shared button only shows a "coming soon" note. The button can also carry Manga Verde's own words, so it can read in Portuguese.

**Please confirm.**
1. The look. I recommend A: exactly like today's export button, just finger-sized on phones. B adds a different picture for Excel and PDF; C adds a small file-type tag. Both make Manga Verde's buttons look different from the warehouse app's.
2. When a report can't be downloaded yet, the button stays in place, greyed out, and can't be tapped.

**Not included.** Manga Verde's report screens and the files themselves. That is the Manga Verde change waiting on this one. The warehouse app and the other apps keep their export buttons exactly as they are today.

**Risks.** None for the other apps. Their buttons look and behave the same. The tap only saves straight to the device when the file comes from Manga Verde's own site. Manga Verde's change makes sure of that.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **No `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md` exists in this worktree** (recorded since
  CR-013). Standing rules come from the conductor's project rules, the estate `CLAUDE.md` and
  `runs/current/SESSION_HANDOVER.md`.
- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md:1`: next estate session due **2027-01-10**. Not overdue.
- **No existing plan for this CR**: a fresh plan, not a revision. No owner responses recorded. No clarify round
  used: the request is fully specified, and the one judgement left (how the link looks) is a mockup pick.
- **Read in this repo:** `src/components/ExportButton.tsx` (whole), `src/components/Button.tsx` (whole),
  `src/components/ToastProvider.tsx:26-34` (`useToast` throws outside a provider), `src/components/index.ts:134`
  (barrel line), `tests/components/DragBoard.additive.test.tsx:31` (export inventory), `tests/components/Link.additive.test.tsx`
  (frozen-copy pattern), `package.json`, `README.md` `### Changelog`, the CR-019 plan (format precedent).
- **Read in DC (read only):** `package.json:57` (pin), `:90` (`tailwindcss ^3.4`), `:100,118` (`jest-axe`, run under
  `happy-dom` `:116`); every `ExportButton` hit (§3); `src/components/crates/CrateBalanceView.tsx:105-124`;
  `tests/unit/components/ExportButton.test.tsx` (whole); `tests/unit/a11y/primitives.test.tsx:1-40,144-148`;
  `src/components/ui/README.md:297-303`.
- **Manga Verde, CRM, RMS, Org Admin: not readable from here.** The MV plan's §4.6 / §9.2 are cited from the request,
  not read. No claim is made about MV's export route.
- **No gallery or story exists in this repo** (grep `stories|gallery` over `src/ tests/ README.md`: only an unrelated
  word in `PrintPreview.tsx`). The only `ExportButton` gallery is DC's `app/design-system/_components/GallerySections.tsx:599-609`,
  which is DC's lane and read-only here. So request item (7)'s "gallery/story" is satisfied by the README usage note
  (§2.5); DC may add an `href` example to its own gallery at its own bump.

## 1. Today, exactly

`ExportButton` (`src/components/ExportButton.tsx:34-57`) is a `forwardRef<HTMLButtonElement>` wrapping
`<Button variant="secondary">`. It **always** calls `useToast()` (`:38`, which throws without a `ToastProvider`), and
its click shows the toast `"Export coming soon"` / `` `${label} for "${reportType}" wires up at EPIC-008-M005 (BI
refresh + CSV export Milestone).` `` (`:44-50`). It renders `<Download className="h-4 w-4" />` then `children ?? label`
(`:53-54`), label from `formatLabel` (`Export CSV|Excel|PDF`, `:23-32`). Props are `Omit<ButtonProps, "variant" |
"onClick">` + `format` + `reportType` (`:18-21`): callers cannot pass `onClick`, and every other button attribute is
spread onto the `<button>` (`:51`).

## 2. The design

### 2.1 Props (additive)

`ExportButtonProps` gains two optional members, documented in JSDoc:

- `href?: string` — where the file is. A **non-empty** string switches the control to the link variant. `undefined`
  **and `""`** keep today's toast path (an empty string would otherwise link to the current page; treating it as "no
  link" is the safe reading, and it is pinned by a test).
- `fileName?: string` — the suggested file name for the download. Ignored when there is no link.

No name, default, or type is removed or narrowed. `ExportFormat` is unchanged. The barrel line
(`src/components/index.ts:134`) is unchanged: same three names. The forwardRef type stays `HTMLButtonElement`
(widening it would break callers with a typed callback ref under `strictFunctionTypes`; see §2.4).

### 2.2 Structure: a dispatcher, so the toast path is untouched and no hook is conditional

`ExportButton` becomes a thin dispatcher that destructures **only** `href` and `fileName` and passes everything else
through unchanged:

1. **No usable `href`** → render a private `ExportToastButton`: **today's function body moved verbatim** (`useToast`,
   `formatLabel`, the same `<Button>` with the same props in the same order, the same toast text). `fileName` is
   destructured away so it never leaks onto the `<button>` as an attribute.
2. **`href` set and `disabled` or `inflight`** → a private `ExportUnavailableButton`: `<Button variant="secondary"
   type="button" disabled inflight={inflight} …>` with the same icon + label, **no onClick, no toast, no
   `useToast`**. An anchor cannot be disabled (CR-019 R1), so a real disabled `<button>` it is. `inflight` counts as
   unavailable too, since a busy download must not be tappable either. Caller `type` wins if given.
3. **`href` set, not disabled, not inflight** → a private `ExportDownloadLink`: `<Button variant="secondary"
   asChild …rest><a href={href} download={fileName ?? ""}>{icon}{children ?? label}</a></Button>`. **No `useToast`.**
   `asChild` is forced after the spread so a caller's own `asChild` cannot turn it off.

Why a dispatcher and not an `if (href)` inside today's body: `useToast()` must not be called conditionally (React's
hook-order rule breaks if `href` toggles between renders), and it must not be called at all on the link path, or an
app would need a `ToastProvider` just to render a link. The rendered DOM of path 1 is identical to today's: the extra
component layer produces no markup. §4 proof 1 checks that.

**`download={fileName ?? ""}` — a deliberate refinement of the request's `download={fileName}`.** With `fileName`
omitted, `download={undefined}` drops the attribute entirely, and the link becomes a plain navigation (a PDF would
open in the tab instead of saving). `download=""` keeps it a download and lets the server's name stand. Tests pin
both.

### 2.3 Look, size, touch

- **Same look as today** (option A, recommended): `variant="secondary"`, the same `Download` icon (`h-4 w-4`), the same
  label. `Button`'s classes apply to the `<a>` through Radix `Slot` (the pattern `Button.tsx:17-18` documents), so
  hover, focus ring (`focus-visible:shadow-focus`) and the tablet sizing (`[[data-surface=tablet]_&]:h-14`, 56 px)
  carry over unchanged.
- **Touch target ≥ 44 px (request item 6).** The browser size is `h-9` (36 px). Paths 2 and 3 only add
  `[@media(pointer:coarse)]:min-h-11` (44 px; `min-height` beats `height` when larger). This is a Tailwind 3.2+
  arbitrary variant; DC is on `tailwindcss ^3.4` (`package.json:90`); Manga Verde's version is checked by its own
  change. **Path 1 gets no new class.** Today's 36 px on a phone is DC's existing look, and changing it would break
  byte-identity. It is recorded as R3, not fixed here.
- `no-underline` is added on path 3 only if the browser proof shows an inherited underline from an app's base link
  style (Tailwind preflight already removes it; decide on evidence, not in advance).

### 2.4 Keyboard, screen reader, ref

- Path 3 is a real `<a href download>`: in the tab order, activated by **Enter** (native link behaviour; Space does
  not activate links, by platform convention, and that is not overridden). Screen readers announce "link, Export
  Excel" (or the app's words). The `lucide-react` icon is `aria-hidden` by default (verified at build in the rendered
  markup; if not, `aria-hidden="true"` is added on the link paths only).
- Path 2 is a native disabled `<button>`: out of the tab order and announced as dimmed/unavailable. `Button.tsx:15`
  says a disabled button carries a tooltip as the consumer's responsibility; the README note repeats that for MV.
- **Ref:** passed through on paths 1 and 2 (they are `HTMLButtonElement`s). **Not attached on path 3**, because an
  `<a>` is not an `HTMLButtonElement` and the public ref type must not lie or widen. Documented in the JSDoc; no
  caller passes `href` today, so nobody loses a ref. A later change can add an anchor ref additively if needed.
- No `onClick` is accepted (unchanged `Omit`), so the link path cannot intercept the click: the browser does the
  download.

### 2.5 README

- `### Changelog` **0.5.0** (additive minor): "`ExportButton` accepts optional `href` and `fileName`. With a link it
  renders a plain browser download (`<a download>`); with a link and `disabled`/`inflight`, a disabled button. Without
  a link it renders exactly as before (the 'coming soon' toast). No export, default or existing prop changed."
- A short `## Export button download link` usage note (5–8 lines): the three cases, `children` for translated words,
  `download` works as a save only for same-origin URLs or a server reply with `Content-Disposition: attachment`, a
  disabled one needs the app's tooltip, the ref is not attached on the link. This stands in for a gallery/story
  (§0).
- The stale JSDoc on `ExportButton.tsx:8-15` ("will accept a `downloadUrl` / `fetchUrl` prop") is rewritten to
  describe `href`/`fileName`. Comment only.

### 2.6 No network call (TECH-COMP-003, request item 5)

The kit renders a link; the browser fetches the file. No `fetch`, `XMLHttpRequest`, `window.location` or
`URL.createObjectURL` is introduced. A test spies on `globalThis.fetch` across a click on the link and asserts zero
calls; the build greps `ExportButton.tsx` for those names (expected: 0 hits).

## 3. Existing callers checked (the additive claim)

All callers below pass **no `href`**, so they take path 1, which is today's body moved verbatim.

| Caller | Shape | Why unaffected |
|---|---|---|
| DC `src/components/crates/CrateBalanceView.tsx:117` | `format="csv" reportType="crate-balance"` | No `href` → path 1, byte-identical; toast unchanged |
| DC `app/design-system/_components/GallerySections.tsx:607-609` | csv / excel / pdf, no `href` | Same |
| DC `tests/unit/components/ExportButton.test.tsx:9,18` | csv; pdf with children | Same; `getByRole("button")` still matches |
| DC `tests/unit/a11y/primitives.test.tsx:148` | csv inside `ToastProvider` | Same DOM, so the axe result is unchanged |
| DC `src/components/ui/index.ts:122-123` | re-exports `ExportButton`, `ExportButtonProps` | The type gains two optional members; nothing DC passes conflicts (`href`/`fileName` are not `ButtonHTMLAttributes` members) |
| DC `src/components/ui/README.md:297-303` | docs | Still true for DC's usage; DC may update it in its own lane |
| Kit internal | none (grep: only the barrel and the inventory test) | — |
| Kit `tests/components/DragBoard.additive.test.tsx:31` | export-name inventory | No name added or removed; stays green unedited |
| CRM, RMS, Org Admin, Manga Verde | not readable | Any caller there passes no `href` today (the prop does not exist), so path 1 applies by construction |

## 4. The proof (to be done at build, NOT claimed now)

1. **Byte-identity harness** `tests/components/ExportButton.additive.test.tsx` + fixture
   `tests/components/fixtures/ExportButton.frozen-1fefb6c.tsx` (a frozen copy of today's file, the CR-018 `Link`
   pattern). Live vs frozen, both inside `ToastProvider`, over `format` (3) × `children` (none / string / element) ×
   `disabled` (omitted / true / false) × `inflight` (omitted / true / false) × `size` (3) × `block` (2) ×
   `className` / `aria-label` / `type` present or not, **plus `href={undefined}`, `href=""` and `fileName` without
   `href`**. Assert identical `outerHTML`. Then click each enabled one and assert the toast's title and description
   text are identical.
2. **Behaviour tests** `tests/components/ExportButton.test.tsx` (happy-dom, `@testing-library/user-event`):
   - `href` + `fileName` → `getByRole("link")`, `href` and `download === fileName`; no `button` role.
   - `href` without `fileName` → `download` attribute present and empty.
   - `children` override the label on the link (and on the disabled button); default label per format otherwise.
   - `href` + `disabled` → a disabled `button`, **no** `a` in the container; click → no toast, no navigation.
   - `href` + `inflight` (with and without `disabled={false}`) → same as above, `aria-busy="true"`.
   - Link path renders **without** a `ToastProvider` (no throw); toast path still throws without one (today's
     behaviour, pinned).
   - Link path carries `[@media(pointer:coarse)]:min-h-11` and the secondary classes; path 1 does not carry the new
     class.
   - Click on the link → `fetch` spy called 0 times; no toast shown.
   - Keyboard: Tab focuses the link; it is the active element.
   - **No `href` → today's toast** with today's exact text (this is the DC pin).
3. **axe**: the kit has no axe today. Add **`axe-core` as a devDependency** (zero runtime deps; DC already runs axe
   under `happy-dom` via `jest-axe`, `package.json:100,116,118`, so the environment is proven). `axe.run` on the
   link, the disabled button and the toast button: 0 violations. DevDependencies do not reach consumers (git
   dependency, `files: ["src"]`, no `prepare` script). The lockfile changes; `pnpm install --frozen-lockfile` and
   `pnpm audit --prod --audit-level=high` must both stay green. **Pre-declared fallback** if `axe-core` cannot run
   under this repo's `happy-dom` 20: the axe check runs in the real-browser proof (item 6) only, recorded as a
   deviation, and no devDependency is added.
4. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`, "ANCHOR NOT FOUND" exits non-zero):
   `download={fileName}` (drops the empty attribute); link branch taken when disabled; `href` leaked onto path 1;
   `fileName` leaked onto path 1; `href === ""` taken as a link; `useToast` called on the link path; touch class
   removed; label ignoring `children`. Each mutant must turn a test red.
5. Re-measure the baseline first (handover: 531 tests / 26 files at CR-019; re-check at `1fefb6c`), then `pnpm test`,
   `pnpm typecheck`, `pnpm audit --prod --audit-level=high`, `quality-sensors.mjs` (LF-normalised),
   `prettier --check --print-width 100` on touched files.
6. **Real-browser check** (committed Edge driver, `runs/change-10/evidence/browser-proof/proof.mjs` pattern, DC's
   `playwright-core` + `tailwindcss` read-only, scratch fixture outside the estate tree): a same-origin fixture file;
   mouse click and **Tab + Enter** each produce one download whose suggested name is `fileName`; disabled variant
   produces none; touch emulation (390×844, `hasTouch`, coarse pointer) → link box height ≥ 44 px; tablet surface →
   56 px; axe-core in the page → 0 violations; frames to `runs/change-NN/evidence/frames/`.

## 5. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/ExportButton.tsx` | two optional props + JSDoc; dispatcher; today's body moved verbatim into `ExportToastButton`; `ExportUnavailableButton`; `ExportDownloadLink`; JSDoc header rewritten | +70 / −8 |
| `README.md` | Changelog **0.5.0**; usage note | 15 |
| `package.json` | `version` 0.4.0 → **0.5.0** (additive minor); `axe-core` devDependency | 2 |
| `pnpm-lock.yaml` | generated by `pnpm add -D axe-core` | generated |

Paper trail (not in the estimate): the two test files + fixture, the mutation battery, browser-proof frames, the
decision-log entry `CR-DESIGN-SYSTEM-020`, the handover / active-milestone refresh, `known-issues.md` (R1–R4, the §6
owed bumps). The archive goes in the slot the conductor names (never overwrite; handover item 13). No migration (no
database). No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` is created or written. **No consumer pin
is bumped by this change.** No other component is touched (`Button.tsx` is used, not edited).

## 6. Cross-app intersection map

No shared data record is touched. The seams are the package hand-off to each consumer, plus the file hand-off
between Manga Verde's server and the browser. **The kit writes the control. Each app reads it only when it moves its
own pin, to the MERGED sha on `main`, never a branch sha (KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | Kit `ExportButton` → **Manga Verde** | Kit | Manga Verde | Adds the link variant MV's approved plan (§4.6 / §9.2) requires | **CR-MANGAVERDE-069** moves MV's pin `1fefb6c6` → the merged sha reported at close. Not done here |
| S2 | MV export route → browser | MV server (writes the file) | Browser (saves it) | The kit only renders `<a href download>`; it never fetches | MV's change: the URL is same-origin **or** answers `Content-Disposition: attachment` with a filename, and enforces its own permission check server-side (the kit does no permission logic, TECH-COMP-003 / ADR-001) |
| S3 | Kit → **DC** (pin `1fefb6c6`) | Kit | DC | 4 call sites + 2 tests, all no `href` → unchanged (§3) | **Not moved by this change.** DC bumps when it chooses; nothing to do on its side |
| S4 | Kit → **CRM, RMS, Org Admin** | Kit | Each app | No `href` exists in their code yet → unchanged | Nothing owed; they get it at their next bump |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo (fourteenth change to note it; the
decision is the owner's). S1–S4 go to `known-issues.md` at build.

## Rule sites

**No business rule changes.** This change adds a presentational variant (a link instead of a toast). It does not
change what may be exported, when, by whom, or how much. Who may export a Manga Verde report is MV's server rule, in
MV's change. The one architectural rule nearby, "the kit makes no network call" (TECH-COMP-003), is **kept**, not
changed (§2.6).

For transparency, the places that spell today's "export is a toast stub" behaviour:

| Site | Change / leave | Reason |
|---|---|---|
| `src/components/ExportButton.tsx:8-15` (JSDoc "wires at EPIC-008-M005… will accept a `downloadUrl`") | change (comment) | Now describes `href` / `fileName` |
| `src/components/ExportButton.tsx:44-50` (toast text) | **leave** (moved verbatim) | Byte-identity for every no-`href` caller |
| DC `src/components/crates/CrateBalanceView.tsx:7` ("Export wires at EPIC-008-M005 (ExportButton stub)") | leave (read-only repo) | Still true for DC, which passes no link |
| DC `app/design-system/_components/GallerySections.tsx:599` ("ExportButton is shell-only at M006") | leave (read-only repo) | Still true for DC's usage; DC's to update |
| DC `src/components/ui/README.md:301` ("shell — onClick shows a Toast") | leave (read-only repo) | Same |
| DC `tests/unit/components/ExportButton.test.tsx` | leave (read-only repo) | Stays green (§3) |

**Search terms used:** `ExportButton` (kit excluding `runs/`; DC excluding `node_modules`, `.next`, `runs`);
`EPIC-008-M005|Export coming soon|downloadUrl|fetchUrl` (kit `src/`); `stories|gallery|Gallery` (kit `src/ tests/
README.md`); `\[@media|pointer-coarse|coarse` (kit `src/`: 0 hits, so the touch variant is new to the kit);
`useToast|throw` (`ToastProvider.tsx`); `axe` (kit: no test uses it).

## 7. Mockup options (`runs/current/mockups/CR-DESIGN-SYSTEM-020/`)

All three download the same way and look identical on the toast path (DC). They differ only in how the **link**
version looks.

- **A — same as today's export button (recommended).** Icon + words, secondary style, 44 px on touch, greyed when not
  ready. No new visual element. Manga Verde's buttons match every other export button in the estate.
- **B — a different icon per file type** (sheet for Excel, page for PDF, on the link variant only). Clearer at a
  glance, but MV's buttons then differ from DC's (which keep the plain download icon), and it adds a per-format icon
  map to the kit. A consistent version would have to change DC's look too, which the lane rule forbids.
- **C — a small file-type tag** ("XLSX", "PDF") after the words. Same inconsistency as B, plus a second text element
  that screen readers announce and that apps would need to translate or hide.

## 8. Residuals and open questions

- **R1 — `download` is a hint.** Browsers ignore it for cross-origin URLs (they navigate instead), and a server reply
  with `Content-Disposition: inline` can still open in the tab. MV's change owns the route (S2). The README note says
  so.
- **R2 — link path has no ref.** Deliberate (§2.4); recorded.
- **R3 — today's no-link export button is 36 px on a touch phone.** Unchanged, to keep DC byte-identical. A touch
  bump for every caller would be a separate change with its own DC re-check.
- **R4 — Space does not activate a link.** Native behaviour, kept; screen-reader users hear "link" and use Enter.
- **Owner confirm 1:** the look (A recommended). **Owner confirm 2:** "not ready" shows a greyed button, not a hidden
  one (request item 3; MV decides *when* it is not ready).
- Standing, carried: no cross-system register; no CR-008 decision-log entry; 4 inert `ignoreGhsas`; OQ-8; the `.snap`
  CRLF artefact (do not stage).

## 9. After merge

Report the **merged** `main` sha in the close-out and the handover. CR-MANGAVERDE-069 moves MV's pin from `1fefb6c6`
to it. DC's pin is not moved. `package.json` says `0.5.0`.

## 10. Not an epic

One component file, one changelog entry, one version line, one devDependency. I cannot name five milestones it
decomposes into. MV's adoption is MV's own change, not a milestone of this one.
