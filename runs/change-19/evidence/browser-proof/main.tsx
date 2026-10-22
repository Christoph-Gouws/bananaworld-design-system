// CR-DESIGN-SYSTEM-021 — browser proof page: the REAL Keypad, ActionTile and ListCard from src/, nothing stubbed.
// This page IS the state gallery of request item (4): the kit has no gallery tooling.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { PackageCheck, PackageMinus, UserPlus } from "lucide-react";

import { ActionTile, Keypad, ListCard } from "../../../../src";

function LivePad() {
  const [v, setV] = useState("");
  return <Keypad id="pad-live" value={v} onChange={setV} label="Standard Crate" target={40} />;
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 24 }}>
      <h2 className="mb-2 text-sm font-semibold text-fg-muted">{title}</h2>
      {children}
    </section>
  );
}

function App() {
  return (
    <main data-surface="tablet" className="bg-bg p-4 text-fg" style={{ maxWidth: 1024 }}>
      <Section id="figures" title="Figure cards (ListCard composition, no FigureTile)">
        <div className="grid grid-cols-2 gap-2">
          <ListCard density="card">
            <div className="text-sm text-fg-muted">Crates with clients</div>
            <div className="text-3xl font-semibold tabular-nums">128</div>
            <div className="text-sm text-fg-subtle">across 9 clients</div>
          </ListCard>
          <ListCard density="card">
            <div className="text-sm text-fg-muted">Crates on the floor</div>
            <div className="text-3xl font-semibold tabular-nums">412</div>
            <div className="text-sm text-fg-subtle">counted today</div>
          </ListCard>
        </div>
      </Section>

      <Section id="tiles" title="Tiles, three across">
        <div id="tiles-grid" className="grid grid-cols-3 gap-2">
          <ActionTile icon={PackageMinus} label="Crates out" variant="primary" hint="To a client" />
          <ActionTile icon={PackageCheck} label="Crates in" count={3} />
          <ActionTile icon={UserPlus} label="New client" href="#new-client" />
        </div>
        <div id="tiles-grid-2" className="mt-2 grid grid-cols-3 gap-2">
          <ActionTile icon={PackageCheck} label="Disabled tile" disabled />
          <ActionTile icon={PackageMinus} label="Badge on a long label wraps" count={12} />
          <ActionTile icon={UserPlus} label="Link disabled" href="#x" disabled />
        </div>
      </Section>

      <Section id="pads" title="Keypad states">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <Keypad id="pad-empty" value="" onChange={() => {}} label="Empty" />
          <Keypad id="pad-typed" value="35" onChange={() => {}} label="Typed" target={40} />
          <Keypad id="pad-max" value="9999" onChange={() => {}} label="At max" />
          <Keypad id="pad-disabled" value="12" onChange={() => {}} label="Disabled" disabled />
          <LivePad />
        </div>
      </Section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
