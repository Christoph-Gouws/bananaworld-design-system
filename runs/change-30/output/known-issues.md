# Known issues — CR-DESIGN-SYSTEM-032

**K-1 — DC + CRM render check not run.** Plan §5.5 proposed fresh clones of DC and CRM with only the kit pin moved to this head, suite/typecheck/build/screenshots before and after. Not run in this session (cost and scope of two app builds; nothing in this change touches an existing source file). The additive claim rests instead on the `git diff` of `src/` (only `index.ts`), the unedited existing suite (850/850) and the export inventory test. The CR-030 DC + CRM re-check also remains owed. Whoever pins this sha first should run it.

**K-2 — Rail flash.** A device that chose the rail sees the open menu for one frame at first load (storage is read after mount). An app can remove it later with a server-readable cookie and an additive optional `initialMenuMode` prop (not built).

**K-3 — axe exceptions in the browser proof.** `aria-hidden-focus` is switched off in f3 (rail flyout) and f4 (user menu): Radix NavigationMenu's own off-screen focus proxy, and Radix DropdownMenu hiding the page while modal. `region` is off everywhere (page-level). Both are Radix internals, not this change's markup.

**K-4 — Keyboard model of the rail.** Focusing a rail heading opens its flyout; Tab enters the flyout's links; ArrowDown/ArrowUp move between rail headings; Esc closes and returns focus. (Plain Tab does not step heading to heading while a flyout is open — Radix NavigationMenu behaviour.) Hover timing is proven in the real browser only (happy-dom cannot time it).

**K-5 — Two Radix copies for consumers.** The noted `pnpm.overrides` floor constrains only this repo. A consumer should keep its own lock to one `@radix-ui/react-dismissable-layer`.

**K-6 — Accessible-name form.** "Loads 2" (visible words) replaced the planned "Loads — 2"; the plan's D-5 text is superseded by the decision log entry.

**K-7 — Cross-system seams S1–S8 (plan §8)** carried unchanged; `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist (owner's call). Owed: packhouse Run 2 pins the MERGED sha and supplies EN + PT words; `slide-out` has no `tailwindcss-animate` dependency by design.

**Standing, carried:** no cross-system register; no CR-008 decision-log entry; 4 inert `ignoreGhsas`; OQ-8; the `.snap` CRLF artefact (restored, not staged); `prettier --print-width 100`; gitleaks scan check (K-1 of CR-022); `index.ts` is at the 300-line RC-05 line (fold comments to add exports).
