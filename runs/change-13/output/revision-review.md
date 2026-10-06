# Revision review (Stage 05) — CR-DESIGN-SYSTEM-014

**Reviewed:** the three source files in `changed-files.md`.

**Simplified:** the "Show N more" toggle lives once, inside `ChangeTable` (`more`), rather than as a separate
disclosure primitive. One consumer needs it today, and a separate primitive would have been a second export with one
caller.

**Considered and rejected:**
- *Adding `before`/`after` highlight colours as props.* Rejected: the tints are the package tokens
  (`danger-subtle` / `success-subtle`). A colour prop would invite a hard-coded colour in a consumer (CE-01).
- *Formatting the `meta` line (who · where · when) inside the item.* Rejected: a time needs the depot's zone, which
  a UI package must not know. The consumer hands in the written line.
- *A grouped-by-day or newest-first mode.* Rejected: those were layout C, which the owner did not pick. The consumer
  orders the entries.
