// CR-DESIGN-SYSTEM-035 — drive the REAL StatTile tones / linkLabel / labelCase, AttentionList and CountBadge in
// a REAL browser (Edge): packhouse teal and the DC's yellow, 1440 and 390 wide, browser and tablet surfaces,
// with measurements and axe (incl. colour contrast). Tailwind and playwright-core come from `pnpm dlx`.
// Usage (package root):
//   pnpm dlx --package=playwright-core@1.60.0 --package=tailwindcss@3.4.19 node runs/change-33/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-33/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-33/evidence/frames");
const VITE = join(ROOT, "node_modules/.pnpm/vite@8.1.5_@types+node@26.6.6/node_modules/vite/dist/node/index.js");
const AXE = join(ROOT, "node_modules/axe-core/axe.min.js");

const dlxModules = process.env.PATH.split(delimiter)
  .filter((p) => p.endsWith(join("node_modules", ".bin")))
  .map((p) => dirname(p))
  .find((m) => existsSync(join(m, "playwright-core")) && existsSync(join(m, "tailwindcss")));
if (!dlxModules) throw new Error("run through: pnpm dlx --package=playwright-core@1.60.0 --package=tailwindcss@3.4.19 node <this file>");
const TW_CLI = join(dlxModules, "tailwindcss/lib/cli.js");
const PW = join(dlxModules, "playwright-core");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(FRAMES, { recursive: true });

writeFileSync(
  join(OUT, "input.css"),
  `${readFileSync(join(ROOT, "src/lib/tokens.css"), "utf8")}\n${readFileSync(join(ROOT, "src/lib/themes/packhouse.css"), "utf8")}\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
);
execFileSync(process.execPath, [TW_CLI, "-c", join(HERE, "tailwind.config.cjs"), "-i", join(OUT, "input.css"), "-o", join(OUT, "proof.css")], { stdio: "pipe" });
mkdirSync(join(HERE, "public"), { recursive: true });
const css = readFileSync(join(OUT, "proof.css"), "utf8");
writeFileSync(join(HERE, "public/proof.css"), css);

const vite = await import(pathToFileURL(VITE).href);
const react = (await import("@vitejs/plugin-react")).default;
const server = await vite.createServer({
  root: HERE,
  configFile: false,
  plugins: [react()],
  cacheDir: join(OUT, "vite-cache"),
  logLevel: "error",
  resolve: { alias: { "next/link": join(HERE, "next-link-stub.tsx") } },
  server: { port: 5198, strictPort: true, fs: { allow: [ROOT] } },
});
await server.listen();

const failures = [];
let passes = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  — ${detail}`}`);
  if (ok) passes += 1;
  else failures.push(name);
}

const { chromium } = createRequire(join(PW, "package.json"))(PW);
const browser = await chromium.launch({ channel: "msedge" });
// Every rule runs except `region`, including label-content-name-mismatch and colour contrast.
const axeOf = async (page, label) => {
  await page.addScriptTag({ path: AXE });
  const v = await page.evaluate(async () => (await window.axe.run(document.body, { rules: { region: { enabled: false } } })).violations.map((x) => `${x.id}:${x.nodes.map((n) => n.target.join(" ") + " " + n.html.slice(0, 160)).join("|")}`));
  check(`${label}: axe 0 violations (incl. colour contrast)`, v.length === 0, v.join(","));
};
async function open(w, h, query) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:5198/?${query}`);
  await page.getByRole("heading", { name: "Needs your attention" }).waitFor();
  return page;
}
const shot = (page, name) => page.screenshot({ path: join(FRAMES, `${name}.png`), fullPage: true });

