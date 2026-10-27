# Stage 05 revision review — CR-DESIGN-SYSTEM-022

**Reviewed:** `Link.tsx`, `GridFilterRow.tsx` (the shipped code) and the four new or changed tests.

**Simplified:** `FILTER_MENU` replaces three copies of one string (the file is 9 lines shorter); the ring's class string is one `RING` constant shared by both variants; a one-letter lambda parameter flagged in the readable-code pass was renamed.

**Considered and rejected:** (1) a `ResizeObserver` to re-place the ring on layout change: transient, moves nothing (plan R1). (2) Deciding the layout from a prop or className instead of the computed style: consumers set layout any way they like, only the browser knows. (3) Placement options B and C: not picked. (4) Sharing `GridFilterRow`'s cell code paths: handover item 6 forbids it; only the string is shared. (5) Touching `ActionTile.tsx` for F6: it would reintroduce an axe failure.

Sensors: 1 open (RC-05, inherited file size). `scripts/quality/design-ratchet.mjs` does not exist in this repo, so no ratchet run.
