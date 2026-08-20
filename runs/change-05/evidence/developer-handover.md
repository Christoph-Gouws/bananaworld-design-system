# Developer handover — CR-DESIGN-SYSTEM-005

> For whoever picks up the CRM's side, DC's side, or this package next.
> Change: **the depot slot's label is chosen by the app wearing the header.**
> Branch `change/cr-design-system-005`, off `origin/main` @ `0633476`. Archive: `runs/change-05/`.

## 1. What changed, and the decision that comes with it

**One optional prop.**

```tsx
<DocumentHeader
  origin={…}
  dcLabel="Branch"          // ← NEW. Optional. Defaults to "DC".
  documentNumber={…}
/>
```

Pass nothing and the slot prints **"DC"**, exactly as it always has. Pass a word and that word is
printed over the second slot. Nothing else moves.

### 🔴 THE OMISSION DECISION — read this before you plan around it

**The slot is ALWAYS present. Omission is NOT offered, and that is deliberate.**

An app with nothing at all for that slot passes `dcName: null` and gets the empty state the slot
already has: an em dash in a dashed, dimmed box that reads as "not filled in". **There is no way to
drop the slot, and there will not be one without an owner decision.**

Three reasons, in weight order:

1. 🔴 **It would move the document number out of its corner.** The header grid is
   `sm:grid-cols-2 lg:grid-cols-4`. Three children put Document no. in column 3 of 4 on a wide screen
   and bottom-**left** on a narrow one. "The document number top right" is the owner instruction of
   2026-08-08. Honest omission therefore requires restyling the header, which this change was
   explicitly forbidden to do.
2. **Four slots in this order is what "homogeneous" means** — the file states it. A per-app slot count
   makes the standard a suggestion.
3. **No caller asked.** CR-CRM-015 needs a word, not a hole.

Pinned by the spec **"renders FOUR slots always — labelled or not, filled or empty"**. If you need
omission, that is an owner decision plus a layout answer for the narrow breakpoint — not a prop.

**Option C — a `dcHint?: string` mirroring `dateHint`, so an app could write "Not applicable" under
the dash — was considered and NOT built**, on one ground only: nobody asked. It is one optional field,
fully additive, and costs nothing to add later. `technical-debt.md` TD-2.

## 2. 🔴 For Bananaworld-DC's lane — one thing to check at your next pin bump

**Nothing here breaks DC today.** DC pins an older sha; none of this reaches it until DC moves.

**The two strings DC's `tests/contract/transaction-form-standard.test.ts` is known to assert are held
byte-for-byte:**

- `export const DOCUMENT_HEADER_SLOTS = ["Date", "DC", "Raised by", "Document no."] as const;` —
  **not one character changed.**
- `const slots = DOCUMENT_HEADER_SLOTS;` — unchanged, and `slots.map(` still walks it.

`slotLabels()).toEqual([...DOCUMENT_HEADER_SLOTS])` also still holds for DC, because DC passes no
`dcLabel` and still renders those four words in that order.

**⚠ The one thing to check, which could not be checked from here.** This package's own spec used to
scan this component's source for the concatenated string:

```js
expect(code).toContain('label="DC" value={props.origin.dcName}');
```

and its comment says it mirrors DC's `transaction-form-standard.test.ts:883`. That substring
necessarily changed — the label half is now `label={props.dcLabel ?? "DC"}`. In **this** repo the
assertion was narrowed to `value={props.origin.dcName}` plus a new pin on the default; narrowed, never
relaxed.

🔴 **Whether DC's mirror pins the full concatenated string or only the value half is UNKNOWN.**
Consumer repos are not readable from a build worktree and none was opened — **no DC file was read and
nothing here claims otherwise.** If DC's mirror does pin the full string, it needs the identical
one-line narrowing at adoption. That assertion is already inside the set that
`runs/change-02/evidence/developer-handover.md` §3 says goes red **by design** at DC's adoption and
must be **inverted, never relaxed** — so it is a line DC already has to visit.

