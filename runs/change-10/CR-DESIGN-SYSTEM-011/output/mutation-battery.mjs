// CR-DESIGN-SYSTEM-011 — the mutation battery (§5 of the plan): every spec that guards a rule of the drag
// control is shown it CAN go red. Each mutation is applied to its source file, the drag suites run, the
// file is restored byte for byte (also on failure), and a mutation that leaves the suites GREEN is reported
// as a vacuous spec — that is a defect in the proof, never a pass. An anchor found other than exactly once
// is reported and NOT applied (an anchor occurring twice mutates the wrong function).
//
// Usage (from the package root, with a vitest that can run the component project):
//   node runs/change-10/output/mutation-battery.mjs "<vitest command…>"
// e.g. node runs/change-10/output/mutation-battery.mjs "npx vitest run tests/components/DragBoard"
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const BOARD = "src/components/DragBoard.tsx";
const GRIP = "src/components/DragGrip.tsx";
const TARGET = "src/components/DropTarget.ts";
const command = process.argv[2] ?? "npx vitest run tests/components/DragBoard";

const MUTATIONS = [
  {
    name: "M1 the keyboard stops on a place that refuses",
    file: BOARD,
    from: "if (element !== null && element.isConnected && target.accepts(item)) {",
    to: "if (element !== null && element.isConnected) {",
  },
  {
    name: "M2 a refusing place prevents the default (the browser would let it drop)",
    file: TARGET,
    from: "    if (options.accepts(item)) {\n      // 🔴 WITHOUT",
    to: "    if (true) {\n      // 🔴 WITHOUT",
  },
  {
    name: "M3 a touch-started drag is not cancelled",
    file: GRIP,
    from: "if (board === null || inert || byTouch.current) {",
    to: "if (board === null || inert) {",
  },
  {
    name: "M4 Esc does not put it back",
    file: GRIP,
    from: '} else if (key === "Escape") {\n      event.preventDefault();\n      board.cancel();',
    to: '} else if (key === "Escape") {\n      event.preventDefault();',
  },
  {
    name: "M5 the drop does not ask `accepts` again",
    file: BOARD,
    from: "if (id === null || target === undefined || !target.accepts(item)) {",
    to: "if (id === null || target === undefined) {",
  },
  {
    name: "M6 the board still holds the item after a drop",
    file: BOARD,
    from: '      const byKeyboard = modeRef.current === "keyboard";\n      hold(null, null);',
    to: '      const byKeyboard = modeRef.current === "keyboard";',
  },
  {
    name: "M7 the live region never reads the consumer's words",
    file: BOARD,
    from: "const live = holding === null ? said : describe(holding, over);",
    to: "const live = said;",
  },
  {
    name: "M8 a drag from outside the board is treated as a board drag",
    file: TARGET,
    from: "if (board === null || item === null) return;\n    board.hover(id);",
    to: "if (board === null) return;\n    event.preventDefault();\n    if (item === null) return;\n    board.hover(id);",
  },
  {
    name: "M9 a drag released elsewhere is not put back",
    file: GRIP,
    from: "if (board !== null && sameItem(board.holdingNow(), item)) board.cancel();",
    to: "if (board !== null && sameItem(board.holdingNow(), item)) return;",
  },
  {
    name: "M10 the keyboard line shows for a mouse drag too",
    file: GRIP,
    from: 'if (board === null || board.holding === null || board.mode !== "keyboard") return null;',
    to: "if (board === null || board.holding === null) return null;",
  },
  {
    name: "M11 focus is pulled back to the dropped item even after the person moved on",
    file: BOARD,
    from: "    if (active !== null && active !== document.body) return;\n",
    to: "",
  },
];

const originals = new Map([BOARD, GRIP, TARGET].map((f) => [f, readFileSync(f, "utf8")]));
const restoreAll = () => {
  for (const [f, text] of originals) writeFileSync(f, text);
};
const results = [];
try {
  for (const m of MUTATIONS) {
    const original = originals.get(m.file);
    const count = original.split(m.from).length - 1;
    if (count !== 1) {
      results.push({ name: m.name, verdict: `ANCHOR FOUND ${count}× — not applied` });
      continue;
    }
    writeFileSync(m.file, original.replace(m.from, m.to));
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
for (const r of results) console.log(`${r.verdict.padEnd(40)} ${r.name}`);
const bad = results.filter((r) => !r.verdict.startsWith("RED"));
console.log(`\n${results.length - bad.length}/${results.length} killed`);
process.exit(bad.length === 0 ? 0 : 1);
