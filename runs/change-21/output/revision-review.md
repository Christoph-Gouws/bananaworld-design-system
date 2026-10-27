# Revision review (Stage 05) — CR-DESIGN-SYSTEM-023

**Reviewed:** `LinkedRecords.tsx`, `LinkedRecordsCard.tsx`, the `DocumentHeader.tsx` diff, the barrel block (files in `changed-files.md`).

**Simplified:** the first draft of `LinkedRecords.tsx` was 325 lines (file-size sensor); the summary card and its type moved to `LinkedRecordsCard.tsx`, which is the natural seam (the card is the one body shared by tooltip and sheet). `DocumentHeader`'s two-branch frame went into a small `HeaderFrame` so the long `DocumentHeader()` function did not grow and `slots.map(` stays verbatim for DC's source scan.

**Considered and rejected:**
- A `layout` prop: only layout A is built; a one-value prop is configuration with nothing to configure.
- A CSS-only hover-none button: cannot satisfy the requested matchMedia test.
- A fifth `<dt>` for the line, or the literal `<div role="group">` inside the `<dl>`: the first breaks DC's four-`dt` specs; the second fails axe `definition-list` (measured this session). The line sits beside the `<dl>` inside the frame.
- Forking Sheet/Tooltip for focus return or styling: the Sheet takes an `onCloseAutoFocus` prop and className overrides, the Tooltip a className.
- `QUALITY-JUSTIFY` comments on the inherited DocumentHeader size findings: the sensor did not register them; reverted rather than leave noise.
