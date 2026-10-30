// CR-DESIGN-SYSTEM-026 — browser proof page. Renders the REAL kit StatTile / StatTileRow imported from
// this repo's `src/` as a consumer would. Nothing stubbed except that `next/link` is the real package.
// Three colour sets: default yellow, packhouse teal and a dark token fixture.
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { Package, Scale, Trash2, Warehouse } from "lucide-react";

import { StatTile, StatTileRow } from "../../../../src";
import "./.out/proof.css";

const DARK = {
  "--color-bg": "#18181b",
  "--color-surface": "#27272a",
  "--color-surface-muted": "#3f3f46",
  "--color-border": "#52525b",
  "--color-border-strong": "#a1a1aa",
  "--color-fg": "#fafafa",
  "--color-fg-muted": "#d4d4d8",
  "--color-fg-subtle": "#a1a1aa",
} as Record<string, string>;

function Set({ id, theme, style }: { id: string; theme?: string; style?: Record<string, string> }): ReactElement {
  return (
    <div id={id} data-theme={theme} style={style} className="bg-bg p-3 font-sans text-fg">
      <div id={`${id}-four`} className="mb-4">
        <StatTileRow>
          <StatTile accent icon={<Scale />} label="Cachos entrados" value="1 240" sub="12 caídos" />
          <StatTile accent icon={<Package />} label="Paletes embaladas" value="156" unit="pal." sub="2 814,00 unidades de 18 kg" />
          <StatTile accent icon={<Trash2 />} label="Desperdício" value={null} words={{ empty: "Nada registado" }} />
          <StatTile accent icon={<Warehouse />} label="À espera nas câmaras frias" value="7" href="#waiting" sub="2 sem temperatura" />
        </StatTileRow>
      </div>
      <div id={`${id}-zero`} className="mb-4">
        <StatTileRow>
          <StatTile label="Desperdício" value="0" unit="kg" />
          <StatTile label="Embaladas" value="0" unit="pal." />
        </StatTileRow>
      </div>
      <div id={`${id}-three`}>
        <StatTileRow>
          <StatTile accent label="Um" value="1" />
          <StatTile accent label="Dois" value="2" />
          <StatTile accent label="Três" value="3" />
        </StatTileRow>
      </div>
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
