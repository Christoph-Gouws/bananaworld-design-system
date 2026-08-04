# Defect log — CR-DESIGN-SYSTEM-001

> Defects found during the build, and what happened to each. Open count at close: **0**.

| # | Found in | Severity | Defect | Resolution | Status |
|---|---|---|---|---|---|
| D-1 | My own first draft of the test suite | Low (build-time only) | The suite failed `pnpm typecheck` with 17 errors. `tsconfig.json` sets `noUncheckedIndexedAccess: true`, so `chips()[0]` is `HTMLElement \| undefined`. Tests passed but the repo gate did not. | Added throwing accessors `chip(index)` and `requireSwatchIn(el)`, matching the `contentElement()` idiom already used in `Select.test.tsx`, rather than silencing it with `!`. A missing chip now fails loudly at the point it went missing. | **Closed** |
| D-2 | My own first draft of the test suite | Low (build-time only) | A leftover placeholder `await_import()` and a local `const chip = …` shadowing the new helper. | Replaced with a top-level `import { ColourSwatch }`; renamed the local to `stageChip`. | **Closed** |
| D-3 | Reference proposal (CR-DC-022), carried into the plan | Low (documentation) | An inline comment claimed "28px (ColourSwatch's own default) fills a 32px browser chip" while the code set 16px/20px. 28px cannot fit a 32px chip that also has a 1px border, 12px of horizontal padding and text beside it — the comment was simply wrong. | The comment was not carried over. The shipped comment states the real mechanism (`h-auto self-stretch` for full height, `w-[7px]`/`w-2.5` for the reviewed widths) and why the sizing lives in `ChoiceGroup`. Flagged in the plan §2.3(1); confirmed against the real source here. | **Closed** |
| D-4 | Verification of the merged class list | **Medium — would have shipped a visual bug** | Layout B needs the chip's left padding removed so the stripe sits flush. The obvious `pl-0` relies on `twMerge` keeping `px-3` alongside it; had `twMerge` instead collapsed the two, the chip would have silently lost its **right** padding as well, on every swatch chip. | Verified directly against the installed `tailwind-merge@3.6.0`: `twMerge("… px-3 … pl-0")` → both survive, and Tailwind emits `.pl-*` after `.px-*` so `pl-0` wins on the left only. Then pinned it as an assertion in test 11 so a future `twMerge` upgrade cannot regress it silently. | **Closed** |

## Not defects — checked and found correct

| Check | Finding |
|---|---|
| Does the swatch add a tab stop? | No. Test 15 tabs past the group and asserts focus left it. |
| Does the swatch swallow the click? | No. Test 16 clicks the swatch and asserts `onValueChange` fired with the chip's id. |
| Does `ColourSwatch`'s `h-7 w-7 rounded-sm border` survive and fight the stripe? | No. Verified against `tailwind-merge@3.6.0`: `h-auto`, `w-[7px]`, `rounded-none`, `border-0` each displace their counterpart. Pinned by test 11, which asserts `h-7`/`w-7`/`rounded-sm` are **gone** rather than merely that the new classes are present. |
| Does `aria-hidden` on the swatch leak "image" into the chip's accessible name? | No. Test 6 resolves the chip by `getByRole("radio", { name: "A" })`. |
| Do Radix `RadioGroup` tests need happy-dom polyfills, as `Select` did? | No — none required, as the plan predicted. No component code was bent to suit the test environment. |
| Did adding the fields change the chip's class attribute for existing callers? | No. Test 5 asserts the complete class string as a literal; the swatch-only classes are appended solely when `option.swatch !== undefined`. |

## Deferred / out of lane

| Item | Why not fixed here |
|---|---|
| `.github/workflows/ci.yml` test job label still reads "Test — pricing & sales-order engines" although it runs the component tests too | Pre-existing drift, unrelated to this change, touching another lane's file. Recorded in `known-issues.md`. |
| `pnpm format:check` fails on 44 files repo-wide | Pre-existing; `src/components/ChoiceGroup.tsx` already failed at `HEAD` before this change (verified by stashing the change and re-running). Reformatting 44 files would bury a 57-line additive diff. Recorded in `known-issues.md`. |