**DC's thirteen render sites across twelve forms need no edit at all.** None passes `dcLabel`.

## 3. For the CRM's lane — CR-CRM-015

**This change is one half of your unblock. Here is the other half.**

1. **Wait for this to merge to `main`.** Then bump the CRM's pin to the **MERGED `main` sha** —
   🔴 **never this branch's sha.** KI-M001E19-002 was exactly that mistake.
2. Pass your own word: `dcLabel="<whatever the CRM calls it>"`.
3. **If the CRM has nothing for that slot on a document, pass `dcName: null`** and it renders the
   existing empty state. You cannot drop the slot — see §1, and plan for a four-slot header.
4. Everything else about the header is unchanged: `origin` is still **required** and still
   discriminated (`kind: "new" | "existing"`), and it must describe the **document**, never the
   viewer — that is CR-DC-039 and it is the reason this component was eligible to be shared at all.
   A CRM form that wires its session in on an `existing` document reintroduces the exact defect.

**This change does NOT unblock CR-CRM-015 by itself.** Two changes, two lanes, in that order.

## 4. 🔴 For the next change to touch `DocumentHeader.tsx`

**Do not tidy the slot model.** Folding `dcLabel` into `DOCUMENT_HEADER_SLOTS`, deriving the labels
from a lookup map, or rebuilding the slot list locally would keep **every DOM spec green** and still
hand Bananaworld-DC a broken contract test at its next pin bump — a delayed-action failure with a
weeks-long fuse that nobody would connect back to this lane.

That edit now reddens **immediately**, in this repo, via two specs:

- **"declares the canonical order ONCE and RENDERS BY MAPPING IT"** — the byte-exact source scan, now
  fenced with a comment naming DC's contract test as the reason it exists.
- **"keeps ORDER in exactly one place — `dcLabel` never becomes a second slot list"** — new.

Both were **proved to bite** by a deliberate mutation (`output/test-results.md` §4, M-4).

The rule, stated once: **the array is IDENTITY and ORDER; the prop is PRESENTATION. The array says
WHICH slot; the prop says what THIS APP calls it.** Keep them beside each other, never nested.

Also: `dateLabel` and `dcLabel` must stay symmetrical — both use `??`, not `||`. If one ever gains a
special case for `""` they diverge, and the spec that pins it will fail. Fix the cause, not the spec.

## 5. Things this session could not do, stated so nobody over-reports

| Item | Why |
|---|---|
| Run any consumer suite (DC, CRM, RMS, org-admin) | Consumer repos are unreadable and unrunnable from a build worktree; none was opened. **Fifth change to record it.** The additive argument is a code argument plus this repo's own mirrors |
| Verify DC's contract mirror (§2) | Same reason. Carried as a declared item, not a guess |
| Run `pnpm audit` | Permission-blocked in build sessions. Reproduced in Node instead; CI's job is authoritative |
| Run `pnpm lint` | **No `lint` script and no eslint config exist in this package** |
| Pass `pnpm format:check` | Pre-existing repo-wide drift — no prettier config; four untouched files fail identically. Not a CI job. `prettier --write` was deliberately not run: it would mass-reformat existing source |
| Create `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` | It does not exist and neither does `governance/`. **Fifth consecutive change to raise it** — a governance decision for the owner, not a change's to invent. The six seams are in `output/centrality-scorecard.md` §2 |

## 6. If you are writing the next dependency-audit probe

**Two probes in a row have lied on their first run.** CR-004's mis-parsed pnpm's peer-suffixed store
directory names; this one walked a symlink's lexical parent (so it saw 16 packages instead of 72 and
missed `nanoid` entirely) and compared npm's numeric advisory ids against GHSA strings (so all six
standing ignores read as BLOCKING).

Two sanity checks catch this class instantly:

- the prod closure should be **~70 packages**, not ~16 — `next` alone drags in dozens;
- **`nanoid@3.3.18` must be present**, because the repo's `pnpm.overrides` exists to put it there.

If either looks wrong, the probe is wrong — not the tree. **Read the output; never take the verdict.**
