# CR-DESIGN-SYSTEM-022 — batched review follow-up (6 findings from CR-013, CR-015, CR-018, CR-021) — Logic Plan

> **This was a planning session only. No feature code was written.** `bananaworld-dc` was only read. Base: branch
> `change/cr-design-system-022` = `main` @ `5c14f37` (CR-DESIGN-SYSTEM-023, PR #40, kit **0.7.0**), working tree clean.
> DC's kit pin, from its own `package.json:57`: `bb6c22ea493ee857da69e969d2482ca7acaab15d` (CR-021, kit 0.6.0).

<!-- OWNER-BRIEF-START -->

**What you'll get.** Six small repairs to the shared screen kit, found by an independent check after earlier work went live. Only one is something people will see. When someone clicks a menu row that has a small picture beside the word, the little "waiting" ring will stop nudging the row's contents. Links inside ordinary sentences look exactly as they do today.

**Please choose** where the ring sits in those menu rows (pictures attached):
- **A (recommended).** Just after the row's words, like ordinary links.
- **B.** Over the small picture at the start of the row.
- **C.** No ring in those rows. The thin line at the top of the page is enough.

**Please confirm.**
- Two safety updates were made quietly during earlier work. They stay, and they get written up properly. Undoing them would reopen known security holes.
- The big tablet buttons keep reading their small helper line aloud as part of the button's name, as built. The plan said to read it separately. The builder changed this because the accessibility checker rejected the planned way. No app uses a helper line yet.

**Not included.** No app changes until it chooses to update.

**Risks.** None for live screens. A false alarm in the nightly check for leaked passwords goes away.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation and this session's limits

Read: repo `CLAUDE.md` (estate router), `runs/current/SESSION_HANDOVER.md`, the four source plans
(`runs/current/logic-plan/CR-DESIGN-SYSTEM-013/015/018/021.md`), their archives (`runs/change-10/`, `runs/change-12/`,
`runs/change-16/`, `runs/change-19/`), `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md`, and the code at every
cited line. No `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md` exists in this repo (searched with `Glob`).
No `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` exists either (standing item 14 of the handover; raised again in §6).

**Limits, stated so nothing below is mistaken for a measurement.** This session had no shell. It did not run git,
`pnpm test`, `pnpm audit`, gitleaks or a browser. Every "confirmed" below is confirmed **by reading the code as it is
now**. The build must re-measure the claims marked *(build verifies)*.

## 1. The six findings, judged

| # | Source | Finding (short) | Verdict | Resolution | Test that would have caught it |
|---|---|---|---|---|---|
| **F1** | CR-013 F1 | Grid filter list chrome written three times | **CONFIRMED** (`GridFilterRow.tsx:267`, `:362`, `:403-404`) | **Fix**: one shared constant, same bytes (§2.1) | New: "the three filter lists share one chrome" (§4.2) |
| **F2** | CR-015 F1 | Gitleaks ignore pinned to a branch-only commit | **CONFIRMED** (`.gitleaksignore:2` names `59ce1abc…`, which `runs/change-12/evidence/dc-crm-recheck.md:17` records as a **branch** commit; `main` is squash-merged) | **Fix**: a commit-independent allowlist entry for the exact hash; delete the dead fingerprint (§2.2) | Full-history gitleaks run on the branch, plus a guard test tying the hash constant to the allowlist (§4.3) |
| **F3** | CR-015 F2 | Unplanned `sharp` floor bump, stale comment | **CONFIRMED** (`package.json:79` is `sharp@<0.35.5`; `:82` still says "floors sharp at 0.35.4"; CR-015's own `runs/change-12/output/test-results.md:13` says "No dependency changed and `pnpm-lock.yaml` is untouched") | **Keep the floor; correct the record** (§2.3). Owner confirm (b) | New: "every override floor is written up in a note" (§4.4) |
| **F4** | CR-018 F1 | The waiting ring is a flex/grid item, so a row-style link shifts | **CONFIRMED** (`Link.tsx:74-78` appends `LinkPendingMark` as a child of the anchor; `:50` makes it an in-flow `inline-block`) | **Fix**: the mark leaves the flow in any link that is not a plain inline link (§2.4). Owner picks A/B/C | Real-browser proof over five link shapes, sibling boxes identical idle vs waiting (§4.5) |
| **F5** | CR-021 F1 | Unplanned `next` floor bump, stale comment, no decision-log line | **CONFIRMED** (`package.json:78` is `next@<15.5.28`; `:74` documents only the `<15.5.24` floor; `DECISION_LOG…:1180-1192` says "Built as approved" and is silent on it). It **was** written up in the archive: `runs/change-19/output/known-issues.md:4` (K-1: GHSA-2464-fhr4-w9xw critical, GHSA-p3m5-59mp-jv5r high, patched ≥ 15.5.28) | **Keep the floor; correct the record** (§2.3). Owner confirm (b) | Same as F3 (§4.4) |
| **F6** | CR-021 F2 | `ActionTile`'s name includes the hint, contrary to the plan | **CONFIRMED** (`ActionTile.tsx:14-15`, `:46-61`; pinned by `tests/components/ActionTile.test.tsx:26-28`) | **No code change. Ratify the build's departure** (§2.5). Owner confirm (b) | Already pinned by `ActionTile.test.tsx:26-28` and the Edge axe run (`runs/change-19/evidence/browser-proof/proof.mjs`) |

None of the six no longer holds. No later change touched these lines: CR-023 (`5c14f37`) and CR-020 changed other files.

### One change, or several?

**One change.** Five of the six are a handful of lines each (a constant, a config entry, three comment corrections, a
decision-log entry). F4 is the only one with behaviour and a visible choice, and it is one private component in one file
(~60 lines). Together this is ~6 shipped files and ~100 lines, well inside one session. Splitting F4 out would put a
60-line change and a 40-line housekeeping change through two full pipelines for no gain in control. **Not an epic**: no
five milestones exist here, only six independent small fixes.

## 2. The fixes

### 2.1 F1 — one chrome for the grid filter's open lists

- In `src/components/GridFilterRow.tsx`, rename `ALL_TICKED_MENU` (`:401-404`) to **`FILTER_MENU`** and move it above
  `SelectCell` (next to `TH_PAD`, `:166-167`). Comment: "The open list's chrome, shared by all three select cells, so a
  change to it is made once."
- `SelectCell` (`:267`) and `MultiSelectCell` (`:362`) use `className={FILTER_MENU}` in place of the inline literal.
  `AllTickedCell` (`:452`) uses the new name.
- **The bytes do not move.** The three literals are character-identical today (`Grep` for `max-h-\[15rem\]` returns
  exactly these three lines with the same string). So every cell's open list renders the same class attribute.
- **Handover item 6 still holds.** "Do NOT unify `SelectCell` / `MultiSelectCell` / `AllTickedCell`" is about the
  cells' code paths. This shares one string constant and touches no branch. The comment at `:401-402` ("They are left
  as they are, so their bytes are not argued about") is replaced, because the bytes are now provably the same.
- **Left alone:** `DateRangeCell`'s content (`:498`). It is a different surface (date inputs, `space-y-2 p-2.5`, no
  `max-h`), not the list chrome.

### 2.2 F2 — a secret-scan exemption that survives the squash-merge

**Why the current one fails.** `.gitleaksignore:2` exempts `59ce1abc…:tests/themes/packhouse-theme.test.ts:generic-api-key:16`.
A gitleaks fingerprint includes the commit sha. `59ce1abc` was the PR branch's code commit (`dc-crm-recheck.md:17`).
The squash-merge put the line onto `main` under a new sha, so on `main` the finding carries that sha and the ignore does
not match. The nightly `secret-scan.yml` (`:6-9`, schedule + dispatch, `fetch-depth: 0`) walks `main`'s full history. The
PR suite (`ci.yml:13-16`, `:93-96`) only scans a PR's own commits, which is why later PRs stayed green.

**Why an inline `gitleaks:allow` is not enough.** It only silences commits that contain the comment. The squash commit on
`main` added the line without it and stays in history, so a full-history scan still finds it there.

**The fix.**
1. `.gitleaks.toml`: add to the existing `[allowlist] regexes` (`:17-19`) one exact entry,
   `'''e641cb32a15f0e94cd400496a6441568f1289726b7fdd3c48cb133520803ea17'''`, with a comment: "SHA-256 of
   `src/lib/tokens.css`, the tamper-guard constant in `tests/themes/packhouse-theme.test.ts` (CR-DESIGN-SYSTEM-015). Not
   a secret. Matched by value, so it holds on every commit sha, the squash-merge included." The config is read from the
   checkout, so it applies to every historical commit. It exempts **one public value**, not a path or a pattern, so it
   cannot hide a real key placed in that file later.
2. **Delete `.gitleaksignore`.** Its only entry (`:2`) matches no commit on `main`. A dead exemption misleads the next
   reader into thinking the finding is handled.
3. `tests/themes/packhouse-theme.test.ts:15`: the comment gains "…AND add the new value to `.gitleaks.toml`'s
   allowlist". A new case in that file reads `.gitleaks.toml` and asserts it contains `TOKENS_SHA256` (§4.3), so a
   future `tokens.css` edit cannot update one and forget the other.

*(Build verifies)* the squash sha on `main` (`git log --format=%H -S TOKENS_SHA256 -- tests/themes/packhouse-theme.test.ts`)
and that a full-history scan of `main` **does** report it today. That turns the reviewer's reasoning into a measurement.
If `main` turns out clean today (for example, because the branch commit is still reachable), record that and still ship
the fix. The fingerprint stays fragile either way.

### 2.3 F3 + F5 — keep both security floors, and write them up

**Not reverted, deliberately.** Reverting either floor would put advisories back into this repo's CI closure.
`next` < 15.5.28 carries GHSA-2464-fhr4-w9xw (critical, RCE) and GHSA-p3m5-59mp-jv5r (high) (`runs/change-19/output/known-issues.md:4`).
`sharp` < 0.35.5 carries GHSA-wq5f-xc86-pv6w (high), the same advisory the CRM's audit hit that week
(`dc-crm-recheck.md:160`). The Dependency Audit job would go red on every PR here. Both floors also follow the remedy the
owner chose twice for exactly this shape (an override, never an ignore: D-12 2026-08-14; CR-009 gate 2026-09-09). What
the reviewer found is a **paper** defect: unplanned, unrecorded, comments now contradicting the code. The fix is the
paper.

*(Build verifies)* that GHSA-wq5f-xc86-pv6w is what the 0.35.5 floor clears. In a scratch copy outside the worktree, set
the floor back to `<0.35.4`, run `pnpm audit --prod --json`, read the advisory ID, and discard the copy. If it is a
different ID, write that one. The CR-015 archive does not record it, so this plan does not assume it.

**Edits (comment text only; no key, no value, no lockfile change):**
- `package.json:74` `//overrides-next-rce`: append "FLOOR RAISED to `<15.5.28` at CR-DESIGN-SYSTEM-021 (2026-10-22) for
  GHSA-2464-fhr4-w9xw (critical) and GHSA-p3m5-59mp-jv5r (high), both patched in 15.5.28; the same standing remedy.
  `sharp` RAISED to `<0.35.5` at CR-DESIGN-SYSTEM-015 (2026-10-09) for GHSA-wq5f-xc86-pv6w. Neither raise was in its
  change's plan; both were ratified at the CR-DESIGN-SYSTEM-022 plan gate (decision log)."
- `package.json:82` `//auditConfig`: "the `sharp@<0.35.4` override above now floors sharp at 0.35.4" → "the `sharp`
  override above (now `<0.35.5`) floors sharp at 0.35.5". The rest of the sentence and the ignore list are untouched.
- `package.json:83` `//auditConfig-next-peer`: after "under the `next@<15.5.24` override above", add "(since raised to
  `<15.5.28`, CR-DESIGN-SYSTEM-021)". It is a statement of history, and the history stays true.
