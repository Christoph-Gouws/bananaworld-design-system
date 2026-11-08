# Revision review — CR-DESIGN-SYSTEM-030 (Stage 05)

**Reviewed:** `src/components/PrintPreviewPanel.tsx` (whole), the barrel diff, the new spec, README, version.

**Simplified:** the stateful part is two small hooks (`usePreview`: one load, viewer check, URL revoke; `usePrintPanel`: press, double-tap guard, print on frame load) plus `useSaver`, `printFrame` and `saveBlob`; each function is under 50 lines. Download and Print share one `ActionButton` keyed by an `Action` union instead of two copies of the button. Frame URLs are revoked by a single effect cleanup keyed on the URL, so replacement and unmount are the same code path.

**Considered and rejected:**
- Sharing code with `PrintPreview` (extracting the iframe box): would edit a file every DC caller runs, for no gain (plan D-1).
- A retry button and a sixth word: widens the agreed API; closing and reopening remounts (plan D-7).
- A delay before `contentWindow.print()`: nothing shows it is needed; a one-line change if the real-printer check says so (plan R2).
- A `className` or surface prop: the host wraps it; `Button` already reads `data-surface`.
- Mutation battery: not run (see `known-issues.md`).

**Plan fit:** `main` was `d8309b5`; `PrintPreview.tsx`, `Sheet.tsx`, `SlideOver.tsx`, `Button.tsx`, `ExportButton.tsx:44` and the barrel are as the plan cites. One difference: the plan said one barrel line; prettier wraps the three-name export to five lines, so six comment lines were folded to keep the barrel at 298 (under 300).
