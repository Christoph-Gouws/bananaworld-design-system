# Developer handover — CR-DESIGN-SYSTEM-014

**Next agent:** none in this repo. **Next action:** DC CR-DC-222 pins the merged sha (done in that change). The CRM
adopts `ActivityTimeline` / `ChangeTable` only if and when it chooses, in its own change.
**State:** built, green, merged by the authoring session (owner approval of the DC plan, point 2). Artifacts:
`../output/*`.

## Rules
1. 🔴 **Pure presentation.** Every word, time and ordering is the consumer's. Do not add a clock, a zone, a sort or
   a data read here.
2. 🔴 **`ChangeTable` is DC's Audit Log table.** DC's `AuditEntrySheet` renders it for "what changed". A class
   change here moves that screen. Change it on purpose, never as a tidy.
3. **`mode: "values"` exists for records that kept only their new values.** It must never draw a before column.