- **Decision log**: the CR-DESIGN-SYSTEM-022 entry records both raises as owner-ratified, with the advisory IDs. It names
  the record errors without rewriting them: CR-015's `test-results.md:13` and CR-021's "Built as approved".

**Not touched:** the four inert `ignoreGhsas` (handover item 12). Retiring them is still the owner's separate
housekeeping call. It is not a side effect of this one.

`pnpm install --frozen-lockfile` must pass unchanged: no `overrides` key moves, so `pnpm-lock.yaml` must not change.

### 2.4 F4 — the waiting ring never moves anything

**The defect, exactly.** Inside a `NavigationBusyProvider`, `Link` renders `{children}<LinkPendingMark/>`
(`Link.tsx:74-78`). Once a navigation has been pending for 150 ms, the mark renders an in-flow
`relative inline-block h-0 w-0 align-middle` span (`:47-53`).
- In a **flex or grid** anchor that span becomes an item. It takes a `gap` (extra 8 px in `gap-2`) and it changes how
  free space is shared out (`justify-between` pulls the last item inward).
- In a **block** anchor whose content ends in a block child, it opens a new line box, and everything below drops by a line.
- Only in a plain **inline** anchor (the default `<a>`, text in a sentence) is it really zero-impact. That is the case
  CR-018's proof measured (`CR-DESIGN-SYSTEM-018.md:229`: the page's first heading, not the link's own siblings).
