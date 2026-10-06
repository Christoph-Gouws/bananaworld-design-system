# Known issues — CR-DESIGN-SYSTEM-014

- **KI-014-1 — the dependency audit was not run locally.** The authoring session's sandbox refused `pnpm audit`.
  No dependency or lockfile line changed, so the result is `main`'s; package CI's *Dependency Audit* job ran it.
- **KI-014-2 — the archive was authored without a local git clone.** The sandbox refused `git clone`; the branch
  was assembled from `main`'s tarball and pushed as one commit through the GitHub API. The tree is `main`'s tree
  plus exactly the files in `changed-files.md`.
- **Carried, unchanged:** no `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` (seams are in the plan and in DC's
  CR-DC-222 plan §10); the CRM's pin is the CRM's to move.
