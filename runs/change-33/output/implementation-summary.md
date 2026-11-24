# Implementation summary — CR-DESIGN-SYSTEM-035

Plan check: everything the plan cites still matches `main` @ `306e76f`; built as approved (layout A, on-green). Kit **0.15.0 → 0.16.0**, additive.

- **StatTile** (`src/components/StatTile.tsx`): optional `tone` (`default|warning|danger|success`), `labelCase` (`upper|normal`), and on linked tiles `linkLabel`. The old literals `TILE`/`LINKED`/`LABEL`/`ICON`/`VALUE` are untouched; new look = new literals chosen only for a non-default prop. Tone colours are `color-mix` of the kit's own warning/danger/success tokens (no new token). The foot (`TileFoot`) sits inside the one link, pinned with `mt-auto`; with a foot the top-right chevron is not drawn. Types `StatTileTone`, `StatTileLabelCase` exported.
- **AttentionList / AttentionItem** (new `src/components/AttentionItem.tsx`): `<ul divide-y>` of `<li>` each holding one kit `Link`; tone chip, bold title, muted detail, action + arrow hidden under 480 px. Name is the visible words, title first (known-issues K-2).
- **CountBadge** (appended in `StatusBadge.tsx`; `StatusBadge` untouched): number bubble, soft fill + dark text, tones default/warning/danger; renders nothing for ≤ 0 / null / undefined / non-finite via `positiveCount`.
- Barrel: two lines edited, one export added (on an existing line to stay under the 300-line sensor); `package.json` 0.16.0; README changelog + sections; export inventory gains `AttentionItem`, `AttentionList`, `CountBadge`.
- Proof: 971/971 tests (101 new, incl. 66 frozen-HTML equalities), mutation battery 9/9, real Edge run ALL PASS (73) with 8 frames. No app changed; no consumer pin touched.