- Note: the kit's own `ActionTile` takes the `Link` path when it has an `href` (`ActionTile.tsx:69-78`). It is a column
  flex with `gap-1.5`, so a tile link inside a provider shifts too.

**The fix (one private component, `src/components/Link.tsx`).**
1. `LinkPendingMark` keeps its hooks and its 150 ms delay unchanged. It gains a `ref` on its wrapper and a
   `useLayoutEffect` that runs when the mark first shows. That effect reads `getComputedStyle(anchor).display`, where
   `anchor = wrapper.parentElement`.
2. **`display: inline` → exactly today's markup**, byte for byte (`:46-53`). Ordinary links in text keep the look the
   owner approved at CR-018.
3. **Any other display** (`block`, `inline-block`, `flex`, `inline-flex`, `grid`, `inline-grid`, …) → the
   **out-of-flow** mark: wrapper `pointer-events-none absolute h-0 w-0` with no insets. An absolutely positioned child is
   never a flex or grid item and never opens a line box, so **nothing in the link or after it can move**, whatever the
   consumer's classes. A `data-link-pending-placement` attribute names the variant, for tests.
4. **Placement in the out-of-flow case** follows the owner's pick. The same layout effect measures and then sets a
   `transform: translate(…)` from the wrapper's static position, before paint (no visible jump):
   - **A (recommended): just after the link's words.** Target: 4 px past the end of the anchor's **first visible text**,
     vertically centred on that text. Text is found with a `TreeWalker` that skips the mark itself and nodes whose client
     rect is ≤ 1 px wide (screen-reader-only text). This matches the inline look. In a sidebar row "◻ Users" the ring sits
     after "Users". In "Orders … [12]" it sits after "Orders", and the badge stays at the edge. In a tile it sits after the
     label. With no visible text (an icon-only link), the target is 4 px past the anchor's end edge. The end edge is the
     right edge, or the left edge when `direction: rtl`.
   - **B: over the start.** Target: 8 px in from the anchor's start edge, vertically centred on the anchor.
   - **C: none.** The out-of-flow case renders nothing. The top bar and the pending count are unaffected, because
     `useReportNavigationPending` runs regardless.
