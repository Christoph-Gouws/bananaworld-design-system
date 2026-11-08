// CR-DESIGN-SYSTEM-029 — drive the REAL TruckDiagram (default vs density="compact") in a REAL browser
// (Edge). Same method as CR-028: Tailwind and playwright-core are loaded READ-ONLY from bananaworld-dc.
// Usage (package root):  node runs/change-27/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-27/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-27/evidence/frames");
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
const url = (q) => `http://localhost:5199/?${new URLSearchParams(q)}`;
async function open(w, q, media) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(url(q));
  await page.getByText("Drop 2 · unloaded last").first().waitFor();
  if (media) await page.emulateMedia({ media });
  return page;
}
const shot = async (page, name) => (await page.locator("#set").screenshot({ path: join(FRAMES, name) }));
const measure = (page) =>
  page.locator("#set-shared").evaluate((root) => {
    const rects = [...root.querySelectorAll("li")].map((li) => li.firstElementChild.getBoundingClientRect());
    const box = root.getBoundingClientRect();
    const txt = root.textContent;
    return {
      count: rects.length,
      minH: Math.min(...rects.map((r) => r.height)),
      maxH: Math.max(...rects.map((r) => r.height)),
      minW: Math.min(...rects.map((r) => r.width)),
      total: box.height,
      inside: rects.every((r) => r.left >= box.left - 1 && r.right <= box.right + 1),
      order: txt.indexOf("Cab") < txt.indexOf("Drop 2 · unloaded last") && txt.indexOf("Drop 2 · unloaded last") < txt.indexOf("Drop 1 · unloaded first") && txt.indexOf("Drop 1 · unloaded first") < txt.lastIndexOf("Doors"),
      takenNumbers: [...root.querySelectorAll("li")].filter((li) => li.textContent.includes("Taken") && /1INC/.test(li.textContent)).length,
      takenButtons: [...root.querySelectorAll("li")].filter((li) => li.textContent.includes("Taken") && li.querySelector("button")).length,
      scrollOk: document.documentElement.scrollWidth === innerWidth,
    };
  });
try {
  for (const w of [360, 390]) {
    for (const surface of ["browser", "tablet"]) {
      for (const theme of ["yellow", "teal"]) {
        const tag = `${w}/${surface}/${theme}`;
        const d = await open(w, { surface, theme });
        const def = await measure(d);
        await d.close();
        const page = await open(w, { surface, theme, density: "compact" });
        await page.addScriptTag({ path: AXE });
        const c = await measure(page);
        check(`${tag}: compact spaces 40px (under 48), default stays ${surface === "tablet" ? 56 : 48}`, c.minH >= 39.5 && c.minH < 48 && def.minH >= (surface === "tablet" ? 56 : 48) - 0.5, JSON.stringify({ c, def }));
        check(`${tag}: spaces at least 48px wide, two across, inside the picture, no sideways scroll`, c.minW >= 48 && c.inside && c.scrollOk && c.count === 30, JSON.stringify(c));
        check(`${tag}: Cab, drop 2, drop 1, Doors in order; taken shows no number and is no button`, c.order && c.takenNumbers === 0 && c.takenButtons === 0, JSON.stringify(c));
        check(`${tag}: truck much shorter than default (${Math.round(c.total)} vs ${Math.round(def.total)})`, c.total < def.total * 0.8, JSON.stringify({ c, def }));
        const big = await page.locator("#set-big").evaluate((root) => ({ warn: root.textContent.includes("More than a standard truck"), count: root.querySelectorAll("li").length }));
        check(`${tag}: past-30 warning kept`, big.warn && big.count === 34, JSON.stringify(big));
        const ax = await page.evaluate(async () => (await window.axe.run(document.querySelector("#set"))).violations.map((x) => `${x.id}:${x.nodes.length}`));
        check(`${tag}: axe 0 violations (incl. contrast)`, ax.length === 0, ax.join(","));
        await page.getByRole("button", { name: /^Position 8 / }).first().click();
        const taps = await page.evaluate(() => window.__taps);
        check(`${tag}: a tap on a 40px space reports its position`, taps[0] === 8, JSON.stringify(taps));
        if (surface === "tablet") await shot(page, `compact-${w}-${theme}.png`);
        await page.close();
      }
    }
  }
  // Default frame for the side-by-side
  const p0 = await open(390, { surface: "tablet", theme: "teal" });
  await shot(p0, "default-390-teal.png");
  await p0.close();

  // From 640 px up, compact must look exactly like default: pixel-identical.
  for (const w of [768, 1440]) {
    const a = await open(w, { surface: w === 768 ? "tablet" : "browser", theme: "teal" });
    const b = await open(w, { surface: w === 768 ? "tablet" : "browser", theme: "teal", density: "compact" });
    const [ba, bb] = [await a.locator("#set").screenshot(), await b.locator("#set").screenshot()];
    check(`${w}: compact is pixel-identical to default`, ba.equals(bb), `${ba.length} vs ${bb.length}`);
    await a.close();
    await b.close();
  }
  // Print at A4 width: identical.
  {
    const a = await open(794, { surface: "browser" }, "print");
    const b = await open(794, { surface: "browser", density: "compact" }, "print");
    const [ba, bb] = [await a.locator("#set").screenshot(), await b.locator("#set").screenshot()];
    check("print A4: compact is pixel-identical to default", ba.equals(bb), `${ba.length} vs ${bb.length}`);
    await a.close();
    await b.close();
  }
} finally {
  await browser.close();
  await server.close();
  rmSync(OUT, { recursive: true, force: true });
}
console.log(failures.length === 0 ? "\nALL PASS" : `\n${failures.length} FAILED: ${failures.join(" | ")}`);
process.exit(failures.length === 0 ? 0 : 1);
