// CR-DESIGN-SYSTEM-013 — the browser proof page. It renders the REAL package components, imported from
// this repo's `src/` exactly as a consumer imports them from the package root. Nothing is stubbed: no
// page, no component, no router. The data is local (there is no network in a design-system package).
import { useState, type ReactElement } from "react";
import { createRoot } from "react-dom/client";

import {
  DataTableToolbar,
  GridFilterRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useTableControls,
  type FilterDef,
  type GridFilterValues,
} from "../../../../src";
import "./.out/proof.css";

const BATCHES = ["001", "002", "003", "004", "005", "006"].map((n) => ({
  id: `SBF-2610-${n}`,
  label: `SBF-2610-${n}`,
}));

function GridDemo(): ReactElement {
  const [values, setValues] = useState<GridFilterValues>({});
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 className="mb-2 text-sm font-semibold text-fg">Report grid — filter row under the headers</h2>
      <div style={{ width: 560 }}>
        <Table density="compact">
          <TableHeader>
            <TableRow>
              <TableHead>Batch (allTicked)</TableHead>
              <TableHead>Batch (default)</TableHead>
            </TableRow>
            <GridFilterRow
              columns={[
                {
                  key: "batch",
                  kind: "select",
                  multiple: true,
                  selectAll: "allTicked",
                  label: "Batch",
                  placeholder: "All batches",
                  options: BATCHES,
                },
                {
                  key: "batchDefault",
                  kind: "select",
                  multiple: true,
                  label: "Batch default",
                  placeholder: "All batches",
                  options: BATCHES,
                },
              ]}
              values={values}
              onChange={setValues}
            />
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>—</TableCell>
              <TableCell>—</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <pre data-testid="grid-value" className="mt-2 text-xs text-fg-muted">
        {JSON.stringify(values)}
      </pre>
    </section>
  );
}

interface Lot {
  readonly id: string;
  readonly batch: string | null;
}
const LOTS: readonly Lot[] = [
  ...BATCHES.map((b, i) => ({ id: String(i), batch: b.id })),
  { id: "blank", batch: null },
];
const FILTERS: readonly FilterDef<Lot>[] = [
  { kind: "multiSelect", key: "batch", label: "Batches", accessor: (l) => l.batch, selectAll: "allTicked" },
];

function ToolbarDemo(): ReactElement {
  const controls = useTableControls(LOTS, { filters: FILTERS });
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-fg">List toolbar — the same tick-list</h2>
      <DataTableToolbar controls={controls} />
      <ul aria-label="rows" className="mt-3 text-sm text-fg">
        {controls.visible.map((l) => (
          <li key={l.id}>{l.batch ?? "— (no batch recorded)"}</li>
        ))}
      </ul>
    </section>
  );
}

function Page(): ReactElement {
  return (
    <div data-surface="browser" className="bg-bg p-6 font-sans text-fg" style={{ minHeight: "100vh" }}>
      <GridDemo />
      <ToolbarDemo />
    </div>
  );
}

const root = document.getElementById("root");
if (root !== null) createRoot(root).render(<Page />);