5. Ring size, colour, spin, reduced motion and the tablet size are today's (`:52`) in every variant.
6. **Unchanged:** no provider or `legacyBehavior` (`:69-73`) — exactly today's tree. `pendingIndicator={false}` (`:77`).
   `useReportNavigationPending` (`:42`). The delay (`:43`). An idle link renders as before: the mark is `null` until the
   delay elapses.

The comment at `:45` ("Zero width: the link's text and anything after it never move") is corrected. Zero width was never
enough; being out of flow is what keeps things still outside plain inline links.

**Version 0.7.0 → 0.7.1** (behaviour fix, the CR-019 precedent: 0.3.0 → 0.3.1). README `### Changelog` 0.7.1:
"`Link` inside a `NavigationBusyProvider`: the waiting ring no longer moves anything in a link laid out as a row, a block
or a tile (behaviour fix, CR-DESIGN-SYSTEM-022). Links in running text unchanged."

### 2.5 F6 — ratify `ActionTile`'s accessible name as built

**What happened.** The plan specified name = label (+ badge) and description = hint
(`CR-DESIGN-SYSTEM-021.md:195-196`, `:259`). The first real-browser axe run failed **label-content-name-mismatch**
(WCAG 2.5.3, Label in Name). The rule requires the visible text to be contained in the name, and the hint is visible
text. So the builder made the name the tile's whole visible text (`runs/change-19/output/defect-log.md:5`,
`implementation-summary.md:11`, `developer-handover.md:9`). It was well documented in the archive. The one defect is that
it reversed an approved plan clause without an owner gate, and the decision log filed it as "within the approved approach"
(`DECISION_LOG…:1188-1189`).

