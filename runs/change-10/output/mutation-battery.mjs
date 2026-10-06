// CR-DESIGN-SYSTEM-013 — the mutation battery (plan §5): every spec that guards a rule of the
// `allTicked` mode is shown it CAN go red. Each mutation is applied to its source file, the specs run,
// the file is restored byte for byte (also on failure), and a mutation that leaves the specs GREEN is
// reported as a vacuous spec — a defect in the proof, never a pass.
//
// 🔴 An anchor found other than EXACTLY ONCE is reported as "ANCHOR NOT FOUND — MUTATION NEVER RAN" and
//    the battery EXITS NON-ZERO (CR-DESIGN-SYSTEM-010 D-1: on a CRLF checkout, multi-line anchors once
//    matched nothing and 3 of 10 mutations silently never ran). Anchors are matched against the file
//    with its line endings normalised to LF, and the ORIGINAL BYTES are what gets written back.
//
// Usage (from the package root):  node runs/change-10/output/mutation-battery.mjs
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const PARTS = "src/components/MultiSelectAllTicked.tsx";
const STATE = "src/components/multi-select-reading.ts";
const GRID = "src/components/GridFilterRow.tsx";
const BAR = "src/components/DataTableToolbar.tsx";
const VIEW = "src/lib/grid-view.ts";
const ENGINE = "src/lib/table-controls.ts";
const command =
  process.argv[2] ??
  "npx vitest run tests/components/multi-select-reading tests/components/CR-DESIGN-SYSTEM-013 tests/components/grid-view tests/components/table-controls";

const MUTATIONS = [
  {
    name: "M1 the master row commits every option id (CR-010 F2 back)",
    file: PARTS,
    from: "onTickEvery={() => onApply(EVERYTHING)}",
    to: 'onTickEvery={() => onApply({ mode: "only", values: options.map((o) => o.value) })}',
  },
  {
    name: "M2 'everything except' drops the rows with no value",
    file: ENGINE,
    from: "return actual === null || !excluded.includes(actual);",
    to: "return actual !== null && !excluded.includes(actual);",
  },
  {
    name: "M3 re-ticking the last hidden one does not collapse to everything",
    file: STATE,
    from: "    if (hidden.length === 0) return EVERYTHING;\n",
    to: "",
  },
  {
    name: "M4 the 'nothing ticked' draft commits a narrowing instead of everything",
    file: PARTS,
    from: 'commit(next.mode === "none" ? EVERYTHING : next);',
    to: 'commit(next.mode === "none" ? { mode: "except", excluded: ["*"] } : next);',
  },
  {
    name: "M5 gridFilterIsEmpty ignores `excluded` (gridFilterSet drops the exclusion)",
    file: VIEW,
    from: "      (value.values ?? []).length === 0 &&\n      (value.excluded ?? []).length === 0\n",
    to: "      (value.values ?? []).length === 0\n",
  },
  {
    name: "M6 hasActiveControls ignores `excluded` ('Clear' stays dark)",
    file: ENGINE,
    from: "return v.values.length > 0 || (v.excluded ?? []).length > 0;",
    to: "return v.values.length > 0;",
  },
  {
    name: "M7 the draft survives the menu closing",
    file: PARTS,
    from: "if (!open) setDraftNone(false);",
    to: "if (!open) return;",
  },
  {
    name: "M8 the master row never unticks every box",
    file: PARTS,
    from: "if (state === true) onUntickEvery();",
    to: "if (false) onUntickEvery();",
  },
  {
    name: "M9 'not narrowed' shows no box ticked (today's behaviour back)",
    file: STATE,
    from: 'if (reading.mode === "all") return true;\n  if (reading.mode === "none") return false;',
    to: 'if (reading.mode === "all") return false;\n  if (reading.mode === "none") return false;',
  },
  {
    name: "M10 a hidden id the options no longer offer is dropped on the next untick",
    file: STATE,
    from: 'reading.mode === "all" ? [] : reading.excluded,',
    to: 'reading.mode === "all" ? [] : reading.excluded.filter((v) => options.some((o) => o.value === v)),',
  },
  {
    name: "M11 the grid never routes to the allTicked cell",
    file: GRID,
    from: 'def.multiple === true && def.selectAll === "allTicked" ? (',
    to: "false ? (",
  },
  {
    name: "M12 the toolbar never routes to the allTicked control",
    file: BAR,
    from: 'if (def.kind === "multiSelect" && def.selectAll === "allTicked") {',
    to: "if (false) {",
  },
  {
    name: "M13 a stored exclusion is not read back",
    file: ENGINE,
    from: "  const excluded = storedStrings(storedExcluded);\n  if (excluded.length > 0) {",
    to: "  const excluded = storedStrings(storedExcluded);\n  if (false) {",
  },
  {
    name: "M14 unticking one from everything narrows to ONLY the rest (an include list)",
    file: STATE,
    from: 'return coversEveryOption(options, hidden) ? NOTHING_TICKED : { mode: "except", excluded: hidden };',
    to: 'return coversEveryOption(options, hidden) ? NOTHING_TICKED : { mode: "only", values: options.map((o) => o.value).filter((v) => !hidden.includes(v)) };',
  },
  {
    name: "M15 a stored exclusion is honoured by a def that cannot show it",
    file: ENGINE,
    from: 'if (def.kind === "multiSelect" && def.selectAll === "allTicked") {',
    to: 'if (def.kind === "multiSelect") {',
  },
];

const files = [...new Set(MUTATIONS.map((m) => m.file))];
const originals = new Map(files.map((f) => [f, readFileSync(f)])); // BYTES, never a re-encoded string
const restoreAll = () => {
  for (const [f, bytes] of originals) writeFileSync(f, bytes);
};
const results = [];
try {
  for (const m of MUTATIONS) {
    const raw = originals.get(m.file).toString("utf8");
    const crlf = raw.includes("\r\n");
    const lf = raw.replace(/\r\n/g, "\n");
    const count = lf.split(m.from).length - 1;
    if (count !== 1) {
      results.push({ name: m.name, verdict: `ANCHOR NOT FOUND (${count}×) — MUTATION NEVER RAN` });
      continue;
    }
    const mutated = lf.replace(m.from, m.to);
    writeFileSync(m.file, crlf ? mutated.replace(/\n/g, "\r\n") : mutated);
    let red = false;
    try {
      execSync(command, { stdio: "pipe" });
    } catch {
      red = true;
    }
    results.push({ name: m.name, verdict: red ? "RED (killed)" : "GREEN — VACUOUS SPEC" });
    restoreAll();
  }
} finally {
  restoreAll();
}
for (const r of results) console.log(`${r.verdict.padEnd(46)} ${r.name}`);
const bad = results.filter((r) => !r.verdict.startsWith("RED"));
console.log(`\n${results.length - bad.length}/${results.length} killed`);
process.exit(bad.length === 0 ? 0 : 1);
