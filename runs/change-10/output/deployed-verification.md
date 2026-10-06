# Deployed verification — CR-DESIGN-SYSTEM-013

**Nothing is deployed by this change, by construction.** `@bananaworld/design-system` is a TypeScript-source
library that four apps (DC, CRM, RMS, org-admin) pin by git sha. Merging this PR moves no consumer: each app picks it
up only in its own change, against the **merged** `main` sha (never this branch — KI-M001E19-002).

| Check | Result |
|---|---|
| Staging / production deploy | **N/A** — no app is deployed from this repo |
| Migration | **N/A** — no database; nothing to stage or promote |
| What a consumer sees on a pin bump with no opt-in | identical markup — 10,029 caller shapes, 0 differences vs `main@26fa005`; seven-screen snapshot zero-line diff |
| What a consumer sees after opting in (`selectAll: "allTicked"`) | the approved layout B, driven in a real Edge browser: 17/17 checks, frames `runs/change-10/evidence/frames/01…06` |
| Consumer pins moved by this change | **none** |

The post-merge verification belongs to each consumer's follow-up change (plan §7, S1 DC and S2 CRM), where the
screen is that app's own.
