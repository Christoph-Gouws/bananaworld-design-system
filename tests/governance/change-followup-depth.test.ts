import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// ────────────────────────────────────────────────────────────────────────────────────────────────────
//  THE REVIEW FOLLOW-UP DEPTH CAP.
//
//  🔴 THE RULE IS NOT STATED HERE. Its designated home is `docs/CHANGE_FOLLOWUP_CAP.md`. An instrument
//     that also restates its rule becomes a second live copy of it, and the two drift apart.
//
//  WHY IT EXISTS HERE, WHERE NOTHING IS BROKEN. This repository's deepest lineage is two generations
//  (CR-DESIGN-SYSTEM-006 → 007) and is within the cap today. Bananaworld-CRM's change lane ran ONE
//  lineage to THIRTEEN generations before anything refused it, each generation after the fourth
//  correcting the prose the previous correction wrote. The controls that failed there were conventions
//  written into archives. This one can go red.
//
//  🔴 THE ESCAPE HATCH IS THE ONE THIS GUARD WATCHES HARDEST. A change that declares itself a root
//     resets its own depth to 1 and passes, so the lineage record is cross-checked against the
//     archive's OWN header prose.
// ────────────────────────────────────────────────────────────────────────────────────────────────────

const LINEAGE = "docs/change-lineage.json";
const RULE_HOME = "docs/CHANGE_FOLLOWUP_CAP.md";
const MAX_GENERATIONS = 2;
const PREFIX = "CR-DESIGN-SYSTEM-";

/**
 * The changes that already exceeded the cap when it was written, measured from the archives on
 * 2026-09-06. It is EMPTY: this repository has never run a lineage past two generations.
 *
 * 🔴 THIS LIST MAY NOT GROW. A change numbered after `capEffectiveAfter` can never legitimately appear
 *    here — the cap applies to it.
 */
const PRE_CAP_OVER_LIMIT: readonly string[] = [];

interface Entry {
  readonly parent: string | null;
  readonly kind?: string;
  readonly archive?: string;
  readonly evidence?: string | null;
}

interface Lineage {
  readonly capEffectiveAfter: string;
  readonly entries: ReadonlyMap<string, Entry>;
}

const ID = new RegExp(`^${PREFIX}\\d{3}$`);

/** A `Map`, never a plain object keyed by a computed id. */
function lineage(): Lineage {
  const raw: unknown = JSON.parse(
    readFileSync(join(process.cwd(), LINEAGE), "utf8"),
  );
  const record = raw as {
    capEffectiveAfter?: unknown;
    changes?: Record<string, Entry>;
  };
  expect(
    typeof record.capEffectiveAfter,
    `${LINEAGE} must declare capEffectiveAfter`,
  ).toBe("string");
  expect(record.changes, `${LINEAGE} must carry a changes map`).toBeTypeOf(
    "object",
  );
  return {
    capEffectiveAfter: String(record.capEffectiveAfter),
    entries: new Map(Object.entries(record.changes ?? {})),
  };
}

/**
 * Generations from the root, inclusive: a root change is 1, its follow-up is 2, a follow-up of that is
 * 3 — the first value the cap refuses. Throws on a cycle rather than looping.
 */
function generations(
  id: string,
  entries: ReadonlyMap<string, Entry>,
  seen: Set<string> = new Set(),
): number {
  if (seen.has(id))
    throw new Error(`lineage cycle at ${id}: ${[...seen, id].join(" → ")}`);
  seen.add(id);
  const parent = entries.get(id)?.parent;
  return parent == null ? 1 : generations(parent, entries, seen) + 1;
}

/** The lineage from a change back to its root, for a failure message that names the whole chain. */
function chain(id: string, entries: ReadonlyMap<string, Entry>): string[] {
  const out: string[] = [];
  let cursor: string | null | undefined = id;
  while (cursor != null && out.includes(cursor) === false) {
    out.push(cursor);
    cursor = entries.get(cursor)?.parent;
  }
  return out.reverse();
}

/** Change ids are zero-padded and monotonic, so a lexical compare orders them. */
function isAfterCap(id: string, capEffectiveAfter: string): boolean {
  return id > capEffectiveAfter;
}

/** The archives on disk, as change ids. */
function archiveIds(): string[] {
  return readdirSync(join(process.cwd(), "runs"))
    .filter((dir) => /^change-\d+$/.test(dir))
    .map(
      (dir) =>
        `${PREFIX}${String(Number(dir.slice("change-".length))).padStart(3, "0")}`,
    )
    .sort();
}

/**
 * The parent an archive declares in its OWN header, or null.
 *
 * ⚠ SCOPED TO THE HEADER BLOCK OF THE THREE HEADER-BEARING DOCUMENTS, ON PURPOSE. An archive cites
 *   other changes in its body, so a whole-file scan would read a citation as a claim about the change
 *   being scanned.
 */
