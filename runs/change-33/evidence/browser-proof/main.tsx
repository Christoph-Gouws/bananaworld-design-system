// CR-DESIGN-SYSTEM-035 proof page: the REAL StatTile (every tone, link label, normal case), AttentionList
// (all tones, with and without icon) and CountBadge. Query: ?theme=packhouse (teal; default DC yellow),
// ?surface=tablet (default browser).
import { createRoot } from "react-dom/client";
import { Snowflake, Scale, Trash2 } from "lucide-react";
import {
  AttentionItem,
  AttentionList,
  CountBadge,
  StatTile,
  StatTileRow,
} from "../../../../src";

const params = new URLSearchParams(location.search);
if (params.get("theme")) document.documentElement.dataset.theme = params.get("theme")!;
if (params.get("surface")) document.documentElement.dataset.surface = params.get("surface")!;

const TONES = ["default", "warning", "danger", "success"] as const;

function App() {
  return (
    <main style={{ padding: 16, maxWidth: 1100 }} className="space-y-6 bg-bg text-fg">
      <h1 className="text-xl font-bold">Stat tiles — read-only, upper case (today's look)</h1>
      <StatTileRow data-testid="row-readonly">
        {TONES.map((tone) => (
          <StatTile
            key={tone}
            tone={tone}
            icon={<Scale />}
            label={`Tone ${tone}`}
            value="156"
            unit="kg"
            sub="2 814,00 units"
          />
        ))}
      </StatTileRow>

      <h2 className="text-lg font-bold">Linked, normal case, with a link label</h2>
      <StatTileRow data-testid="row-linked">
        {TONES.map((tone) => (
          <StatTile
            key={tone}
            tone={tone}
            labelCase="normal"
            accent
            icon={<Snowflake />}
            label={`Cold rooms ${tone}`}
            value={tone === "danger" ? "12" : "7"}
            sub={tone === "warning" ? "Waiting 7 pallets at the dock for a long while" : "Waiting 7"}
            href={`/cold-${tone}`}
            linkLabel="Cold rooms"
          />
        ))}
      </StatTileRow>

      <h2 className="text-lg font-bold">Linked without link label (chevron as today), and a dash</h2>
      <StatTileRow data-testid="row-plain">
        <StatTile label="Bunches" value="5" href="/b" accent />
        <StatTile tone="danger" icon={<Trash2 />} label="Waste" value={null} sub="No shift opened" />
      </StatTileRow>

      <section className="rounded-lg border border-border bg-surface p-4" data-testid="attention">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
          Needs your attention <CountBadge count={3} tone="warning" />
          <CountBadge count={1} tone="danger" />
          <CountBadge count={12} />
          <CountBadge count={0} />
        </h2>
        <AttentionList aria-label="Needs your attention">
          <AttentionItem
            href="/waste"
            tone="danger"
            title="Waste is over the level"
            detail="Room 3 — 14 % today"
            actionLabel="Cold rooms"
          />
          <AttentionItem
            href="/aged"
            tone="warning"
            title="Pallets waiting more than 48 hours"
            detail="2 pallets"
            actionLabel="Waiting loads"
          />
          <AttentionItem
            href="/dev"
            title="A scale has not reported today"
            detail="Scale 2 — last seen yesterday"
            actionLabel="Devices"
          />
          <AttentionItem
            href="/icon"
            tone="warning"
            icon={<Snowflake />}
            title="With an icon in the chip"
            detail="Second line"
            actionLabel="Open"
          />
        </AttentionList>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
