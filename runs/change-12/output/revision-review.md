# Revision review (Stage 05) — CR-DESIGN-SYSTEM-015

**Reviewed:** the files in `changed-files.md`: one 12-line stylesheet, one export entry, one vitest project, one README section, one guard test.

**Simplified / kept small:** the theme is one rule with one declaration block and no `@import`. The guard test reads the files from disk and parses them rather than snapshotting them, so a future token edit names the offending property.

**Considered and rejected:**
- *A sixth token (`--shadow-focus`) so the theme works when the attribute sits below `<html>`.* Rejected: the brief says five accent tokens and nothing else. The supported placement (on `<html>`) is documented in the README and in `known-issues.md`.
- *A new slide-out control.* Rejected: `SlideOver` and `Sheet` already exist on Radix Dialog; a replacement would be a hand-rolled Radix regression.
- *Putting the test under `src/`.* Rejected: `files: ["src"]` would publish it to every consumer.
- *A git-history assertion that `tokens.css` is unchanged.* Rejected: CI checks out shallow, so it would be flaky or vacuous. A content hash is the tripwire instead.
- *Changing the toast lifetime.* Rejected: out of scope; packhouse M-04 handles it.
