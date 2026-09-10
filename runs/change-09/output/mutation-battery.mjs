// CR-DESIGN-SYSTEM-010 — mutation battery.
//
// 🔴 A GREEN SUITE PROVES NOTHING UNTIL A DEFECT REDDENS IT. Each mutation below restores one of the
//    three findings (or a near miss of one) into the source, runs the suite, and requires it to FAIL.
//    A mutation the suite survives is a defect this change could regress into with no warning.
//
// 🔴 ORIGINAL BYTES ARE HELD IN MEMORY AND WRITTEN BACK — never `git checkout --`. On Windows,
//    autocrlf rewrites line endings on the way out of the index, so a checked-out file is
//    byte-DIFFERENT from the file under test even when its content is identical; two multi-line
//    anchors then silently stop matching and their mutations never run (CR-DESIGN-SYSTEM-009
//    defect-log D-1, which reported 6/8 before its own self-check caught it). Every restore here is
//    verified with `Buffer.equals`, and a skipped mutation is a LOUD failure, not a quiet one.
//
// Usage:  node runs/change-09/output/mutation-battery.mjs

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const MUTATIONS = [
  {
    id: "M-1",
    defect: "the master row reads UNTICKED when nothing is chosen — the tick stops meaning 'nothing is hidden'",
    file: "src/components/MultiSelectMenu.tsx",
    from: 'chosen === 0 ? true : chosen >= total ? true : "indeterminate"',
    to: 'chosen === 0 ? false : chosen >= total ? true : "indeterminate"',
  },
  {
    id: "M-2",
    defect: '"All 3" collapses back to "0 of 3" — the two ticked states stop being distinguishable',
    file: "src/components/MultiSelectMenu.tsx",
    from: 'const count = chosen === 0 ? `All ${String(total)}` : `${String(chosen)} of ${String(total)}`;',
    to: "const count = `${String(chosen)} of ${String(total)}`;",
  },
  {
    id: "M-3",
    defect: "F1 — the shared label arithmetic drops a value the options no longer offer",
    file: "src/components/MultiSelectMenu.tsx",
    from: "return [...known.map((opt) => opt.label), ...unknown];",
    to: "return known.map((opt) => opt.label);",
  },
  {
    id: "M-4",
    defect: "F1 — a tick re-derives from the option list, deleting the stored id it cannot show",
    file: "src/components/MultiSelectMenu.tsx",
    from: "return [...known, ...unknown];",
    to: "return known;",
  },
  {
    id: "M-5",
    defect: "F2 (grid) — 'Select all' commits every option id instead of clearing",
    file: "src/components/GridFilterRow.tsx",
    from: "onShowEverything={() => {\n              onCommit([]);\n            }}",
    to: "onShowEverything={() => {\n              onCommit(options.map((o) => o.value));\n            }}",
  },
  {
    id: "M-6",
    defect: "F2 (toolbar) — 'Select all' commits every option id, dropping every blank-valued row",
    file: "src/components/DataTableToolbar.tsx",
    from: "onShowEverything={() => {\n                  onChange([]);\n                }}",
    to: "onShowEverything={() => {\n                  onChange(options.map((opt) => opt.value));\n                }}",
  },
  {
    id: "M-7",
    defect: "F1 — the grid cell reads UNSET while a retired id is still narrowing the query",
    file: "src/components/GridFilterRow.tsx",
    from: "const set = selected.length > 0;",
    to: "const set = options.filter((o) => selected.includes(o.value)).length > 0;",
  },
  {
    id: "M-8",
    defect: "F1 — the grid footer counts matched options instead of stored values",
    file: "src/components/GridFilterRow.tsx",
    from: '{set ? `${String(selected.length)} chosen` : "None chosen"}',
    to: '{set ? `${String(options.filter((o) => selected.includes(o.value)).length)} chosen` : "None chosen"}',
  },
  {
    id: "M-9",
    defect: "F3 — the legacy HTML width is swallowed again and never reaches the <td>",
    file: "src/components/Table.tsx",
    from: "      width={htmlWidth}\n",
    to: "",
  },
  {
    id: "M-10",
    defect: "F3 — the split misreads the four step names as legacy widths, so the ceiling never applies",
    file: "src/components/Table.tsx",
    from: 'return width === "narrow" || width === "medium" || width === "wide" || width === "full";',
    to: "return false;",
  },
];

/** Run the shipped suite. Returns true when it is GREEN. */
function suiteGreen() {
  try {
    execFileSync("npx", ["vitest", "run"], { cwd: root, stdio: "pipe", shell: true });
    return true;
  } catch {
    return false;
  }
}

let caught = 0;
let skipped = 0;
const rows = [];

for (const m of MUTATIONS) {
  const path = join(root, m.file);
  const original = readFileSync(path); // Buffer — the exact bytes under test
  const text = original.toString("utf8");

  // 🔴 THE ANCHOR TAKES THE FILE'S OWN LINE ENDING. Git stores LF and `core.autocrlf` hands out CRLF
  //    on Windows, so a MULTI-LINE anchor written with "\n" matches nothing on a Windows checkout —
  //    which is precisely how CR-DESIGN-SYSTEM-009 lost two mutations. Single-line anchors were
  //    unaffected, which is why the failure looked like a partial run rather than a broken harness.
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const from = m.from.split("\n").join(eol);
  const to = m.to.split("\n").join(eol);

  if (!text.includes(from)) {
    // 🔴 LOUD. A mutation that never ran is not a mutation that passed.
    skipped += 1;
    rows.push({ ...m, result: "❌ ANCHOR NOT FOUND — MUTATION NEVER RAN", restored: "n/a" });
    console.error(`${m.id}: ANCHOR NOT FOUND in ${m.file}`);
    continue;
  }

  writeFileSync(path, text.replace(from, to), "utf8");
  let green;
  try {
    green = suiteGreen();
  } finally {
    writeFileSync(path, original); // the ORIGINAL BYTES, not a re-serialised string
  }
  const restored = readFileSync(path).equals(original);
  if (!restored) console.error(`${m.id}: RESTORE FAILED for ${m.file}`);

  if (!green) caught += 1;
  rows.push({
    ...m,
    result: green ? "❌ SURVIVED — the suite does not guard this" : "✅ caught",
    restored: restored ? "✅ byte-exact" : "❌ BYTES DIFFER",
  });
  console.log(`${m.id}: ${green ? "SURVIVED" : "caught"} · restored=${String(restored)}`);
}

console.log(`\n${String(caught)}/${String(MUTATIONS.length)} caught, ${String(skipped)} skipped`);
console.log("\n| # | Defect restored | Result | Restored |");
console.log("|---|---|---|---|");
for (const r of rows) console.log(`| ${r.id} | ${r.defect} | ${r.result} | ${r.restored} |`);

process.exit(caught === MUTATIONS.length && skipped === 0 ? 0 : 1);
