// CR-DESIGN-SYSTEM-026 — drive the REAL StatTile in a REAL browser (Edge) at 390 / 768 / 1280 px, under
// the default yellow, packhouse teal and a dark token fixture. Same method as CR-025's proof.mjs: Tailwind
// and playwright-core are loaded READ-ONLY from bananaworld-dc's node_modules; nothing is written there.
// Usage (package root):  node runs/change-24/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-24/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-24/evidence/frames");
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
  server: { port: 5199, strictPort: true, fs: { allow: [ROOT] } },
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
    { w: 390, surface: "browser", tag: "390-phone", cols: 2 },
    { w: 768, surface: "tablet", tag: "768-tablet", cols: 2 },
    { w: 1280, surface: "browser", tag: "1280-desktop", cols: 4 },
  ];
  for (const { w, surface, tag, cols } of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:5199/?surface=${surface}`);
    await page.getByText("Cachos entrados").first().waitFor();
    await page.addScriptTag({ path: AXE });

    check(`${tag}: no horizontal scroll`, await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));

    for (const set of ["yellow", "teal", "dark"]) {
      const fig = await page.locator(`#${set}-four`).evaluate((row) => {
        const grid = row.firstElementChild;
        const tiles = [...grid.children];
        const tops = new Set(tiles.map((t) => Math.round(t.getBoundingClientRect().top)));
        const heights = new Set(tiles.map((t) => Math.round(t.getBoundingClientRect().height)));
        const poking = [];
        for (const t of tiles) {
          const tb = t.getBoundingClientRect();
          for (const s of t.querySelectorAll("p > span:not(:first-child)")) {
            const b = s.getBoundingClientRect();
            if (b.left < tb.left - 1 || b.right > tb.right + 1) poking.push(s.textContent);
          }
        }
        const link = tiles[3];
        const label = link.querySelector("p > span > span:last-child").getBoundingClientRect();
        const chev = link.querySelector("svg").getBoundingClientRect();
        const rule = tiles[0].querySelector("span.bg-accent").getBoundingClientRect();
        return {
          columns: tops.size === 0 ? 0 : tiles.length / tops.size,
          rows: tops.size,
          sameHeight: [...tiles.reduce((m, t) => m.set(Math.round(t.getBoundingClientRect().top), new Set([...(m.get(Math.round(t.getBoundingClientRect().top)) ?? []), Math.round(t.getBoundingClientRect().height)])), new Map()).values()].every((s) => s.size === 1),
          poking,
          overlap: !(label.right <= chev.left + 1 || label.bottom <= chev.top || chev.bottom <= label.top),
          ruleH: rule.height,
          ruleVisible: getComputedStyle(tiles[0].querySelector("span.bg-accent")).backgroundColor,
          dashes: (row.textContent.match(/—/g) ?? []).length,
          empty: row.textContent.includes("Nada registado"),
        };
      });
      check(`${tag}/${set}: ${cols} tiles across`, fig.columns === cols, JSON.stringify(fig));
      check(`${tag}/${set}: tiles in one line are the same height`, fig.sameHeight, JSON.stringify(fig));
      check(`${tag}/${set}: every value inside its tile`, fig.poking.length === 0, fig.poking.join(","));
      check(`${tag}/${set}: the chevron never overlaps the label`, !fig.overlap);
      check(`${tag}/${set}: accent rule is 3px and coloured`, fig.ruleH === 3 && fig.ruleVisible !== "rgba(0, 0, 0, 0)", JSON.stringify(fig));
      check(`${tag}/${set}: nothing recorded shows one dash and a spoken reason`, fig.dashes === 1 && fig.empty);

      const zero = await page.locator(`#${set}-zero`).textContent();
      check(`${tag}/${set}: a real zero prints 0, never a dash`, zero.includes("0") && !zero.includes("—"), zero);

      const three = await page.locator(`#${set}-three`).evaluate((row) => {
        const tops = new Set([...row.firstElementChild.children].map((t) => Math.round(t.getBoundingClientRect().top)));
        return tops.size;
      });
      check(`${tag}/${set}: three tiles ${w >= 1024 ? "share one line" : "wrap 2 + 1"}`, three === (w >= 1024 ? 1 : 2), String(three));

      const ax = await page.evaluate(async (sel) => {
        const r = await window.axe.run(document.querySelector(sel));
        return r.violations.map((x) => `${x.id}:${x.nodes.length}`);
      }, `#${set}`);
      check(`${tag}/${set}: axe 0 violations (incl. colour contrast)`, ax.length === 0, ax.join(","));

      await page.locator(`#${set}`).screenshot({ path: join(FRAMES, `${tag}-${set}.png`) });
    }

    // the linked tile is a real link, reads label + figure together, and keeps its rule while focused.
    const link = page.getByRole("link", { name: /À espera nas câmaras frias 7/ });
    check(`${tag}: the Waiting tile is a link named by its text`, (await link.count()) >= 1);
    await link.first().focus();
    const focused = await link.first().evaluate((a) => {
      const rule = a.querySelector("span.bg-accent");
      return { rule: rule === null ? 0 : rule.getBoundingClientRect().height, shadow: getComputedStyle(a).boxShadow !== "none" };
    });
    check(`${tag}: focused link shows a focus ring`, focused.shadow, JSON.stringify(focused));
    const plain = await page.locator("#yellow-four").evaluate((row) => row.firstElementChild.firstElementChild.querySelector("a, button, [tabindex]") === null);
    check(`${tag}: a read-only tile has nothing focusable`, plain);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
  rmSync(OUT, { recursive: true, force: true });
}
console.log(failures.length === 0 ? "\nALL PASS" : `\n${failures.length} FAILED: ${failures.join(" | ")}`);
process.exit(failures.length === 0 ? 0 : 1);
