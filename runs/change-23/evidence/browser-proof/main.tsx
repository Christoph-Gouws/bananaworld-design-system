// CR-DESIGN-SYSTEM-025 — browser proof page. Renders the REAL kit BarChart imported from this repo's
// `src/` as a consumer would. Nothing stubbed. Three colour sets: default yellow, packhouse teal and a
// dark token fixture (no estate app defines dark tokens yet; this proves the component is token-only).
import type { ReactElement, ReactNode } from "react";
import { createRoot } from "react-dom/client";

import { BarChart } from "../../../../src";
import "./.out/proof.css";

const CLASSES = [
  { label: "Classe 1", value: 412.5, valueText: "412,50 kg", percentText: "62,3%" },
  { label: "Classe 2", value: 180, valueText: "180,00 kg", percentText: "27,2%" },
  { label: "Classe 3 (Refugo)", value: 8, valueText: "8,00 kg", percentText: "1,2%" },
  { label: "Ainda sem mapa", value: 61.5, valueText: "61,50 kg", percentText: "9,3%", tone: "warning" as const },
];
const ZEROS = CLASSES.map((c) => ({ ...c, value: 0, valueText: "0,00 kg", percentText: "0,0%" }));
const WORDS = { item: "Classe", amount: "Quantidade", share: "Parte", empty: "Sem valores" };

const DARK = {
  "--color-bg": "#18181b",
  "--color-surface": "#27272a",
  "--color-surface-sunken": "#3f3f46",
  "--color-border": "#52525b",
  "--color-fg": "#fafafa",
  "--color-fg-muted": "#d4d4d8",
  "--color-warning": "#fb923c",
  "--color-warning-fg": "#fdba74",
} as Record<string, string>;

function Card({ id, title, children }: { id: string; title: string; children: ReactNode }): ReactElement {
  return (
    <section id={id} className="mb-4 rounded-lg border border-border bg-surface p-4">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Set({ id, theme, style }: { id: string; theme?: string; style?: Record<string, string> }): ReactElement {
  return (
    <div id={id} data-theme={theme} style={style} className="bg-bg p-3 font-sans text-fg">
      <Card id={`${id}-normal`} title="Packout by class">
        <BarChart label="Packout by class" items={CLASSES} total={{ label: "Total embalado", valueText: "662,00 kg" }} words={WORDS} />
      </Card>
      <Card id={`${id}-zero`} title="Nothing packed yet">
        <BarChart label="Packout by class" items={ZEROS} total={{ label: "Total embalado", valueText: "0,00 kg" }} words={WORDS} />
      </Card>
      <Card id={`${id}-none`} title="No items">
        <BarChart label="Packout by size" items={[]} words={WORDS} />
      </Card>
    </div>
  );
}

function Page(): ReactElement {
  return (
    <div data-surface={new URLSearchParams(location.search).get("surface") ?? "browser"}>
      <Set id="yellow" />
      <Set id="teal" theme="packhouse" />
      <Set id="dark" style={DARK} />
    </div>
  );
}

const root = document.getElementById("root");
if (root !== null) createRoot(root).render(<Page />);
