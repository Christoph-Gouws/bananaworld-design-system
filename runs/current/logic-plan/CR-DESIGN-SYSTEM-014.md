# CR-DESIGN-SYSTEM-014 — an activity timeline and a change table — Logic Plan

> Raised by **Bananaworld-DC CR-DC-222** (the per-document *History* button, 2 of 2), 2026-10-06. **The drawing
> was approved there** (DC `runs/current/logic-plan/CR-DC-222.md` §6.1, layout **A**, owner response
> "plan APPROVED (layout A) — ship on-green"), so this change has no mockup gate of its own — the
> CR-DESIGN-SYSTEM-008 / -011 precedent. The DC plan's brief asked the owner (point 2) whether the session may
> publish this part itself once its checks pass, as at EPIC-030-M-06; the owner approved the plan.

## What and why
The request: *"ONE shared component used on every screen — if it is generic it goes into
@bananaworld/design-system"*. A timeline of "who did what, when, and what changed" is pure presentation, and the
CRM can use it for its own records. The package has no timeline, activity or history component today.

## Scope — additive only
| Export | What |
|---|---|
| `ActivityTimeline` | an `<ol>` with a rail |
| `ActivityTimelineItem` | `title`, optional `tag` / `badge` / `meta`, `tone: "record" \| "part"`, body as children |
| `ChangeTable` | Field · Before · After (`mode: "changes"`, changed values tinted) or Field · Recorded as (`mode: "values"`); optional `more` rows behind a keyboard-reachable toggle |

Plus their prop types. The `ChangeTable` classes are DC's Audit Log `DiffTable` (CR-DC-221), promoted so one copy
remains. No data fetching, no app types, no permission, no clock (TECH-COMP-003). No prior export changes.

## Proof
Render specs (order, optional parts, tones, both modes, the toggle by keyboard), the export inventory in
`DragBoard.additive.test.tsx` extended **by name**, a mutation battery (`runs/change-13/output/`), sensors.
The real-browser proof is DC's CR-DC-222 e2e spec, which drives these parts on three document types.

## Seams
DC adopts it in CR-DC-222 (pin bump to the **merged** sha). The CRM sees nothing until it moves its own pin.
