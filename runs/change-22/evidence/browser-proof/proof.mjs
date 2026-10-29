// CR-DESIGN-SYSTEM-024 — drive the REAL TablePagination (English default + Portuguese labels) in a REAL
// browser (Edge) at 1270 px and 375 px. Same harness as runs/change-21/evidence/browser-proof/proof.mjs
// (bananaworld-dc modules read-only).
// Usage (package root):  node runs/change-22/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-22/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-22/evidence/frames");
const DC = "d:/Projects/Team Builder/teams/AI Dev Team 6/projects/bananaworld-dc";
const TW_CLI = join(DC, "node_modules/.pnpm/tailwindcss@3.4.19_yaml@2.9.0/node_modules/tailwindcss/lib/cli.js");
const PW = join(DC, "node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core");
const VITE = join(ROOT, "node_modules/.pnpm/vite@8.1.5_@types+node@26.1.1/node_modules/vite/dist/node/index.js");
const AXE = join(ROOT, "node_modules/axe-core/axe.min.js");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(FRAMES, { recursive: true });

writeFileSync(
  join(OUT, "input.css"),
  `${readFileSync(join(ROOT, "src/lib/tokens.css"), "utf8")}\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
);
execFileSync(process.execPath, [TW_CLI, "-c", join(HERE, "tailwind.config.cjs"), "-i", join(OUT, "input.css"), "-o", join(OUT, "proof.css")], { stdio: "pipe" });
const css = readFileSync(join(OUT, "proof.css"), "utf8");

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
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
  if (!ok) failures.push(name);
}

const { chromium } = createRequire(join(PW, "package.json"))(PW);
const browser = await chromium.launch({ channel: "msedge" });
try {
  for (const [width, height, touch] of [[1270, 800, false], [375, 812, true]]) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage();
    await page.goto("http://localhost:5199/");
    await page.addStyleTag({ content: css });
    await page.locator("#portuguese").waitFor();
    const w = `${width}px`;
    const pt = page.locator("#portuguese");
    const en = page.locator("#english");

    check(`${w}: Portuguese status`, (await pt.getByRole("status").textContent()), "A mostrar 1–25 de 312");
    check(`${w}: English status unchanged`, (await en.getByRole("status").textContent()), "Showing 1–25 of 312");
    check(`${w}: Portuguese picker is named in Portuguese`, await pt.getByRole("combobox", { name: "Linhas por página" }).count(), 1);
    check(`${w}: Portuguese caption visible`, await pt.getByText("Linhas por página").isVisible(), true);
    check(`${w}: Anterior/Seguinte in both bars`, [await pt.getByRole("button", { name: "Anterior" }).count(), await pt.getByRole("button", { name: "Seguinte" }).count()], [2, 2]);
    check(`${w}: navigations named`, await pt.getByRole("navigation").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label"))), ["Paginação da lista", "Paginação da lista, fim da lista"]);
    check(`${w}: exactly one status and one picker`, [await pt.getByRole("status").count(), await pt.getByRole("combobox").count()], [1, 1]);
    check(`${w}: no English word in the Portuguese list`, /Showing|Rows per page|Previous|Next|List paging/.test(await pt.innerText()), false);
    check(`${w}: no horizontal scroll`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);

    // Press the real control from the BOTTOM bar; the top status must follow.
    const bottomNext = pt.getByRole("navigation").nth(1).getByRole("button", { name: "Seguinte" });
    await (touch ? bottomNext.tap() : bottomNext.click());
    check(`${w}: Seguinte pages the list`, await pt.getByRole("status").textContent(), "A mostrar 26–50 de 312");
    await page.screenshot({ path: join(FRAMES, `0${touch ? 2 : 1}-english-and-portuguese-${width}.png`), fullPage: true });

    await page.addScriptTag({ path: AXE });
    const violations = await page.evaluate(async () => (await window.axe.run(document.body)).violations.map((v) => v.id));
    check(`${w}: axe violations`, violations, []);
    await ctx.close();
  }
} finally {
  await browser.close();
  await server.close();
  rmSync(OUT, { recursive: true, force: true });
}
console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASS");
process.exit(failures.length ? 1 : 0);
