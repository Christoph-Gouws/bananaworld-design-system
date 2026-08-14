# Readable-code scorecard (Stage 05) — CR-DESIGN-SYSTEM-002

**12 / 12 PASS.** Scored against the 7 files in `changed-files.md`.

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | **Names say what the thing is** | PASS | `DOCUMENT_HEADER_SLOTS`, `DocumentNumberSlotState`, `DocumentOrigin`, `describeDocumentDate`, `slotMood`, `dateBorder`. Names crossed unchanged from DC — correct here for a reason beyond taste: **DC's follow-up compiles against them**, so a "better" name would be a second migration DC absorbs invisibly |
| 2 | **A reader can find the entry point** | PASS | One exported component. `DocumentHeader(props)` renders a `<dl>` and maps one constant; the three slot renderers sit directly beneath it in the order they are used |
| 3 | **Functions are small and single-purpose** | PASS | Longest is `DocumentNumberSlot` at ~55 lines, and it is a render of three declared states, not branching logic. `slotMood`, `moodBorder`, `dateBorder`, `moodFor`, `formatDistance`, `formatDayLabel` are 2–6 lines each |
| 4 | **No nested conditionals in JSX** | PASS | Deliberately so: three named mood functions instead of nested ternaries or a computed lookup, with DC's own reasoning carried in the comment |
| 5 | **Comments explain WHY, not WHAT** | PASS | Every 🔴/⚠ fence records a decision and its anchor — why the discriminant stays, why `auto` is a value not a disabled input, why `<dl>`, why the year prints conditionally, why the weekday is joined with a space |
| 6 | **Comments are TRUE** | PASS | The one place this could have failed. Four comments whose subject was the file's old location were adapted rather than carried into falsehood; each is listed individually in `changed-files.md` §3 with what changed and why. Defect D-2 |
| 7 | **Magic values are named** | PASS | `DOCUMENT_DATE_WARN_DAYS = 60` in one place the screen and its spec both read. `DOCUMENT_NUMBER_WHERE_TO_SET` is the owner's sentence, named once |
| 8 | **The types make the wrong call impossible** | PASS | `origin` is required and discriminated — omitting it does not compile, and a caller must state which moment it is in. `documentNumber` is required. The two date-slot arms cannot be confused |
| 9 | **Tests read as claims, not as mechanics** | PASS | Spec names are sentences: *"an EXISTING document raised by another person names THEM, and never the viewer"*, *"AUTO — shows the number read-only with 'Given automatically', and offers no input"* |
| 10 | **Tests say what would break if they failed** | PASS | The five guard specs each carry a comment naming the failure they exist to catch — an app import in a package five repos pin; a barrel that silently drops the export; a constant drifting from the markup |
| 11 | **No dead code** | PASS | Everything ported is reachable. The one thing that might have looked dead — the transitional flag-OFF path — does not exist to port: the owner deleted it at CR-DC-046 (DECISION-358) |
| 12 | **The diff is reviewable** | PASS | 34 insertions, 0 deletions across three barrels, each an appended block with a comment saying why. The two new files are whole-file additions measurably identical to a known source |

## The weakest point, stated honestly rather than trimmed

**The file is long — 555 lines, of which roughly half are comments.**

A reader meeting it cold spends a while before reaching the first line of executable code. That is a
real cost and it is not being dressed up as a virtue.

It is nonetheless the right call here, for two reasons. First, the fences are the reason the code
survived contact with eleven forms and three epics: DC's own record shows each one was written after
something went wrong, and D-6 keeps them for exactly that. Second — and specific to this change — a
promoted component is read by developers in **five** repos who were not present for any of those
decisions and cannot look up DC's epic history. Stripping the fences on the way into a shared package
would remove the context precisely where it is least recoverable.

The mitigation available was applied: the fences that could have become false in the new home were
corrected rather than carried, so length is the only cost and not accuracy.