**Recommendation: keep it, and ratify it.** Going back to the plan's spelling would:
- reintroduce an axe failure the kit's own browser proof checks;
- change the DOM of every hinted tile (new ids and `aria-*`);
- make speech match only part of what is drawn.

No existing caller is affected either way: DC's three tiles (`MarketStationHome.tsx:137-149`) pass no `hint`, so their
names ("Crates out", "Crates in", "New client") are the same under both spellings. DC's tests that use those names
(`tests/e2e/tablet-cr-dc-256-market-station.spec.ts:212,275,312`, `tests/unit/market/market-station-ui.test.tsx:240`)
pass either way. An app that wants a shorter name still passes `aria-label` (`ActionTile.tsx:15`; pinned at
`ActionTile.test.tsx:40`).

**Change:** the decision-log entry only. It moves the departure from "within the approved approach" to "reversed a
plan clause; owner-ratified at the CR-022 gate", and gives the axe reason. **No code, no test change.** If the owner
answers "no" at the gate, F6 becomes its own change. That change would have to re-run the Edge axe proof and settle the
2.5.3 conflict first, so it does not belong as a rider here.

## 3. The additive claim — existing callers checked

| Change | Existing callers | Why unaffected |
|---|---|---|
| F1 constant | Every `GridFilterRow` caller (DC report grids via `ReportGrid.tsx`, CRM) | The class attribute is the same string. The existing byte-identity harness (`runs/change-10/output/byte-identity-013.harness.test.tsx`) and the snapshot tests must stay green with **zero** snapshot edits |
| F2 gitleaks | None: `.gitleaks.toml` and `.gitleaksignore` are not in `files: ["src"]` (`package.json:13-15`) | CI config only |
| F3/F5 comments | None: `pnpm.overrides` is honoured only in the root project (`package.json:74` says so) | Comment strings only. Lockfile unchanged |
| F4 `Link` | **DC**: 0 uses of `NavigationBusyProvider` (`Grep` over `bananaworld-dc`, excluding `node_modules`), so DC's `Link` takes the no-provider branch, which is untouched. **Org Admin** (the provider's reason for existing, CR-ORGADMIN-015): not readable from here. Its row-style links are exactly the defective case, so it gets the fix at its own pin bump. **CRM / RMS / Manga Verde**: not readable. A provider is opt-in since 0.3.0 | Outside a provider: identical, and the frozen-copy test stays. Inside a provider, idle: identical. Inside a provider, waiting, inline link: identical (new frozen-copy test of the mark). Only the waiting ring in a non-inline link changes, and that is the defect |
| F6 | DC's three tiles, no hint | No code change |

The export surface is unchanged: no name is added or removed. `DragBoard.additive.test.tsx` stays green with no edit.

## 4. Proof (to be done at build, NOT claimed now)

1. **Re-measure the baseline first** (handover: 671 tests / 32 files at CR-023, `5c14f37`).
2. **F1** — `tests/components/GridFilterRow.test.tsx` (or a sibling file): open a single, a multi and an `allTicked`
   cell in turn (press `{Escape}` between, handover item 9). Assert that the three `[role="menu"]` elements have
   **identical** `className`, equal to the shipped literal. Mutation check: edit one site's string, and the test fails.
