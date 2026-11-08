# Test results — CR-DESIGN-SYSTEM-030

| Check | Result |
|---|---|
| `pnpm exec vitest run --pool=threads --maxWorkers=2 --testTimeout=60000` (full suite) | **803 pass / 803**, 41 files (baseline 782; 21 new specs in `tests/components/PrintPreviewPanel.test.tsx`; one declared line added to the export inventory in `DragBoard.additive.test.tsx`; every other test unedited) |
| `pnpm typecheck` | clean |
| `prettier --check --print-width 100` on the new component and its spec | clean |
| Real Edge proof `node runs/change-28/evidence/browser-proof/proof.mjs` | **ALL PASS** (60 checks) |
| Quality sensors (LF files, 4 changed) | 0 open findings (two function-size findings fixed by splitting; barrel brought back under 300 lines by folding comment text) |
| `git diff d8309b5 -- src/components/PrintPreview.tsx` | empty |
| `pnpm audit --prod --audit-level=high` | 2 high / 2 moderate, existing; 2 ignored; no dependency changed |

Note: happy-dom prints `Failed to fetch from "blob:…"` to stderr when a frame is given a blob URL; it does not fail any spec.

## Acceptance criteria
| # | Criterion | Verdict |
|---|---|---|
| AC-1 | One new additive export `PrintPreviewPanel` (+ two types); `PrintPreview` and every DC call site unchanged | MET (inventory spec; `PrintPreview.tsx` diff empty) |
| AC-2 | `load()` preview; `print()` / `download()` return `Blob \| null`; `null` opens and saves nothing | MET (unit specs + Edge refused-print check) |
| AC-3 | Print loads the returned blob in an iframe and calls `contentWindow.print()` on load; the preview's own load never prints | MET (unit specs; Edge counted exactly one print on an HTML-typed blob) |
| AC-4 | `navigator.pdfViewerEnabled === false`: `words.noViewer` shown, Print acts as Download (via `print()`), `load()` not called | MET (unit + Edge) |
| AC-5 | No window or tab is ever opened | MET (no `window.open` / `_blank` in source, guard spec; `window.open` spy 0 and no surviving page in every Edge path) |
| AC-6 | Words (print, download, noViewer, loading, failed) supplied by the caller; none hard-coded | MET (guard spec; PT words in the browser proof) |
| AC-7 | Works at 360, 390, 768 and 1440 px, no sideways scroll, kit tokens only | MET (Edge: Sheet and SlideOver, both surfaces, two colour sets; hex-colour guard spec) |
| AC-8 | Stories and tests in the kit | MET (README "Print panel" + browser fixture page, the kit having no Storybook, plan D-11; 21 specs) |
| AC-9 | DC and CRM render checks pass unchanged | MET by construction: no existing file, prop, default or class string changed; neither app imports the new name; full DC + CRM re-check not run, see `known-issues.md` |

## Manual verification
Steps: run the proof command from the package root (Edge installed). Expected: every line PASS. Actual: ALL PASS. Frames in `runs/change-28/evidence/frames/`. Not checked here: paper from a real printer and the print dialog on a real PDF (packhouse Gate D / QA-UAT-002).

Overall QA verdict: PASS
