# Developer handover — CR-DESIGN-SYSTEM-030

**Next agent / next action:** packhouse EPIC-006-M-02 pins the MERGED sha of this change (never the branch sha), hosts `PrintPreviewPanel` in its floor `Sheet` and office `SlideOver`, supplies EN + PT words, returns `application/pdf` blobs from `load` / `print` / `download`, explains a refusal (`null`) in its own host, and runs the real-printer check. M-03 (Farm Crate Note) reuses it. Nothing else is owed in this repo.

**Current state:** built, green, PR open. Kit 0.13.0. Archive `runs/change-28/` (`output/`, `evidence/`, `evidence/frames/`, `evidence/browser-proof/`).

**Rules to keep:**
1. Body only: no Modal, no surface prop, no `className`. The host supplies the Radix Sheet or SlideOver (focus trap, Escape).
2. Never open a window or tab: no `window.open`, no `target`. A guard spec reads the source. `PrintPreview.tsx:171` is the kit's other opener and stays untouched for DC.
3. `null` from `print()` / `download()` = refused: open nothing, save nothing, say nothing.
4. No viewer = strictly `navigator.pdfViewerEnabled === false`, read in the mount effect (server rendering). Print then still calls `print()`, never `download()`.
5. The preview frame is keyed on its URL (a changed `src` adds a history entry); Print arms a ref, and only the armed load prints. Focus returns to Print afterwards or Escape stops reaching the host.
6. Browser proof: `node runs/change-28/evidence/browser-proof/proof.mjs` (Edge + DC's `playwright-core`/`tailwindcss`, read-only).
7. Run tests with `--pool=threads --maxWorkers=2 --testTimeout=60000`; run prettier with `--print-width 100`; the barrel is near 300 lines, so fold comment text when adding an export.
