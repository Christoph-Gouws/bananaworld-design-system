// CR-DESIGN-SYSTEM-015 — real-browser cascade proof for the opt-in packhouse theme.
// Loads the package's real tokens.css + themes/packhouse.css in Edge (through bananaworld-dc's
// playwright-core, READ-ONLY use) and reads computed styles. Frames go to ../frames/.
// Usage (package root):  node runs/change-12/evidence/browser-proof/proof.mjs
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const FRAMES = join(ROOT, "runs/change-12/evidence/frames");
const DC = process.env.DC_ROOT ?? "d:/Projects/Team Builder/teams/AI Dev Team 6/projects/bananaworld-dc";
const PW = join(DC, "node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core");
const tokens = readFileSync(join(ROOT, "src/lib/tokens.css"), "utf8");
const theme = readFileSync(join(ROOT, "src/lib/themes/packhouse.css"), "utf8");
mkdirSync(FRAMES, { recursive: true });

const TEAL = "#0f766e";
const failures = [];
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`}`);
  if (!ok) failures.push(name);
};

// A swatch page: a button styled with the accent tokens exactly as the kit's primary Button does.
const page = (htmlAttrs, bodyAttrs, order) => {
  const css = order === "theme-first" ? `${theme}\n${tokens}` : `${tokens}\n${theme}`;
  return `<!doctype html><html ${htmlAttrs}><head><style>${css}
body{font-family:sans-serif;padding:24px;background:var(--color-bg)}
.btn{background:var(--color-accent);color:var(--color-fg-on-accent);border:0;padding:10px 18px;border-radius:6px;font-size:15px}
.btn:hover{background:var(--color-accent-hover)} .btn:focus-visible{outline:none;box-shadow:var(--shadow-focus)}
.chip{display:inline-block;margin-left:12px;padding:6px 12px;background:var(--color-accent-subtle);border-radius:6px}
</style></head><body ${bodyAttrs}><button class="btn" id="b">Receive batch</button><span class="chip">Accent subtle</span>
<div id="inner" ${bodyAttrs ? "" : ""}></div></body></html>`;
};

const PROPS = ["--color-accent", "--color-accent-hover", "--color-accent-subtle", "--color-fg-on-accent", "--color-ring"];
const read = (p, sel) =>
  p.evaluate(
    ([s, props]) => {
      const cs = getComputedStyle(document.querySelector(s));
      return Object.fromEntries(props.map((n) => [n, cs.getPropertyValue(n).trim().toLowerCase()]));
    },
    [sel, PROPS],
  );

const { chromium } = createRequire(join(PW, "package.json"))(PW);
const browser = await chromium.launch({ channel: "msedge" });
try {
  const p = await browser.newPage({ viewport: { width: 520, height: 140 } });
  const load = (h, b, o = "tokens-first") => p.setContent(page(h, b, o));
  const isTeal = (v) => PROPS.map((n) => v[n]);
  const teal = [TEAL, "#0b5f58", "#d5f3ef", "#ffffff", TEAL];
  const halo = (sel) => p.evaluate((s) => getComputedStyle(document.querySelector(s)).getPropertyValue("--shadow-focus"), sel);

  await load("", 'data-surface="browser"');
  check("control: no attribute keeps today's yellow accent", (await read(p, "body"))["--color-accent"], "#fac80a");
  await p.screenshot({ path: join(FRAMES, "01-default-yellow.png") });

  await load('data-theme="packhouse"', 'data-surface="browser"');
  check("html attr + browser surface: five teal on body", isTeal(await read(p, "body")), teal);
  check("html attr + browser surface: halo is teal", (await halo("body")).toLowerCase().includes(TEAL), true);
  await p.focus("#b");
  await p.keyboard.press("Tab");
  await p.keyboard.press("Shift+Tab");
  await p.screenshot({ path: join(FRAMES, "02-packhouse-teal-browser.png") });

  await load('data-theme="packhouse"', 'data-surface="tablet"');
  check("html attr + tablet surface: five teal", isTeal(await read(p, "body")), teal);
  check("html attr + tablet surface: halo is teal", (await halo("body")).toLowerCase().includes(TEAL), true);
  check("tablet sizing untouched (--control-h-md)", (await p.evaluate(() => getComputedStyle(document.body).getPropertyValue("--control-h-md").trim())), "56px");
  await p.screenshot({ path: join(FRAMES, "03-packhouse-teal-tablet.png") });

  await load("", 'data-theme="packhouse" data-surface="browser"');
  check("attr on the body itself (same element as surface): five teal", isTeal(await read(p, "body")), teal);

  await load('data-theme="packhouse"', 'data-surface="browser"', "theme-first");
  check("theme imported BEFORE tokens.css: html teal", isTeal(await read(p, "html")), teal);
  check("theme imported BEFORE tokens.css: body teal", isTeal(await read(p, "body")), teal);

  await load("", 'data-theme="packhouse" data-surface="tablet"');
  const unsupported = (await halo("body")).toLowerCase();
  console.log(`RECORD  unsupported placement (attr on a tablet element, no themed ancestor): halo contains teal=${unsupported.includes(TEAL)}`);
  check("unsupported placement records the yellow halo (documented)", unsupported.includes(TEAL), false);
} finally {
  await browser.close();
}
if (failures.length) {
  console.log(`\n${failures.length} FAILED`);
  process.exit(1);
}
console.log("\nALL PASS");
