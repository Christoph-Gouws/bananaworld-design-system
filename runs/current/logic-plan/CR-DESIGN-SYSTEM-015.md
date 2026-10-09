# CR-DESIGN-SYSTEM-015 — the packhouse colour theme (opt-in) — Logic Plan

> Raised by **Bananaworld Packhouse (`bananaworld-ph`) EPIC-001-M-02**, owner-approved 2026-10-09. The brief is §3
> "Part 1 - the kit change" of `bananaworld-ph/runs/current/logic-plan/EPIC-001-M-02.md`. **The colour was chosen there**
> (mockup gate, option **B**, packhouse teal, recorded as **DLC-DEC-054**; picture:
> `bananaworld-ph/runs/current/mockups/EPIC-001-M-02/option-b.html`). This change therefore has no mockup gate of its
> own, the CR-DESIGN-SYSTEM-008 / -011 / -014 precedent.
> **Planning session only. No feature code was written.** `bananaworld-dc` was **read only** (reads and greps).
> Base: `main` @ `cde6f4e` (CR-DESIGN-SYSTEM-014, PR #33). DC's pin, from its own `package.json:57`: `cde6f4e`.

<!-- OWNER-BRIEF-START -->

**What you'll have.** The shared look gets a teal option, in exactly the shades you picked for the packhouse. Only the packhouse app will switch it on. The warehouse and sales apps stay yellow and look exactly as they do today. Before it is accepted I take before-and-after pictures of every warehouse and sales screen and run both apps' full checks against it, and any difference stops it. That record is the proof the packhouse step will point to.

**Please confirm.**
1. To run the warehouse and sales checks, I put a temporary test copy in each app's store. It is never merged, and I delete it afterwards. Neither app moves to the new version.
2. The teal changes buttons, highlights and the outline you see when tabbing around a screen. Everything else (sizes, shapes, other colours) stays as the warehouse app has it.

**Not included.** The packhouse switching it on (that happens in the packhouse step). No new slide-out panel, because two already exist. The "error messages wait for a tap" issue is written down for a later change.

**Risks.** None to live screens. Nothing changes until an app chooses this.

**Separately:** the quarterly compliance check was due on 8 October and is now overdue.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **No `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md` exists in this worktree** (as recorded at
  CR-013). The standing rules come from the conductor's project rules, the estate `CLAUDE.md` and
  `runs/current/SESSION_HANDOVER.md`.
- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md` line 1 reads *"Next estate compliance session due:
  2026-10-08"*. Today is 2026-10-09, so it is **overdue by one day**. It is flagged in the owner brief. It does not block
  this change.
- **Read in this repo:** `package.json`, `README.md`, `src/lib/tokens.css` (whole), `vitest.config.ts`,
  `.github/workflows/ci.yml`, `runs/current/active-milestone.md`, the CR-013 and CR-014 plans, plus greps for
  `data-theme|tokens\.css|themes/` and `shadow-focus` over `src/`.
- **Read in the packhouse repo (as the brief):** `runs/current/logic-plan/EPIC-001-M-02.md` §2, §3, §6, §9 (AC-01,
  AC-02, AC-05); `source-documents/active/AI_SOFTWARE_QUALITY_GOVERNANCE_STANDARD.md:121` (QG-CEN-003).
- **Read in DC (read only):** `package.json:57` (pin), `app/globals.css:1`, `app/layout.tsx:43`,
  `app/tablet-pwa/layout.tsx:46`, `app/login/page.tsx:78`, `src/components/browser-admin/BrowserAdminShell.tsx:972`,
  `tests/contract/list-paging-page-sizes.test.ts:1-60`, the `.github/workflows/` triggers, and a count of
  `toHaveScreenshot|.screenshot(` in `tests/` (327 calls over 55 specs).
- **CRM, RMS, org-admin: not readable from here.** No claim is made about their code. §5 says how the build checks CRM.

## 1. What changes, in one paragraph

A new stylesheet `src/lib/themes/packhouse.css` redeclares **five** colour tokens, and only when an ancestor or the
element itself carries `data-theme="packhouse"`. It is exported as a new subpath `./themes/packhouse.css`. Nothing
imports it today, `tokens.css` is not touched, and no component, type or barrel changes. An app sees the teal only if
it **both** imports the file **and** sets the attribute. No existing caller does either, so every existing screen in
every consumer is byte-identical by construction. The DC + CRM re-check (§5) turns "by construction" into a measured
record, which is what QG-CEN-003 asks for.

## 2. The theme file — `src/lib/themes/packhouse.css` (new)

Values: **DLC-DEC-054** (packhouse plan §2). White on `#0F766E` is 5.47:1 (WCAG AA text). The ring is ≥3:1 on white.

```css
/* Packhouse theme (opt-in). DLC-DEC-054, packhouse teal, option B. Accent family ONLY: every other token is
 * tokens.css's. Import AFTER tokens.css; set data-theme="packhouse" on <html>. See README "Themes". */
:root[data-theme="packhouse"],
[data-theme="packhouse"],
[data-theme="packhouse"][data-surface],
[data-theme="packhouse"] [data-surface] {
  --color-accent: #0f766e;
  --color-accent-hover: #0b5f58;
  --color-accent-subtle: #d5f3ef;
  --color-fg-on-accent: #ffffff;
  --color-ring: #0f766e;
}
```

**Why each selector (the cascade, worked through against `tokens.css:19-20` and `:131`):**

| Selector | Specificity | Beats | Case it covers |
|---|---|---|---|
| `:root[data-theme="packhouse"]` | 0,2,0 | `:root` (0,1,0) | the attribute on `<html>`. **Added to the brief's selector** so the theme wins on `<html>` *regardless of stylesheet order*. The brief's bare `[data-theme]` ties `:root` at 0,1,0 and would rely on import order alone |
| `[data-theme="packhouse"]` | 0,1,0 | nothing it needs to | a non-root wrapper with no surface of its own |
| `[data-theme="packhouse"][data-surface]` | 0,2,0 | `[data-surface="browser"]` (0,1,0) | attribute on the same element as the surface |
| `[data-theme="packhouse"] [data-surface]` | 0,2,0 | `[data-surface="browser"]` (0,1,0) | attribute on an ancestor of the surface (the packhouse layout: `<html data-theme>` + `<body data-surface>`) |

`[data-surface="tablet"]` declares **no** accent token (`tokens.css:131-171`), so the tablet surface needs nothing extra.

**🔴 One subtlety the build must prove, not assume: the focus halo.** `--shadow-focus` (`tokens.css:86`) is
`… var(--color-ring)`, and it is declared only in `:root, [data-surface="browser"]`. A custom property's `var()` is
resolved **on the element that declares it** and then inherited as a resolved value. 23 kit controls draw their focus
outline from `shadow-focus` (grep: `Button.tsx:26`, `Input.tsx:18`, `Select.tsx:48`, `SlideOver.tsx:66`,
`Sheet.tsx:70`, …). Worked through:

- Attribute on `<html>` (the packhouse plan, §4 `AppDocument.tsx`): `<html>`'s `--color-ring` is teal (first
  selector), so `<html>`'s `--shadow-focus` resolves teal. A browser-surface `<body>` re-declares it against its own
  (teal) ring. A tablet-surface `<body>` inherits `<html>`'s teal halo. **Teal everywhere.**
- Attribute on the **same element as a tablet surface, with no themed ancestor**: that element's ring is teal, but
  it does not re-declare `--shadow-focus`, so it inherits `<html>`'s **yellow** halo. **Wrong.**

Adding `--shadow-focus` to the theme would fix the second case. It would also break the brief's "five accent tokens
and nothing else" and AC-01's allow-list. **Plan: keep five tokens, and document the supported placement as "on
`<html>`"**, which is exactly where the packhouse puts it. The real-browser proof (§4.3) asserts the halo colour in the
supported placement and **records** the unsupported case, so nobody discovers it by accident. If a future app needs the
attribute lower down, a sixth token is a later kit change. Recorded in `known-issues.md` at build.

## 3. The other files

| File | Change |
|---|---|
| `package.json` | `exports["./themes/packhouse.css"] = "./src/lib/themes/packhouse.css"`, inserted **after** `"./tokens.css"`, with no other entry touched. `version` `0.1.0` → `0.2.0`. This is the **first** version bump in the package's life (it stayed 0.1.0 through CR-001…014). No consumer reads it, since all pin by git sha. `files: ["src"]` already ships the new file. No dependency change, so `pnpm-lock.yaml` is unchanged; the build confirms with `pnpm install --frozen-lockfile`. |
| `README.md` | New **"Themes"** section (there is no `CHANGELOG.md`, so the brief's fallback applies): what a theme is (accent family only), the opt-in recipe (`@import` order: `tokens.css` then `themes/packhouse.css`; `data-theme="packhouse"` on `<html>`), the shadow-focus placement note, the five values with their DLC-DEC-054 source, and a **0.2.0** entry: *"Opt-in packhouse theme. DC and CRM unaffected: neither imports the file nor sets the attribute."* The "Consuming it" import example gains one commented optional line. |
| `vitest.config.ts` | A third project `themes` (`include: ["tests/themes/**/*.test.ts"]`, `environment: "node"`). The test lives under `tests/`, **not** `src/` as the brief sketched, because `files: ["src"]` would publish a test file to every consumer (`vitest.config.ts:4-7` states the rule). |
| `tests/themes/packhouse-theme.test.ts` (new) | See §4.1. |

**Not touched, by design:** `src/lib/tokens.css`, `src/index.ts`, `src/lib/index.ts`, every component, `SurfaceContext`,
`ToastProvider`. There is **no new slide-out control**: `SlideOver` (right) and `Sheet` (bottom) already exist on Radix
Dialog. Building a replacement would be the hand-rolled-Radix regression the project rules forbid.

## 4. Proof (to be done at build, NOT claimed now)

### 4.1 The guard test — `tests/themes/packhouse-theme.test.ts` (AC-01, machine-checked)

Reads both files from disk, **normalises CRLF → LF** (the handover's CRLF rule; there is no `.gitattributes`), and strips
`/* … */` comments before parsing. This is the trap DC's `browser-header-token-agreement.test.ts:50-55` documents for
this very `tokens.css`.

1. **Allow-list:** every declared property in `packhouse.css` is one of the five. Any other property fails and names it.
2. **Exact set and values:** all five are present, each exactly once, with the DLC-DEC-054 value (case-insensitive hex).
3. **One rule, exact selector list** (§2). No `@import`, no `@media`, no second block. A second block could smuggle
   a declaration past check 1 if the parser were naive, so the test counts `{` and asserts exactly one.
4. **Every themed property already exists in `tokens.css`'s `:root` block.** A theme may only *override*, never
   invent a token.
5. **`tokens.css` unchanged:** its SHA-256 (LF-normalised) equals a constant captured from `main@cde6f4e`
   (`git show cde6f4e:src/lib/tokens.css`). It is a deliberate tripwire. A future change that edits `tokens.css` must
   update the constant **and** say in its own plan that a token change needs QG-CEN-003's full re-check. Using a hash
   instead of "changed in the same commit" is deliberate: CI checks out shallow, and a git-history assertion would be
   flaky or vacuous there.
6. **Export wired:** `package.json`'s `exports["./themes/packhouse.css"]` resolves to a file that exists, and the four
   pre-existing export entries deep-equal their `cde6f4e` values (export surface only grows).
7. **Non-vacuity:** assert the parsed declaration count is exactly 5 and the parsed `tokens.css` `:root` block holds
   ≥ 40 properties. A parser that returns nothing must fail, not pass.

**Mutation battery** (`runs/change-NN/output/`, keeping the "ANCHOR NOT FOUND" non-zero exit): add a sixth property;
change one hex; drop `:root[data-theme]`; add a second block; edit one byte of `tokens.css`; delete the export entry.
Every mutant must turn the test red.

### 4.2 The package's own suite

Re-measure the baseline first (handover: **458 tests / 22 files**), then `pnpm test`, `pnpm typecheck`,
`pnpm audit --prod --audit-level=high`, `quality-sensors.mjs` (LF-normalised), and `prettier --check` on the new CSS
and test file. Expected: baseline + the new file's tests, with no existing test touched.

### 4.3 Real-browser cascade proof (Edge, as CR-013's `runs/change-10/evidence/browser-proof/proof.mjs`)

A static page loads `tokens.css` + `packhouse.css` and reads `getComputedStyle(...).getPropertyValue(...)`:

| Case | Expect |
|---|---|
| no attribute, `<body data-surface="browser">` | `--color-accent` `#fac80a` (control: today's yellow) |
| `<html data-theme>` + `<body data-surface="browser">` | all five teal on body, and `--shadow-focus` contains `#0f766e` |
| `<html data-theme>` + `<body data-surface="tablet">` | all five teal, halo teal, `--control-h-md` still `56px` (tablet untouched) |
| `<body data-theme data-surface="browser">` | five teal |
| a portalled `Sheet` / `SlideOver` under `<html data-theme>` | its `bg-accent` button computes teal |
| **themes file imported BEFORE `tokens.css`** | still teal on `<html>` and `<body>` (the `:root[...]` selector) |
| `<body data-theme data-surface="tablet">`, no themed ancestor | halo **recorded** (expected yellow: the documented unsupported placement) |

Frames saved to `runs/change-NN/evidence/frames/`.

### 4.4 Existing callers checked, and why they are unaffected

- **DC** (`package.json:57` pins `cde6f4e`): imports only `tokens.css` (`app/globals.css:1`). It sets `data-surface` at
  `app/layout.tsx:43`, `app/tablet-pwa/layout.tsx:46`, `app/login/page.tsx:78`, `BrowserAdminShell.tsx:972` and the
  design-system gallery. **`data-theme` appears in no DC app file.** The only hits are
  `docs/theme-mockups/mockups.html:141-311`, a static document with values `a`/`b`/`c` that is not served by the app.
  DC's `browser-header-token-agreement.test.ts` reads `tokens.css`, which is unchanged.
  `list-paging-page-sizes.test.ts:7-8` **names** the four export subpaths in a *comment*. It asserts nothing about
  the export map, so a fifth subpath fails nothing. The comment goes stale, which is noted for DC's next pin bump in
  DC's own lane.
- **CRM:** unreadable here. The build greps a fresh clone for `data-theme` and `themes/packhouse` and records the counts.
  Expected 0 / 0, because the file does not exist at any sha CRM can pin today.
- **RMS, org-admin:** not in QG-CEN-003's scope. Unaffected by construction (a file that did not exist cannot be
  imported). Not re-checked, and stated as such.

## 5. The DC + CRM re-check in this same run (QG-CEN-003 → packhouse AC-02)

**🔴 Sibling-folder rule.** Everything below runs in **fresh clones in a scratch directory outside the estate tree**
(e.g. `%TEMP%\cr-ds-015-recheck\{dc,crm}`). It never runs in `d:/…/bananaworld-dc`, which the conductor fingerprints.
Nothing is formatted, staged or committed in any sibling working folder.

For each of DC and CRM, at the app's current `main` head (recorded by sha):

1. **Control ("before"):** the app as-is (pin `cde6f4e` for DC; CRM's own pin recorded from its `package.json`).
2. **Candidate ("after"):** the same app commit with **only** the kit dependency line pointed at this change's branch
   head, plus the resulting lockfile. That is two files, and the diff is recorded.
3. **Built-artefact identity:** `next build` both, then compare every emitted CSS file and JS chunk byte for byte, after
   normalising the build id / hashed filenames. Expected: **zero differences**. Because the new file is never imported,
   it cannot reach a bundle. This is the strongest evidence and covers every screen at once, including screens no
   test visits.
4. **Screen renders, before and after:** run each app's own screen set. For DC that is its e2e suite, whose specs take
   327 screenshots over 55 files. Collect the PNGs from both runs and pixel-diff them pairwise. Expected: zero
   differences outside known non-determinism (clock, generated ids). Any difference is investigated, not waved through.
   Where a local database is needed, use the same bootstrap the app's CI uses. Each spec that could not run is listed
   by name with the reason, never silently dropped.
5. **App CI against the candidate:** push the candidate to a throwaway branch
   `throwaway/cr-design-system-015-recheck` and run the app's PR check suite on it. DC's `ci.yml:14` has
   `workflow_dispatch`, so `gh workflow run ci.yml --ref <branch>` runs it with **no pull request**. If CRM's suite has no
   `workflow_dispatch`, a **draft** PR titled "DO NOT MERGE — CR-DESIGN-SYSTEM-015 kit re-check" is opened, closed
   unmerged after the run, and the branch deleted. **Owner confirm point 1 covers this.** Run URLs, conclusions and
   job counts are recorded. Branches are deleted after; deletion is recorded.
6. **Pins do not move.** Nothing is merged in DC or CRM.

**Blocking rule (QG-CEN-003):** any visual difference or any failed DC/CRM check blocks this change, which stops at
`CHANGE_BLOCKED` with the evidence.

**Regression record**, which packhouse M-02 cites by path for AC-02:
`runs/change-NN/evidence/dc-crm-recheck.md`. It holds the kit branch-head sha **and its tree hash**, each app's sha,
artefact-diff counts, screenshot pair counts and diff counts, CI run URLs and conclusions, and the date.

**Branch sha vs merged sha (KI-M001E19-002).** The re-check necessarily runs against the branch head. The packhouse
must pin the **merged** sha on `main`. PRs here are squash-merged, so the two shas differ. The record therefore states the
**tree hash**, and the packhouse session verifies `git rev-parse <merged-sha>^{tree}` equals it before citing this
record. If `main` moved in between and the trees differ, the record does not transfer and the re-check is re-run.

## 6. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/lib/themes/packhouse.css` | new, §2 | 15 |
| `package.json` | one export entry, version | 2 |
| `vitest.config.ts` | `themes` project | 8 |
| `README.md` | "Themes" section + 0.2.0 entry | 30 |
| `tests/themes/packhouse-theme.test.ts` | new guard test, §4.1 (paper-trail side) | ~110 |

Paper trail goes to the archive slot the conductor names (expected `runs/change-14/`; never overwrite, see handover
item 13). It holds the re-check record, frames, mutation battery, decision-log entry `CR-DESIGN-SYSTEM-015` in
`source-documents/active/DECISION_LOG_CHANGE_CONTROL.md`, and the handover / active-milestone refresh. No migration:
the package has no database. No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` is created or written.

## 7. Cross-app intersection map

| # | Seam | Who WRITES | Who READS | This change | Follow-up |
|---|---|---|---|---|---|
| **S1** | Kit theme file + `./themes/packhouse.css` subpath → packhouse app | **Kit** writes the five tokens and the subpath | **Packhouse** imports the file and sets `data-theme` on `<html>` | Ships both, opt-in | **Packhouse EPIC-001-M-02** (its own lane): pin to the **merged** `main` sha whose tree equals the recorded tree; `globals.css` imports `tokens.css` then the theme; `<html data-theme="packhouse">` |
| **S2** | Kit → DC (pin `cde6f4e`) | Kit | DC | None. DC neither imports the file nor sets the attribute; re-checked in §5 | None required. At DC's next pin bump of its own choosing, refresh the stale comment at `list-paging-page-sizes.test.ts:7-8` (now five subpaths) |
| **S3** | Kit → CRM | Kit | CRM | None; re-checked in §5 (code unverified from here) | None |
| **S4** | Kit → RMS, org-admin | Kit | RMS, org-admin | None, by construction | None |
| **S5** | Kit toast lifetimes → packhouse "closes by itself within 6 s" rule | Kit (`ToastProvider` defaults: success 3 s, other tones persistent with close button) | Packhouse | **None** (out of scope by the brief) | Packhouse M-04 wraps toasts with `durationMs ≤ 6000`. A later kit change may add an opt-in. Recorded in this change's `known-issues.md` |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo (eleventh change to raise it; the
decision is the owner's). S1–S5 are recorded here and in `known-issues.md` at build.

## Rule sites

No business rule changes. This change adds presentation only: five colour values behind an opt-in attribute. It
changes nothing about what may happen, when, to whom, or how much. Search confirming there is no existing theme
mechanism to amend: `data-theme|themes/` over this repo's `src/` and root files gave zero hits outside `runs/`.
`tokens.css` hits are only the existing export (`package.json:29`), README (`:18`, `:36`) and doc comments
(`src/index.ts:8`, `GridFilterRow.tsx:150`), all left unchanged.

## 8. Open questions and residuals

1. **Owner confirm 1** (temporary test copies in the warehouse and sales app stores, never merged, deleted after). This
   is the only outward-facing step. The brief already asks for it, so the confirmation is a formality.
2. **Owner confirm 2** (what the teal touches). It is DLC-DEC-054 restated, so nothing new is decided.
3. **Selector refinement** (`:root[data-theme]` added to the brief's selector list) is a technical tightening that keeps
   the brief's intent. It is stated here for the reviewer.
4. **Halo placement limit** (§2): five tokens only means "attribute on `<html>`". A sixth token is a later kit change if
   ever needed.
5. **DC's full screen set may not all run locally.** §5.4 says each skipped spec is named. The artefact-identity check
   (§5.3) does not depend on a database.
6. Standing, carried from the handover: no cross-system register; no CR-008 decision-log entry; 4 inert `ignoreGhsas`;
   OQ-8; the `.snap` CRLF artefact (do not stage).

## 9. Not an epic

This is one stylesheet, one export entry and a regression record. I cannot name five milestones it decomposes into.
