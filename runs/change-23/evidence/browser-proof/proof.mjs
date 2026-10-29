// CR-DESIGN-SYSTEM-025 — drive the REAL BarChart in a REAL browser (Edge) at 390 / 768 / 1280 px, under
// the default yellow, packhouse teal and a dark token fixture. Same method as CR-010's proof.mjs: Tailwind
// and playwright-core are loaded READ-ONLY from bananaworld-dc's node_modules; nothing is written there.
// Usage (package root):  node runs/change-23/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-23/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-23/evidence/frames");
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
    { w: 390, surface: "browser", tag: "390-phone" },
    { w: 768, surface: "tablet", tag: "768-tablet" },
    { w: 1280, surface: "browser", tag: "1280-desktop" },
  ];
  for (const { w, surface, tag } of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:5198/?surface=${surface}`);
    await page.getByRole("table", { name: "Packout by class" }).first().waitFor();
    await page.addScriptTag({ path: AXE });

    check(`${tag}: no horizontal scroll`, await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));

    for (const set of ["yellow", "teal", "dark"]) {
      const normal = page.locator(`#${set}-normal`);
      const fig = await normal.evaluate((card) => {
        const rows = [...card.querySelectorAll("[role=row]")].slice(1);
        const clipped = [];
        const oneLine = [];
        for (const row of rows) {
          const rb = row.getBoundingClientRect();
          for (const c of row.querySelectorAll("[role=cell]")) {
            const b = c.getBoundingClientRect();
            if (b.left < rb.left - 1 || b.right > rb.right + 1) clipped.push(c.textContent);
            if (b.height > parseFloat(getComputedStyle(c).lineHeight) * 1.5) oneLine.push(c.textContent);
          }
        }
        // fill px vs share x track px (rows 0..3 have fills)
        const fillErr = rows.slice(0, 4).map((row) => {
          const fill = row.querySelector("[style*='width']");
          const track = fill.parentElement;
          const want = (parseFloat(fill.style.width) / 100) * track.getBoundingClientRect().width;
          return Math.abs(fill.getBoundingClientRect().width - Math.max(want, 2));
        });
        return { clipped, oneLine, maxFillErr: Math.max(...fillErr), rows: rows.length };
      });
      check(`${tag}/${set}: every figure inside its row`, fig.clipped.length === 0, fig.clipped.join(","));
      check(`${tag}/${set}: every figure on one line`, fig.oneLine.length === 0, fig.oneLine.join(","));
      check(`${tag}/${set}: fill width within 1px of share x track`, fig.maxFillErr <= 1, String(fig.maxFillErr));

      const zero = await page.locator(`#${set}-zero`).evaluate((card) => ({
        fills: card.querySelectorAll("[style*='width']").length,
        dashes: (card.textContent.match(/—/g) ?? []).length,
        hasNames: card.textContent.includes("Classe 1") && card.textContent.includes("Ainda sem mapa"),
        leaks: card.textContent.includes("0,00") || card.textContent.includes("0,0%"),
      }));
      check(`${tag}/${set}: nothing-yet shows names, dashes, no bars`, zero.fills === 0 && zero.hasNames && zero.dashes === 9 && !zero.leaks, JSON.stringify(zero));

      const none = await page.locator(`#${set}-none`).textContent();
      check(`${tag}/${set}: no-items shows a dash and a spoken reason`, none.includes("—") && none.includes("Sem valores"), none);

      const ax = await page.evaluate(async (sel) => {
        const r = await window.axe.run(document.querySelector(sel));
        return r.violations.map((x) => `${x.id}:${x.nodes.length}`);
      }, `#${set}`);
      check(`${tag}/${set}: axe 0 violations (incl. colour contrast)`, ax.length === 0, ax.join(","));

      await page.locator(`#${set}`).screenshot({ path: join(FRAMES, `${tag}-${set}.png`) });
    }

    // the long label wraps without pushing its figures off the row (390 only is tight).
    const wrap = await page.locator("#yellow-normal").evaluate((card) => {
      const row = [...card.querySelectorAll("[role=row]")][3];
      const name = row.querySelector("[role=rowheader]").getBoundingClientRect();
      const amount = row.querySelector("[role=cell]").getBoundingClientRect();
      return name.right <= amount.left + 1;
    });
    check(`${tag}: a long label never overlaps the figures`, wrap);

    // present in the table for assistive tech: a real accessible table with the figures.
    const a11y = await page.getByRole("table", { name: "Packout by class" }).first().innerText();
    check(`${tag}: the figures are in the accessible table`, a11y.includes("412,50 kg") && a11y.includes("62,3%"), a11y);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
  rmSync(OUT, { recursive: true, force: true });
}
console.log(failures.length === 0 ? "\nALL PASS" : `\n${failures.length} FAILED: ${failures.join(" | ")}`);
process.exit(failures.length === 0 ? 0 : 1);
