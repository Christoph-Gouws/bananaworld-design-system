# Revision review (Stage 05) — CR-DESIGN-SYSTEM-020

**Reviewed:** `src/components/ExportButton.tsx`, `tests/components/ExportButton.test.tsx`, the frozen fixture.
**Simplified:** shared `LinklessProps` type and `touchClass` helper so the two new variants do not repeat the type or the class join; `ExportToastButton` is today's body moved verbatim.
**Considered and rejected:** (1) an `if (href)` inside today's body — would call `useToast` conditionally and force a ToastProvider on the link path; (2) widening the ref to `HTMLAnchorElement` — breaks typed callers; (3) a touch class on the toast path — would break byte-identity for DC; (4) per-format icons / file-type tag (mockups B, C) — owner chose A.
Sensors: 0 open; both scorecards PASS.
