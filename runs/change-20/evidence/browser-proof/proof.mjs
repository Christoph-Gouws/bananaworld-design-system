// CR-DESIGN-SYSTEM-022 — drive the REAL kit Link waiting ring in a REAL browser (Edge), desktop and tablet.
// For each of five link shapes: every child of the anchor, the anchor and the next sibling must have an
// identical bounding box idle vs waiting, and the ring must be visible (layout A: just after the words).
// Same harness as runs/change-19/evidence/browser-proof/proof.mjs (bananaworld-dc modules read-only).
// Usage (package root):  node runs/change-20/evidence/browser-proof/proof.mjs [tag]   (tag names the frames)
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-20/evidence/browser-proof");
const OUT = join(HERE, ".out");
const TAG = process.argv[2] ?? "after";
const FRAMES = join(ROOT, "runs/change-20/evidence/frames", TAG === "after" ? "" : TAG);
const DC = "d:/Projects/Team Builder/teams/AI Dev Team 6/projects/bananaworld-dc";
const TW_CLI = join(DC, "node_modules/.pnpm/tailwindcss@3.4.19_yaml@2.9.0/node_modules/tailwindcss/lib/cli.js");
const PW = join(DC, "node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core");
const VITE = join(ROOT, "node_modules/.pnpm/vite@8.1.5_@types+node@26.1.1/node_modules/vite/dist/node/index.js");

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
  resolve: { alias: { "next/link": join(ROOT, "tests/components/fixtures/next-link-mock.tsx") } },
  server: { port: 5198, strictPort: true, fs: { allow: [ROOT] } },
});
await server.listen();

const failures = [];
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
  if (!ok) failures.push(name);
}

// Boxes of the anchor, each of its children (the ring excluded), and the next sibling of its section.
const BOXES = (sel) =>
  {
    const r = (e) => {
      const b = e.getBoundingClientRect();
      return [b.x, b.y, b.width, b.height].map((n) => Math.round(n * 100) / 100);
    };
    const a = document.querySelector(`${sel} a`);
    return {
      anchor: r(a),
      children: [...a.children].filter((c) => !c.hasAttribute("data-link-pending")).map(r),
      next: r(document.querySelector(`${sel} [data-next]`)),
    };
  };

const { chromium } = createRequire(join(PW, "package.json"))(PW);
const browser = await chromium.launch({ channel: "msedge" });
try {
  for (const [width, height, surface] of [[1280, 800, "desktop"], [820, 1100, "tablet"]]) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto("http://localhost:5198/");
    await page.addStyleTag({ content: css });
    await page.locator("#s1 a").waitFor();
    if (surface === "desktop") await page.evaluate(() => document.querySelector("main").setAttribute("data-surface", "browser"));

    let n = 0;
    for (const [id, name] of [["s1", "inline text link"], ["s2", "flex icon + label"], ["s3", "flex label + badge"], ["s4", "block, two block children"], ["s5", "ActionTile with href"]]) {
      n += 1;
      const idle = await page.evaluate(BOXES, `#${id}`);
      await page.evaluate((h) => window.__setPending(h, true), `/${id}`);
      await page.waitForTimeout(260); // past the 150 ms delay
      const mark = page.locator(`#${id} [data-link-pending]`);
      check(`${surface} ${name}: ring is shown`, await mark.count(), 1);
      const waiting = await page.evaluate(BOXES, `#${id}`);
      check(`${surface} ${name}: anchor, every child and the next sibling do not move`, waiting, idle);

      // The ring is visible and sits just after the link's words (layout A): within 2px of the target.
      const ring = await mark.locator("> span").boundingBox();
      check(`${surface} ${name}: ring is drawn (non-zero, in the viewport)`, !!ring && ring.width >= 12 && ring.x >= 0, true);
      if (id === "s2" || id === "s3") {
        const word = await page.evaluate((sel) => {
          const span = document.querySelector(`${sel} a span:not([data-box]):not([data-link-pending])`);
          const range = document.createRange();
          range.selectNodeContents(span.firstChild);
          const b = range.getBoundingClientRect();
          return { right: b.right, mid: b.top + b.height / 2 };
        }, `#${id}`);
        // The ring spins, so its box wobbles; its centre does not. Ring = 12px (16px on the tablet surface).
        const size = surface === "tablet" ? 16 : 12;
        check(`${surface} ${name}: ring starts 4px after the word (+-2)`, Math.abs(ring.x + ring.width / 2 - (word.right + 4 + size / 2)) <= 2, true);
        check(`${surface} ${name}: ring is vertically centred on the word (+-2)`, Math.abs(ring.y + ring.height / 2 - word.mid) <= 2, true);
      }
      await page.screenshot({ path: join(FRAMES, `${surface}-${n}-${id}-waiting.png`), clip: await page.locator(`#${id}`).boundingBox() });
      await page.evaluate((h) => window.__setPending(h, false), `/${id}`);
      await page.waitForTimeout(60);
      check(`${surface} ${name}: ring gone when it lands`, await mark.count(), 0);
      await page.screenshot({ path: join(FRAMES, `${surface}-${n}-${id}-idle.png`), clip: await page.locator(`#${id}`).boundingBox() });
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  await server.close();
  rmSync(OUT, { recursive: true, force: true });
}
console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASS");
process.exit(failures.length ? 1 : 0);
