// CR-DESIGN-SYSTEM-028 — browser proof page. Renders the REAL kit TruckDiagram imported from this repo's
// `src/` as a consumer would. Drop 2 (last drop) is at the cab, drop 1 (first drop) by the doors.
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";

import { TruckDiagram, type TruckSlot } from "../../../../src";
import "./.out/proof.css";

const range = (from: number, to: number, make: (p: number) => TruckSlot): TruckSlot[] =>
  Array.from({ length: to - from + 1 }, (_, i) => make(from + i));

const SHARED: TruckSlot[] = [
  ...range(1, 6, (p) => ({ position: p, state: "taken", drop: 2 })),
  ...range(7, 20, (p) => ({ position: p, state: p === 12 ? "selected" : "filled", label: `1INC2546-${String(p).padStart(2, "0")}`, drop: 1 })),
  ...range(21, 30, (p) => ({ position: p, state: "empty", drop: 1 })),
];
const THREE: TruckSlot[] = [
  ...range(1, 3, (p) => ({ position: p, state: "taken", drop: 3 })),
  ...range(4, 7, (p) => ({ position: p, state: "filled", label: `P${p}`, drop: 2 })),
  ...range(8, 10, (p) => ({ position: p, state: "filled", label: `P${p}`, drop: 1 })),
];
const BIG: TruckSlot[] = range(1, 34, (p) => ({ position: p, state: "filled", label: `PLT-${p}` }));
const PT = {
  frontLabel: "Cabine",
  backLabel: "Portas",
  words: { taken: "Ocupado", empty: "Vazio", selected: "Escolhido", position: "Posição" },
  dropLabel: (d: number, end: "cab" | "doors" | null) =>
    end === "cab" ? `Entrega ${d} · descarregada por último` : end === "doors" ? `Entrega ${d} · descarregada primeiro` : `Entrega ${d}`,
};

function Set({ id, theme }: { id: string; theme?: string }): ReactElement {
  return (
    <div id={id} data-theme={theme} className="bg-bg p-3 font-sans text-fg">
      <div id={`${id}-shared`} className="mb-6">
        <TruckDiagram frontLabel="Cab" backLabel="Doors" positions={30} standardPositions={30} slots={SHARED} onSlotTap={(p) => ((window as unknown as { __taps: number[] }).__taps ??= []).push(p)} />
      </div>
      <div id={`${id}-three`} className="mb-6">
        <TruckDiagram frontLabel="Cab" backLabel="Doors" positions={10} slots={THREE} />
      </div>
      <div id={`${id}-big`} className="mb-6">
        <TruckDiagram frontLabel="Cab" backLabel="Doors" positions={34} standardPositions={30} slots={BIG} />
      </div>
      <div id={`${id}-odd`} className="mb-6">
        <TruckDiagram frontLabel="Cab" backLabel="Doors" positions={23} slots={[]} />
      </div>
      <div id={`${id}-pt`}>
        <TruckDiagram {...PT} positions={12} slots={[...range(1, 4, (p) => ({ position: p, state: "taken", drop: 2 })), ...range(5, 8, (p) => ({ position: p, state: "filled", label: `PALETE-MUITO-LONGA-${p}`, drop: 1 }))]} />
      </div>
    </div>
  );
}

function Page(): ReactElement {
  return (
    <div data-surface={new URLSearchParams(location.search).get("surface") ?? "browser"}>
      <Set id="yellow" />
      <Set id="teal" theme="packhouse" />
    </div>
  );
}

const root = document.getElementById("root");
if (root !== null) createRoot(root).render(<Page />);
