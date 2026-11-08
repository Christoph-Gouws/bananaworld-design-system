## F1
Accepted as true, and resolved by an explicit owner waiver rather than by a render run: the owner (desktop chat,
2026-11-08, "Waive it.") waived the DC + CRM render check of plan 5.5 for CR-DESIGN-SYSTEM-030 only, after checking at head
040d085 that the src changes are `src/components/PrintPreviewPanel.tsx` and `src/components/index.ts` only and that DC, CRM,
Org Admin and packhouse main contain no reference to `PrintPreviewPanel` and no star re-export of the kit. The check is
recorded as NOT RUN - WAIVED BY OWNER (not as passed) in `runs/change-28/output/test-results.md` (AC-9),
`runs/change-28/output/known-issues.md` and `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md`
(CR-DESIGN-SYSTEM-030 outcome). The additive claim is still evidenced in the kit: `PrintPreview.tsx` diff is empty, the
export-inventory spec in `tests/components/DragBoard.additive.test.tsx` holds, and the full suite passes (806).
