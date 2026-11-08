# Implementation summary — CR-DESIGN-SYSTEM-030

Plan fit confirmed: `PrintPreview.tsx`, `Sheet.tsx`, `SlideOver.tsx`, `Button.tsx`, `ExportButton.tsx:44` and the barrel are as the approved plan describes (base `d8309b5`).

New export `PrintPreviewPanel` (kit 0.13.0), layout A: the preview, then Download (secondary) and Print (primary). `load()` once per mount; `print()` / `download()` return `Blob | null`, `null` opens and saves nothing and says nothing. Print puts the returned blob in a keyed iframe and calls `contentWindow.print()` on that frame's load (armed only by a Print press; focus goes back to Print so the host's Escape works). `navigator.pdfViewerEnabled === false`: `words.noViewer`, no `load()`, no frame, and Print calls `print()` then saves the file as `fileName`. A synchronous in-flight ref stops double taps. No window or tab is ever opened; saved through a temporary `<a download>` with no target. Every object URL is revoked. Words come only from the caller. `PrintPreview` is byte-identical; no consumer pin bumped.

Rule-site searches re-run (`window\.open|createObjectURL|revokeObjectURL|contentWindow|pdfViewerEnabled|surface-sunken|\.download\b|download=`; `PrintPreview` in the kit): the only opener is still `PrintPreview.tsx:171` (left as is); the new file has none. No site added to the plan's list.
