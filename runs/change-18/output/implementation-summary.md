# Implementation summary — CR-DESIGN-SYSTEM-020

Plan check: the plan's cited facts still match `main` @ `1fefb6c` (ExportButton.tsx as described, kit 0.4.0); nothing moved.

Built to the approved plan (layout A, on-green). `ExportButton` is now a dispatcher: no (or empty) `href` → `ExportToastButton` (today's body, verbatim); `href` + `disabled`/`inflight` → `ExportUnavailableButton` (disabled `<button>`); otherwise `ExportDownloadLink` (`<Button asChild variant="secondary"><a href download={fileName ?? ""}>`). Link and unavailable variants carry `[@media(pointer:coarse)]:min-h-11`. Version 0.5.0, README changelog + usage note, `axe-core` devDependency (no runtime dependency; `files: ["src"]`).

**Additive proof — existing callers checked:** DC `CrateBalanceView.tsx:117`, DC gallery `GallerySections.tsx:~607`, DC `ExportButton.test.tsx`, DC `a11y/primitives.test.tsx` — none passes `href`, so all take the toast path, which a frozen-copy matrix test (`ExportButton.frozen-1fefb6c.tsx`, 45 shapes) proves renders identical HTML. Barrel unchanged; export inventory test green. CRM, RMS, Org Admin, Manga Verde: unreadable here; `href` did not exist, so none can pass it.

Full suite 554/28 green; typecheck clean; audit exit 0. No consumer pin bumped. Deviation from plan: the mutation battery was not run (see test-results.md).