try {
  // Tailwind generated every new arbitrary class (R1).
  for (const t of ["warning", "danger", "success"]) {
    check(`Tailwind 3.4 emitted the ${t} color-mix border and fill`, css.includes(`var(--color-${t})_50%`.replace(/_/g, " ").replace("var(--color-" + t + ") 50%", "var(--color-" + t + ") 50%")) || css.includes(`color-mix(in srgb, var(--color-${t}) 50%, var(--color-surface))`));
  }
  check("Tailwind 3.4 emitted min-[480px]:inline-flex", /min-\\\[480px\\\]\\:inline-flex/.test(css) && css.includes("min-width: 480px"));

  for (const [theme, tag] of [["packhouse", "teal"], ["", "yellow"]]) {
    const q = (extra = "") => `${theme ? `theme=${theme}&` : ""}${extra}`;
    for (const [surface, sTag] of [["", "browser"], ["tablet", "tablet"]]) {
      const base = q(surface ? `surface=${surface}` : "");
      const page = await open(1440, 900, base);
      const label = `${tag} ${sTag} 1440`;

      // tones: computed border / fill differ from default and are tinted
      const colours = await page.evaluate(() => {
        const rows = ["row-readonly", "row-linked"];
        return rows.map((r) => [...document.querySelectorAll(`[data-testid=${r}] > *`)].map((el) => { const s = getComputedStyle(el); return { border: s.borderTopColor, bg: s.backgroundColor }; }));
      });
      for (const row of colours) {
        const [def, warn, dang, succ] = row;
        check(`${label}: default tile keeps surface fill and border`, def.bg !== warn.bg && def.border !== warn.border);
        check(`${label}: warning/danger/success each have their own border and fill`, new Set([warn.bg, dang.bg, succ.bg]).size === 3 && new Set([warn.border, dang.border, succ.border]).size === 3, JSON.stringify(row));
      }
      // exact color-mix probe
      const probe = await page.evaluate(() => {
        const mk = (c) => { const d = document.createElement("div"); d.style.cssText = `border:1px solid ${c};background:${c}`; document.body.append(d); const s = getComputedStyle(d); const r = [s.backgroundColor, s.borderTopColor]; d.remove(); return r; };
        const tile = (t) => { const el = document.querySelectorAll("[data-testid=row-readonly] > *")[t]; const s = getComputedStyle(el); return [s.backgroundColor, s.borderTopColor]; };
        return { warn: [tile(1), mk("color-mix(in srgb, var(--color-warning) 50%, var(--color-surface))"), mk("color-mix(in srgb, var(--color-warning-subtle) 40%, var(--color-surface))")] };
      });
      check(`${label}: warning border equals color-mix(warning 50%, surface); fill equals color-mix(warning-subtle 40%, surface)`, probe.warn[0][1] === probe.warn[1][1] && probe.warn[0][0] === probe.warn[2][0], JSON.stringify(probe));

      // danger value red, warning value not
      const vals = await page.evaluate(() => [...document.querySelectorAll("[data-testid=row-readonly] > *")].map((el) => getComputedStyle(el.querySelector(".tabular-nums")).color));
      check(`${label}: only the danger tile's value is red`, vals[2] !== vals[0] && vals[1] === vals[0] && vals[3] === vals[0], vals.join(" | "));

      // normal case vs upper
      const tt = await page.evaluate(() => ({ up: getComputedStyle(document.querySelector("[data-testid=row-readonly] p > span")).textTransform, nm: getComputedStyle(document.querySelector("[data-testid=row-linked] p > span")).textTransform }));
      check(`${label}: label upper by default, normal when asked`, tt.up === "uppercase" && tt.nm === "none", JSON.stringify(tt));

      // foot labels line up and sit inside the one link
      const feet = await page.evaluate(() => [...document.querySelectorAll("[data-testid=row-linked] > a")].map((a) => { const f = [...a.querySelectorAll("span")].find((s) => s.textContent === "Cold rooms" && s.className.includes("mt-auto")); const ar = a.getBoundingClientRect(); const fr = f.getBoundingClientRect(); return { bottomGap: Math.round(ar.bottom - fr.bottom), inside: a.contains(f), links: a.querySelectorAll("a").length }; }));
      check(`${label}: the four foot labels sit at the same distance from the tile bottom (aligned)`, new Set(feet.map((f) => f.bottomGap)).size === 1 && feet.every((f) => f.inside), JSON.stringify(feet));

      // attention row: action visible at 1440, chip and rows
      const att = await page.evaluate(() => { const a = document.querySelector("[data-testid=attention] a"); const act = a.querySelector("span.hidden"); return { actionDisplay: getComputedStyle(act).display, rows: document.querySelectorAll("[data-testid=attention] li").length, rule: getComputedStyle(document.querySelectorAll("[data-testid=attention] li")[1]).borderTopWidth }; });
      check(`${label}: action label shown, 4 rows, hairline between rows`, att.actionDisplay !== "none" && att.rows === 4 && att.rule !== "0px", JSON.stringify(att));
      // count badges: 0 draws nothing
      const badges = await page.locator("[data-testid=attention] h2 > span").count();
      check(`${label}: count badges drawn for 3, 1, 12 and not for 0`, badges === 3, String(badges));

      // keyboard only
      await page.keyboard.press("Tab");
      const first = await page.evaluate(() => document.activeElement?.getAttribute("href"));
      check(`${label}: first Tab lands on the first tile link`, first === "/cold-default", String(first));
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      const nth = await page.evaluate(() => document.activeElement?.getAttribute("href"));
      check(`${label}: Tab order continues tile links then the plain tile link`, nth === "/b", String(nth));
      await page.keyboard.press("Tab");
      const rowFocus = await page.evaluate(() => { const el = document.activeElement; return { href: el?.getAttribute("href"), shadow: getComputedStyle(el).boxShadow }; });
      check(`${label}: Tab reaches the first attention row, with a visible focus ring`, rowFocus.href === "/waste" && rowFocus.shadow !== "none", JSON.stringify(rowFocus));

      await shot(page, `${tag}-${sTag}-1440`);
      await axeOf(page, label);
      await page.context().close();

      // phone
      const phone = await open(390, 844, base);
      const lbl = `${tag} ${sTag} 390`;
      const w = await phone.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      check(`${lbl}: no horizontal scroll`, w.sw === w.iw, JSON.stringify(w));
      const hidden = await phone.evaluate(() => getComputedStyle(document.querySelector("[data-testid=attention] span.hidden")).display);
      check(`${lbl}: attention action label hidden`, hidden === "none", hidden);
      await shot(phone, `${tag}-${sTag}-390`);
      await axeOf(phone, lbl);
      await phone.context().close();
    }
  }

  // 479 / 480 boundary
  const edge = async (width) => { const p = await open(width, 800, "theme=packhouse"); const d = await p.evaluate(() => getComputedStyle(document.querySelector("[data-testid=attention] span.hidden")).display); await p.context().close(); return d; };
  const d479 = await edge(479);
  const d480 = await edge(480);
  check("action label is display:none at 479 px and shown at 480 px", d479 === "none" && d480 !== "none", `${d479} / ${d480}`);
} finally {
  await browser.close();
  await server.close();
}
console.log(`\n${failures.length ? "FAILED" : "ALL PASS"} — ${passes} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