3. **F2** — `tests/themes/packhouse-theme.test.ts` gains "the gitleaks allowlist names this hash". It reads
   `.gitleaks.toml` (CRLF normalised, as the file already does) and expects it to contain `TOKENS_SHA256`.
   Mutation: change one hex digit in the toml, and the test fails. **Scan:** run gitleaks full-history
   (`gitleaks git --config .gitleaks.toml --log-opts="--all"`, from a scratch download outside the worktree) on `main`
   before the fix (expect the finding at the squash sha) and on the branch after (expect it gone). If gitleaks cannot run
   locally, dispatch `secret-scan.yml` with `--ref change/cr-design-system-022` (the CR-015 recheck's precedent). Any
   **other** historical finding it reveals is recorded as a known issue, not fixed here.
4. **F3/F5** — new `tests/package-overrides.test.ts`: for every `pnpm.overrides` key `name@<X`, the version `X` appears
   in at least one `//overrides*` / `//auditConfig*` note, and the `//auditConfig` note no longer contains
   `sharp@<0.35.4`. Against today's `package.json` this test **fails** (no note mentions 15.5.28 or 0.35.5). That is the
   test that would have caught both. Plus `pnpm install --frozen-lockfile` (lockfile unchanged) and
   `pnpm audit --prod --audit-level=high` exit 0.
5. **F4** — unit (`tests/components/NavigationBusy.test.tsx`, happy-dom, fake timers, existing `setPending` helpers):
   - a default (inline) link, waiting → mark markup **equals a frozen copy** of today's span;
   - `style={{ display: "flex" }}` / `"block"` / `"grid"` → `data-link-pending-placement` is the out-of-flow variant, the
     wrapper is `absolute`, and nothing else in the anchor changed;
   - option C: out-of-flow renders no mark, and the bar still counts the link as pending;
   - unmount mid-pending still balances the count (existing test stays).
   **Real browser** (Edge, the CR-013 `browser-proof/proof.mjs` driver, scratch fixture outside the estate tree, desktop
   and tablet surface). Five shapes: (i) inline text link in a sentence; (ii) `flex items-center gap-2` icon + label;
   (iii) `flex justify-between` label + badge; (iv) `block` with two block children; (v) `ActionTile` with `href`. For
   each, the `getBoundingClientRect` of **every child of the anchor, the anchor itself and the next sibling** is
   identical idle vs waiting. This assertion would have caught F4, and it **fails on today's code** for (ii)–(v): run it
   on `main` first and keep that failure as evidence. The ring is visible, and for A it is within 2 px of the target
   rule. Frames idle / waiting per shape to `runs/change-NN/evidence/frames/`. The mutation battery adds one mutant:
   the out-of-flow wrapper put back in flow, which the proof must kill.
6. **F6** — none new. `ActionTile.test.tsx:26-28` already pins the built name.
7. Typecheck, the full suite, prettier `--print-width 100` on touched files only, `quality-sensors.mjs` (LF-normalised,
   handover item 8). Log the context-usage row.

## 5. Files expected to change

| File | Change | ≈ lines |
|---|---|---|
| `src/components/GridFilterRow.tsx` | `FILTER_MENU` constant shared by three cells | ~10 |
| `src/components/Link.tsx` | `LinkPendingMark`: display check, out-of-flow variant, placement (A/B/C) | ~60 |
| `package.json` | version 0.7.1; three note corrections (no key/value change) | ~5 |
| `.gitleaks.toml` | one exact allowlist regex + comment | ~5 |
| `.gitleaksignore` | **deleted** (dead fingerprint) | −3 |
| `README.md` | changelog 0.7.1 | ~4 |
| *Tests* | `GridFilterRow` chrome test; `packhouse-theme` allowlist case; `package-overrides.test.ts`; `NavigationBusy` cases | (paper) |
| *Paper* | decision log entry CR-DESIGN-SYSTEM-022 (ratifies F3, F5, F6); archive `runs/change-NN/` in the slot the conductor names; `SESSION_HANDOVER.md` | (paper) |

**Not touched:** `pnpm-lock.yaml`, `src/index.ts` / barrels, `ActionTile.tsx`, `tokens.css`, any `runs/epic-*`, any
milestone folder, any other change's archive (`runs/change-12/`, `runs/change-19/` are **cited, never edited**; their
record errors are corrected in this change's decision-log entry, not in place).

## 6. Cross-app intersection map

| # | Seam | Who WRITES | Who READS | This change | Follow-up |
|---|---|---|---|---|---|
| **S1** | Kit `Link` waiting ring → **Org Admin** (the provider consumer, CR-ORGADMIN-015) | Kit | Org Admin, at **its own** pin bump to the **merged** sha (KI-M001E19-002) | Fixes the shift in its row-style links. Placement per the owner's pick | Org Admin's own change, if and when it bumps. Nothing forced |
| **S2** | Kit → **DC** (pin `bb6c22e`) | Kit | DC | Nothing it renders changes: no provider, filter lists byte-identical, tiles untouched | None owed |
| **S3** | Kit → CRM, RMS, Manga Verde | Kit | Each app | Nothing rendered changes unless an app mounted a provider (unreadable from here; opt-in since 0.3.0). If one did, it gets the same fix as S1 | Named in the changelog |
| **S4** | Kit CI ↔ GitHub secret scanning | Kit (`.gitleaks.toml`) | The kit's own nightly and PR scans | Exemption by value, not commit | None |
| **S5** | Kit CI's dependency closure | Kit (`pnpm.overrides`) | Kit CI only (`overrides` are root-only) | Notes corrected; floors unchanged | None. No consumer's resolution moves |

No shared database record is touched (the package has no database). No consumer pin is bumped by this change.
`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist in this repo, so there is nowhere to record S1–S5 beyond this
plan and the archive's known-issues. Raised again, as at every change since CR-004.

## Rule sites

**No business rule changes.** Nothing here decides what may happen, when, to whom, or how much. For the reviewer, the
two **presentation** invariants this change touches, and where they are spelled:

1. *"The grid filter's open lists share one chrome"* — was 3 sites, after it is 1 constant.
   - `src/components/GridFilterRow.tsx:267` — **change** (use constant)
   - `src/components/GridFilterRow.tsx:362` — **change** (use constant)
   - `src/components/GridFilterRow.tsx:403-404` — **change** (rename, move)
   - `src/components/GridFilterRow.tsx:498` (`DateRangeCell`) — **leave**: date inputs, a different surface with
     different padding and no max height
2. *"The waiting ring never moves anything"* — today true only for inline links; after the change, true for every link.
   - `src/components/Link.tsx:45-53` — **change**
   - `src/components/NavigationBusy.tsx` (bar: `sticky h-0` wrapper, CR-018 §2.4) — **leave**: the bar is out of flow
     already. Not reported, and not part of this finding
   - `tests/components/Link.additive.test.tsx:92-96,111-131` — **leave**: no-provider and idle paths are unchanged and
     must stay green unedited

Search terms used: `max-h-\[15rem\]`, `ALL_TICKED_MENU`, `_MENU =`, `data-link-pending`, `pendingIndicator`,
`NavigationBusyProvider` (kit and DC), `ActionTile` (DC), `59ce1abc`, `gitleaks:allow`, `gitleaksignore`,
`15\.5\.28`, `0\.35\.5`, `wq5f`.

## 7. Residuals and open questions

- **R1 (F4)** A link whose layout changes *while* it is waiting (a window resize during the 150 ms+ wait) keeps the
  ring's first measured place until the wait ends. It is transient and moves nothing else. Not worth a `ResizeObserver`.
- **R2 (F4)** An *inline* anchor that wraps block children (`<a>` with `<div>` inside and no display class) still takes
  today's in-flow mark and can open a line. It is rare, invalid-ish markup. Today's behaviour is unchanged there, and the
  consumer fixes it by giving the link `block`. Named in the README.
- **R3 (F4)** Placement uses a layout effect and real measurement. happy-dom has no layout, so the geometry is proven
  only in Edge (TD-2 from CR-013: browser proof is still not in CI).
- **R4 (F2)** If the full-history scan shows other old findings in the kit, they are recorded, not fixed here.
- **R5 (F3)** The `sharp` advisory ID is to be confirmed at build (§2.3). The plan names the likely one and does not assert it.
- **Q (owner)** A/B/C for F4. Confirm F3/F5 (keep both floors) and F6 (keep the built name). Defaults if approved
  without a pick: **A**, keep, keep.

## 8. After merge

No consumer pin moves here. Org Admin (and any app that mounted a provider) picks up 0.7.1 in its own change, against
the **merged** sha on `main`, never this branch's sha.
