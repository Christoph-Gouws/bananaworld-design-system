# Logic Plan — CR-DESIGN-SYSTEM-012 — a picker list can be split into sections

> **Raised by:** Bananaworld-DC **CR-DC-210** (the tablet cycle count follows the counter stack by stack). The
> consuming app's owner asked for *"a searchable dropdown that lists every batch currently in this room AND, in a
> separate section, every batch in the DC as a whole"*, and that *"a new shared control goes in the package"*.
> The DC logic plan (`runs/current/logic-plan/CR-DC-210.md` §5.1 in DC) was approved on 2026-10-01 (layout **A**,
> ship on-green, "your recommendations" accepted). This change is its package half.
>
> **Gates:** no migration (no database here). **No mockup gate of its own** — the drawing (`option-a.html`
> frame A1 in DC: two headed sections, *In this room* and *Elsewhere in the DC*) was approved in the consuming
> app, as `-008` and `-011`.
>
> **The number:** `-012`, the next free after `-011` on `main` @ `76fec2a0` (re-verified against the remote).

## 1. What this is

`ComboboxOption` gains ONE optional field, `group?: string`. Where two neighbouring options in the FILTERED list
differ in group, a non-selectable heading (`<li role="presentation">`) is drawn above the second. Headings are
not options: the arrow keys and Enter never land on them, a click on one chooses nothing, and `activeIndex`
does not count them — so the keep-in-view effect now finds the active option through a per-option ref instead
of `list.children[activeIndex]` (a heading would offset that index by one per section). The component never
sorts; the consumer keeps each group contiguous. The filter does not match on the group's words.

## 2. What it is not

No new export, no new component, no prop on `ComboboxProps`. `Sheet` is not touched (the consumer keeps its
in-flow overlay). 🔴 **Without `group` the markup is byte-identical** to `76fec2a0`, asserted against a literal
captured by rendering that version.

## 3. Consumers

DC adopts it on the cycle-count tablet only (CR-DC-210). CRM / RMS / org-admin read the package at their own
pins; they see nothing until they move it, and nothing changes when they do (no option of theirs carries
`group`).

## 4. Tests

`tests/components/Combobox.test.tsx` +5: byte-identical without `group`; one heading per section change; the
arrow keys cross a heading; a section the query empties loses its heading; pressing a heading chooses nothing.
