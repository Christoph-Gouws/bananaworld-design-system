# Accepted refactors — CR-DESIGN-SYSTEM-005

> Stage 05. **1 accepted and applied. 0 pending. 0 deferred.**

## AR-1 — T-12's barrel scan: index arithmetic → one regex

**Source:** `simplification-opportunities.md` S-6.
**File:** `tests/components/DocumentHeader.test.tsx` (test only — **no source file was refactored**).

### Before

Locating the `export { … } from "./DocumentHeader";` block took a conditional slice built from an
`indexOf` and a `lastIndexOf`, with a ternary guarding the not-found case:

```js
const block = barrel.slice(
  barrel.indexOf("} from \"./DocumentHeader\";") === -1
    ? 0
    : barrel.lastIndexOf("export {", barrel.indexOf("} from \"./DocumentHeader\";")),
  barrel.indexOf("} from \"./DocumentHeader\";") + 1,
);
```

Then the block was split by line and filtered with a `/^[A-Z][A-Za-z_]*$/` shape test — which happened
to work, but only because every exported name starts with a capital.

### After

```js
const block = /export \{([^}]*)\} from "\.\/DocumentHeader";/.exec(barrel);
expect(block).not.toBeNull();
const exported = (block?.[1] ?? "")
  .split(",")
  .map((name) => name.trim().replace(/^type\s+/, ""))
  .filter((name) => name.length > 0);
```

### Why it was accepted

| | |
|---|---|
| **Same claim** | Still "these exact eight symbols are re-exported from `./DocumentHeader`, and not one more" |
| **Fails loudly** | The old form would silently slice from index 0 if the block moved, then assert against whatever text that produced. The new form asserts the match exists first |
| **No shape heuristic** | The old filter accepted a line because it *looked like* an identifier. The new one takes exactly what is between the braces |
| **Shorter and flatter** | Six lines of index arithmetic and a nested ternary gone |

### Why the obvious alternative was rejected

A runtime check — `const pkg = await import("../../src/components"); expect(Object.keys(pkg))…` —
would be simpler still, **but five of the eight symbols are TypeScript types and erase at runtime**.
It could only ever see `DocumentHeader`, `DOCUMENT_HEADER_SLOTS` and `DOCUMENT_NUMBER_WHERE_TO_SET`,
and the whole point of the spec is the full export surface a consumer's `tsc` sees. Source scanning is
the only way to assert it, which is the same reason this file already scans source for the slot order.

### Verified after applying

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **246 passed / 13 files** |
| `git diff -- src/` | unchanged by this refactor — `+30 / −1`, the same as before it |

## Refactors considered and NOT made

**No source file was refactored.** `src/components/DocumentHeader.tsx` contains exactly the prop and
the render line the plan specified, and nothing was tidied around them — the file is a shared primitive
four apps pin by sha, and an unrelated tidy inside it is an unrequested risk with no caller asking for
it. The five rejected candidates and their reasons are in `simplification-opportunities.md` §1.
