# Readable code scorecard — CR-DESIGN-SYSTEM-001

> Scored against the files in `changed-files.md` only.
> `src/components/ChoiceGroup.tsx` (+57) · `tests/components/ChoiceGroup.test.tsx` (+356)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Names say what the thing is | **PASS** | `swatch`, `description`, `ColourSwatch`, `chip(index)`, `requireSwatchIn`. The two public field names were frozen at the plan gate so DC's prepared follow-up compiles unedited — a naming decision made once, deliberately, and recorded. |
| 2 | Comments explain *why*, not *what* | **PASS** | Every added comment states a reason or a contract: why `aria-label` is a superset rule; why `title` is useless on touch; why the sizing lives here and not in `ColourSwatch`; why `{ArrowRight>}` is held. None narrate the code. |
| 3 | Matches the surrounding style | **PASS** | Same doc-comment shape, same `cn()` + grouped-class-list idiom with `// browser sizing` / `// tablet sizing` comments, same `[[data-surface=tablet]_&]:` variant convention, same plain-DOM test assertions with no `jest-dom` matchers (not wired in here). |
| 4 | No dead code, no speculative generality | **PASS** | Two fields, both required by the change request; no options, no config, no hooks, no callbacks added for a future caller that does not exist. |
| 5 | Function/component length reasonable | **PASS** | `ChoiceGroup` remains one component with one `map`. No new function, no new module, no new indirection. |
| 6 | Nesting depth | **PASS** | Unchanged. The swatch is a sibling of the text inside the existing `<RadixRadioGroup.Item>`; nothing was wrapped. |
| 7 | Types carry meaning | **PASS** | `accentHex?: string \| null` deliberately mirrors `ColourSwatchProps` **and** DC's `accent_hex?: string \| null`. Narrowing it to `string \| undefined` would push null-stripping onto every caller — recorded in the plan and honoured. |
| 8 | Magic values named or explained | **PASS** | `w-[7px]`, `w-2.5`, `mr-2.5`, `mr-3.5` are the owner-approved option-B geometry, and the comment says so and says which chip sizes they must fit. |
| 9 | Errors surface loudly | **PASS** | Test helpers `chip()` / `requireSwatchIn()` throw with a specific message rather than being asserted away with `!` — a missing element fails at the point it went missing. Follows `Select.test.tsx`'s `contentElement()`. |
| 10 | Tests are readable as documentation | **PASS** | Test names are full sentences stating the guarantee ("adds NOTHING to a chip that passes neither new field", "becomes the accessible name while the visible text stays the short code"). The suite header explains why the additive rule exists at all. |
| 11 | Non-obvious decisions recorded at the point of the code | **PASS** | The `undefined`-attribute-omission trick, the twMerge/Tailwind ordering that makes `pl-0` win on the left only, and the rejected Radix-`Tooltip` alternative are all commented where they live. |
| 12 | A reader can tell what is safe to change | **PASS** | The doc comment states both `description` contracts explicitly, so the next caller cannot silently break the announcement. Test 12 makes it obvious that moving the sizing into `ColourSwatch` is not safe. |

## Score: 12 / 12 PASS

## Weakest point, stated honestly

The `description` doc comment is long — roughly 15 lines for one optional string field. It earns
the space (both contracts it records are non-obvious, and getting either wrong degrades screen-reader
users specifically, silently, in a way no test in a *consumer* repo would catch). But it is the one
place in the diff where a reader might reasonably say "this is a lot of prose." Recorded rather than
trimmed, because trimming it would remove the part that stops the next caller getting it wrong.
