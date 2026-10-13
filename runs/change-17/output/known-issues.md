# Known issues — CR-DESIGN-SYSTEM-019

## Does any consumer rely on a busy button staying clickable?
Plan §3 read DC (read-only): **no**. 12 DC sites pass `disabled={…}` plus `inflight` and change behaviour at DC's next bump; each is a submit action (Save draft, MoveSheet, MovePalletForm, FoundBatchSheet, BatchStackEntry, StationFormPanel ×2, BucketWasteCard, BucketCorrectionCard, AdjustmentSheet, AdjustmentForm ×2); none is a cancel. CRM, RMS, Org Admin, Manga Verde and Packhouse are not readable from here; each must run the plan's two greps at its own bump.

## Consumer pin bumps owed (each in the app's own change, to the MERGED main sha, never the branch sha)
- S1 **Manga Verde** — priority; bundle with its purchase-screen change (live double-post).
- S2 **DC** — pin `cde6f4e` → merged sha; it is several kit versions behind.
- S3 **CRM**, S4 **Org Admin**, S5 **RMS**, S6 **Packhouse** (`bananaworld-ph`) if it depends on the kit.
- Any other app using the package confirms its own dependency; `bananaworld-sw-hub` should start at ≥0.3.1.

## Residuals (pre-existing, out of scope)
- R1 `asChild` + `inflight`: `disabled` does not stop a link. DC has 0 such sites.
- R2 `cursor-progress` is masked by `disabled:cursor-not-allowed`, so a busy button shows "not allowed".
- R3 Two taps inside one event-loop turn before React commits can still both fire; the guard belongs in the consumer handler and server idempotency.

## Carried
No `CROSS_SYSTEM_CHANGE_REGISTER.md`; 4 inert `ignoreGhsas`; the `.snap` CRLF artefact (not staged).
