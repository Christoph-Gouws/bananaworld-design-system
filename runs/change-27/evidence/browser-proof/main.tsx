// CR-DESIGN-SYSTEM-029 — browser proof page. The REAL kit TruckDiagram from this repo's `src/`, once
// at the default density and once compact, in the same page, so the proof can compare them.
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";

import { TruckDiagram, type TruckSlot } from "../../../../src";
import "./.out/proof.css";

const range = (from: number, to: number, make: (p: number) => TruckSlot): TruckSlot[] =>
  Array.from({ length: to - from + 1 }, (_, i) => make(from + i));

const SHARED: TruckSlot[] = [
  ...range(1, 6, (p) => ({ position: p, state: "taken", drop: 2 })),
  ...range(7, 20, (p) => ({
    position: p,
    state: p === 12 ? "selected" : "filled",
    label: `1INC2546-${String(p).padStart(2, "0")}`,
    drop: 1,
  })),
  ...range(21, 30, (p) => ({ position: p, state: "empty", drop: 1 })),
];
const BIG: TruckSlot[] = range(1, 34, (p) => ({ position: p, state: "filled", label: `PLT-${p}` }));

function Set({ id, density, theme }: { id: string; density?: "compact"; theme?: string }): ReactElement {
  return (
    <div id={id} data-theme={theme} className="bg-bg p-3 font-sans text-fg">
      <div id={`${id}-shared`} className="mb-6">
        <TruckDiagram
          frontLabel="Cab"
          backLabel="Doors"
          positions={30}
          standardPositions={30}
          slots={SHARED}
          density={density}
          onSlotTap={(p) => ((window as unknown as { __taps: number[] }).__taps ??= []).push(p)}
        />
      </div>
      <div id={`${id}-big`}>
        <TruckDiagram
          frontLabel="Cab"
          backLabel="Doors"
          positions={34}
          standardPositions={30}
          slots={BIG}
          density={density}
        />
      </div>
    </div>
  );
}

function Page(): ReactElement {
  const q = new URLSearchParams(location.search);
  const theme = q.get("theme") === "teal" ? "packhouse" : undefined;
  const which = q.get("density") === "compact" ? "compact" : undefined;
  return (
    <div data-surface={q.get("surface") ?? "browser"}>
      <Set id="set" density={which} theme={theme} />
    </div>
  );
}

const root = document.getElementById("root");
if (root !== null) createRoot(root).render(<Page />);
