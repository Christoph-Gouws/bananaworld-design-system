// CR-DESIGN-SYSTEM-028 — drive the REAL TruckDiagram in a REAL browser (Edge) at 360 / 390 / 768 (tablet
// surface) / 1440 px, under default yellow and packhouse teal, then in print emulation. Same method as
// CR-025/026: Tailwind and playwright-core are loaded READ-ONLY from bananaworld-dc's node_modules.
// Usage (package root):  node runs/change-26/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-26/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-26/evidence/frames");
const DC = process.env.DC_ROOT ?? "d:/Projects/Team Builder/teams/AI Dev Team 6/projects/bananaworld-dc";
const TW_CLI = join(DC, "node_modules/.pnpm/tailwindcss@3.4.19_yaml@2.9.0/node_modules/tailwindcss/lib/cli.js");
const PW = join(DC, "node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core");
const VITE = join(ROOT, "node_modules/.pnpm/vite@8.1.5_@types+node@26.1.1/node_modules/vite/dist/node/index.js");
const AXE = join(ROOT, "node_modules/axe-core/axe.min.js");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(FRAMES, { recursive: true });

writeFileSync(
  join(OUT, "input.css"),
  `${readFileSync(join(ROOT, "src/lib/tokens.css"), "utf8")}\n${readFileSync(join(ROOT, "src/lib/themes/packhouse.css"), "utf8")}\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
);
execFileSync(process.execPath, [TW_CLI, "-c", join(HERE, "tailwind.config.cjs"), "-i", join(OUT, "input.css"), "-o", join(OUT, "proof.css")], { stdio: "pipe" });

const vite = await import(pathToFileURL(VITE).href);
const react = (await import("@vitejs/plugin-react")).default;
const server = await vite.createServer({
  root: HERE,
  configFile: false,
  plugins: [react()],
  cacheDir: join(OUT, "vite-cache"),
  logLevel: "error",
  server: { port: 5198, strictPort: true, fs: { allow: [ROOT] } },
});
await server.listen();

const failures = [];
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  — ${detail}`}`);
  if (!ok) failures.push(name);
}

const { chromium } = createRequire(join(PW, "package.json"))(PW);
const browser = await chromium.launch({ channel: "msedge" });
try {
  const WIDTHS = [
    { w: 360, surface: "browser", tag: "360-phone", minH: 48 },
    { w: 390, surface: "browser", tag: "390-phone", minH: 48 },
    { w: 768, surface: "tablet", tag: "768-tablet", minH: 56 },
    { w: 1440, surface: "browser", tag: "1440-desktop", minH: 48 },
  ];
  for (const { w, surface, tag, minH } of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:5198/?surface=${surface}`);
    await page.getByText("Drop 2 · unloaded last").first().waitFor();
    await page.addScriptTag({ path: AXE });

    check(`${tag}: no horizontal scroll`, await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));

    for (const set of ["yellow", "teal"]) {
      const s = await page.locator(`#${set}-shared`).evaluate((root) => {
        const lis = [...root.querySelectorAll("li")];
        const rects = lis.map((li) => li.firstElementChild.getBoundingClientRect());
        const box = root.getBoundingClientRect();
        const lefts = new Set(rects.map((r) => Math.round(r.left)));
        const txt = root.textContent;
        const pos = (t) => txt.indexOf(t);
        return {
          count: lis.length,
          minHeight: Math.min(...rects.map((r) => r.height)),
          minWidth: Math.min(...rects.map((r) => r.width)),
          columns: lefts.size,
          inside: rects.every((r) => r.left >= box.left - 1 && r.right <= box.right + 1),
          order: pos("Cab") < pos("Drop 2 · unloaded last") && pos("Drop 2 · unloaded last") < pos("Drop 1 · unloaded first") && pos("Drop 1 · unloaded first") < txt.lastIndexOf("Doors"),
          takenNumbers: [...root.querySelectorAll("li")].filter((li) => li.textContent.includes("Taken") && /1INC/.test(li.textContent)).length,
          buttons: root.querySelectorAll("button").length,
          takenButtons: [...root.querySelectorAll("li")].filter((li) => li.textContent.includes("Taken") && li.querySelector("button")).length,
        };
      });
      check(`${tag}/${set}: 30 spaces, two across, all inside the picture`, s.count === 30 && s.columns === 2 && s.inside, JSON.stringify(s));
      check(`${tag}/${set}: every space at least ${minH}px tall and 48px wide`, s.minHeight >= minH - 0.5 && s.minWidth >= 48, JSON.stringify(s));
      check(`${tag}/${set}: Cab at top, drop 2 then drop 1, Doors at bottom`, s.order);
      check(`${tag}/${set}: a taken space shows no pallet number and is not a button`, s.takenNumbers === 0 && s.takenButtons === 0 && s.buttons === 24, JSON.stringify(s));

      const big = await page.locator(`#${set}-big`).evaluate((root) => ({
        warn: root.textContent.includes("More than a standard truck"),
        lists: root.querySelectorAll("ol").length,
        drops: root.textContent.includes("Drop"),
        count: root.querySelectorAll("li").length,
        warnBorder: getComputedStyle(root.querySelectorAll("li")[30].firstElementChild).borderTopColor !== getComputedStyle(root.querySelectorAll("li")[0].firstElementChild).borderTopColor,
      }));
      check(`${tag}/${set}: 34 pallets show the warning words and a second list, and no drop lines`, big.warn && big.lists === 2 && !big.drops && big.count === 34 && big.warnBorder, JSON.stringify(big));

      const three = await page.locator(`#${set}-three`).evaluate((root) => ({
        groups: [...root.querySelectorAll("[role=group][aria-label^=Drop]")].map((g) => g.getAttribute("aria-label")),
        tags: [...root.querySelectorAll("li span.border-fg")].map((t) => t.textContent),
      }));
      check(`${tag}/${set}: three drops draw three labelled blocks, tags on the shared rows`, three.groups.length === 3 && three.tags.length === 2, JSON.stringify(three));

      const odd = await page.locator(`#${set}-odd`).evaluate((root) => root.querySelectorAll("li").length);
      check(`${tag}/${set}: an odd count of 23 draws 23 spaces`, odd === 23, String(odd));

      const pt = await page.locator(`#${set}-pt`).evaluate((root) => {
        const box = root.getBoundingClientRect();
        return {
          words: root.textContent.includes("Entrega 2 · descarregada por último") && root.textContent.includes("Ocupado") && root.textContent.includes("Portas"),
          inside: [...root.querySelectorAll("li")].every((li) => li.firstElementChild.getBoundingClientRect().right <= box.right + 1),
        };
      });
      check(`${tag}/${set}: Portuguese words and a long label stay inside the space`, pt.words && pt.inside, JSON.stringify(pt));

      const ax = await page.evaluate(async (sel) => (await window.axe.run(document.querySelector(sel))).violations.map((x) => `${x.id}:${x.nodes.length}`), `#${set}`);
      check(`${tag}/${set}: axe 0 violations (incl. colour contrast)`, ax.length === 0, ax.join(","));

      await page.locator(`#${set}`).screenshot({ path: join(FRAMES, `${tag}-${set}.png`) });
    }

    // a real tap, and the keyboard: Enter on a focused space reports its position.
    await page.getByRole("button", { name: /^Position 8 / }).first().click();
    await page.getByRole("button", { name: /^Position 9 / }).first().focus();
    await page.keyboard.press("Enter");
    const taps = await page.evaluate(() => window.__taps);
    check(`${tag}: a tap and Enter report the position`, taps[0] === 8 && taps[1] === 9, JSON.stringify(taps));
    const ring = await page.getByRole("button", { name: /^Position 9 / }).first().evaluate((b) => getComputedStyle(b).boxShadow !== "none");
    check(`${tag}: a focused space shows a focus ring`, ring);
    await page.close();
  }

  // Print, black and white: the picture must not overflow the page and must not split across pages badly.
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.goto("http://localhost:5198/?surface=browser");
  await page.getByText("Drop 2 · unloaded last").first().waitFor();
  await page.emulateMedia({ media: "print" });
  const pr = await page.locator("#yellow-shared").evaluate((root) => ({
    scroll: document.documentElement.scrollWidth <= innerWidth,
    minHeight: Math.min(...[...root.querySelectorAll("li")].map((li) => li.firstElementChild.getBoundingClientRect().height)),
    labels: root.textContent.includes("Cab") && root.textContent.includes("Doors") && root.textContent.includes("Taken"),
  }));
  check("print: no sideways overflow, labels and the word Taken present", pr.scroll && pr.labels, JSON.stringify(pr));
  await page.locator("#yellow-shared").screenshot({ path: join(FRAMES, "print-shared.png") });
  await page.close();
} finally {
  await browser.close();
  await server.close();
  rmSync(OUT, { recursive: true, force: true });
}
console.log(failures.length === 0 ? "\nALL PASS" : `\n${failures.length} FAILED: ${failures.join(" | ")}`);
process.exit(failures.length === 0 ? 0 : 1);
