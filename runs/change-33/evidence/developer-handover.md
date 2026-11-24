# Developer handover — CR-DESIGN-SYSTEM-035

**Next agent:** the packhouse (CR-BANANAWORLD-PH-016 or its follow-up) — a Frontend Agent in that repo. **Next action there:** pin the MERGED `main` sha of this change (never the branch sha, KI-M001E19-002), map its `bad/warn/good/neutral` to `danger/warning/success/default`, swap `DashboardParts.tsx` `Tiles`/attention list/heading count onto `StatTile tone/labelCase/linkLabel`, `AttentionList`/`AttentionItem` and `CountBadge`, run its own suite.

**Current state.** Kit 0.16.0 built, green and pushed; no app changed, no pin moved. Artifacts: `runs/change-33/output/` (test-results, known-issues, summary, scorecards), `runs/change-33/evidence/` (milestone-evidence, frames, browser proof).

**Rules to keep.**
1. New StatTile looks are NEW literals chosen only for a non-default prop; never edit `TILE`/`LINKED`/`LABEL`/`VALUE` — the frozen HTML (`tests/components/fixtures/stat-tile-035-frozen.ts`) will fail.
2. Tone colours are `color-mix` of kit tokens, never hex; no token or theme file changed. A caller's own colour classes on a toned tile are unsupported.
3. Foot/action words stay `text-fg`; only the arrow takes the accent (accent text is unreadable in the DC's yellow).
4. AttentionItem's name is its visible words, title first (known-issues K-2); do not put `aria-labelledby` back without answering axe `label-content-name-mismatch`.
5. `index.ts` is full (technical-debt TD-1): split the barrel before adding an export; never prettier it.
6. Apply `app-menu.ts` `positiveCount` for any new "0 shows nothing" count.

**Owed.** Packhouse pins the merged sha. DC + CRM render re-check not run (K-1). Cross-system register still absent (K-5).