const HEADER_DOCS = [
  "implementation-summary.md",
  "changed-files.md",
  "qa-report.md",
];
const HEADER_LINES = 15;
const DECLARED = new RegExp(`follow[- ]up (?:on|to) (${PREFIX}\\d{3})`, "i");

function declaredParent(id: string): string | null {
  const number = String(Number(id.slice(PREFIX.length)));
  const dir = join(process.cwd(), "runs", `change-${number.padStart(2, "0")}`);
  if (existsSync(dir) === false) return null;
  for (const doc of HEADER_DOCS) {
    const path = join(dir, "output", doc);
    if (existsSync(path) === false) continue;
    for (const line of readFileSync(path, "utf8")
      .split("\n")
      .slice(0, HEADER_LINES)) {
      const match = line.match(DECLARED);
      if (match) return match[1] ?? null;
    }
  }
  return null;
}

describe("review follow-up depth cap", () => {
  it("the rule's designated home exists — this guard is the instrument, not the rule", () => {
    expect(
      existsSync(join(process.cwd(), RULE_HOME)),
      `${RULE_HOME} is missing`,
    ).toBe(true);
  });

  it("every entry is a well-formed id whose parent resolves, with no self-parent and no cycle", () => {
    const { entries } = lineage();
    for (const [id, entry] of entries) {
      expect(ID.test(id), `${id} is not a change id`).toBe(true);
      expect(entry.parent, `${id} names itself as its parent`).not.toBe(id);
      if (entry.parent != null) {
        expect(
          entries.has(entry.parent),
          `${id}'s parent ${entry.parent} has no entry in ${LINEAGE}`,
        ).toBe(true);
      }
    }
    for (const id of entries.keys())
      expect(() => generations(id, entries)).not.toThrow();
  });

  it("every archive on disk has a lineage entry — a change cannot dodge the cap by not recording one", () => {
    const { entries } = lineage();
    const missing = archiveIds().filter((id) => entries.has(id) === false);
    expect(
      missing,
      `archives with no entry in ${LINEAGE}: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("no change after the cap took effect is more than two generations deep", () => {
    const { entries, capEffectiveAfter } = lineage();
    const over = [...entries.keys()]
      .filter((id) => isAfterCap(id, capEffectiveAfter))
      .filter((id) => generations(id, entries) > MAX_GENERATIONS)
      .map(
        (id) =>
          `${id} (generation ${generations(id, entries)}: ${chain(id, entries).join(" → ")})`,
      );
    expect(
      over,
      `over the ${MAX_GENERATIONS}-generation cap — see ${RULE_HOME}:\n${over.join("\n")}`,
    ).toEqual([]);
  });

  it("the pre-cap over-limit set is exactly the frozen record — here, empty", () => {
    const { entries } = lineage();
    const measured = [...entries.keys()]
      .filter((id) => generations(id, entries) > MAX_GENERATIONS)
      .sort();
    expect(measured).toEqual([...PRE_CAP_OVER_LIMIT]);
  });

  it("no archive that calls itself a follow-up is recorded as a root change", () => {
    const { entries } = lineage();
    const contradictions: string[] = [];
    for (const [id, entry] of entries) {
      const declared = declaredParent(id);
      if (declared != null && declared !== entry.parent) {
        contradictions.push(
          `${id}: archive header says ${declared}, ${LINEAGE} says ${entry.parent ?? "root"}`,
        );
      }
    }
    expect(contradictions, contradictions.join("\n")).toEqual([]);
  });

  // ── Canaries: an instrument that cannot fail is not evidence ────────────────────────────────────
  it("counts generations, and refuses a third one", () => {
    const synthetic = new Map<string, Entry>([
      [`${PREFIX}900`, { parent: null }],
      [`${PREFIX}901`, { parent: `${PREFIX}900` }],
      [`${PREFIX}902`, { parent: `${PREFIX}901` }],
    ]);
    expect(generations(`${PREFIX}900`, synthetic)).toBe(1);
    expect(generations(`${PREFIX}901`, synthetic)).toBe(2);
    expect(generations(`${PREFIX}902`, synthetic)).toBe(3);
    expect(generations(`${PREFIX}902`, synthetic) > MAX_GENERATIONS).toBe(true);
  });

  it("detects a cycle instead of hanging on one", () => {
    const cyclic = new Map<string, Entry>([
      [`${PREFIX}903`, { parent: `${PREFIX}904` }],
      [`${PREFIX}904`, { parent: `${PREFIX}903` }],
    ]);
    expect(() => generations(`${PREFIX}903`, cyclic)).toThrow(/cycle/);
  });

  it("reads a real archive's declared parent — the prose cross-check is not scanning nothing", () => {
    expect(declaredParent(`${PREFIX}007`)).toBe(`${PREFIX}006`);
    expect(declaredParent(`${PREFIX}006`)).toBeNull();
  });
});
