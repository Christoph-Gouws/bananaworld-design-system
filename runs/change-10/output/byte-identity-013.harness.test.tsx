/* eslint-disable */
// CR-DESIGN-SYSTEM-013 — byte-identity shapes THIS change could plausibly move, against main@26fa005.
// Throwaway: run once, counted in test-results.md, archived to runs/change-10/output/.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import * as Now from "../../src/components/Table";
import * as Was from "../../baseline-tmp/src/components/Table";
import { GridFilterRow as GridFilterRowNow } from "../../src/components/GridFilterRow";
import { GridFilterRow as GridFilterRowWas } from "../../baseline-tmp/src/components/GridFilterRow";
import {
  DataTableToolbar as ToolbarNow,
  useTableControls as useControlsNow,
} from "../../src/components/DataTableToolbar";
import {
  DataTableToolbar as ToolbarWas,
  useTableControls as useControlsWas,
} from "../../baseline-tmp/src/components/DataTableToolbar";

const normalise = (html: string): string => html.replace(/radix-[A-Za-z0-9_:-]+/g, "radix-ID");

const ROOMS = [
  { id: "cold-1", label: "Cold room 1" },
  { id: "cold-2", label: "Cold room 2" },
  { id: "ripening-3", label: "Ripening room 3" },
];

describe("CR-013 byte-identity", () => {
  it("a multi cell with selectAll absent or 'master' — every value state, incl. an exclusion it did not ask for", () => {
    const states: any[] = [
      {},
      { room: { kind: "select", value: "cold-1" } },
      { room: { kind: "select", value: "cold-1", values: ["cold-1", "cold-2"] } },
      { room: { kind: "select", value: "cold-1", values: ["cold-1", "cold-9"] } },
      { room: { kind: "select", value: "", excluded: ["cold-2"] } },
    ];
    let n = 0;
    const differed: string[] = [];
    for (const selectAll of [undefined, "master"] as const)
      for (const [i, values] of states.entries())
        for (const density of [undefined, "default", "compact"] as const)
          for (const multiple of [undefined, true, false] as const) {
            const columns: any = [
              { key: "room", kind: "select", multiple, selectAll, label: "Room", placeholder: "All rooms", options: ROOMS },
            ];
            const now = renderToStaticMarkup(
              <Now.Table density={density}>
                <Now.TableHeader>
                  <GridFilterRowNow columns={columns} values={values} onChange={() => undefined} />
                </Now.TableHeader>
              </Now.Table>,
            );
            const was = renderToStaticMarkup(
              <Was.Table density={density}>
                <Was.TableHeader>
                  <GridFilterRowWas columns={columns} values={values} onChange={() => undefined} />
                </Was.TableHeader>
              </Was.Table>,
            );
            n += 1;
            if (normalise(now) !== normalise(was)) differed.push(`sa=${String(selectAll)} v=${i} d=${String(density)} m=${String(multiple)}`);
          }
    expect(differed).toEqual([]);
    expect(n).toBe(90);
  });

  it("the toolbar's multiSelect with selectAll absent / 'allOption' / 'master' — the hoisted chrome renders the same", () => {
    const rows = [
      { id: "1", depot: "Cape Town" },
      { id: "2", depot: null },
    ];
    let n = 0;
    const differed: string[] = [];
    for (const selectAll of [undefined, "allOption", "master"] as const) {
      const filters: any = [{ kind: "multiSelect", key: "depot", label: "Depots", accessor: (r: any) => r.depot, selectAll }];
      function A() {
        return <ToolbarNow controls={useControlsNow(rows, { filters })} />;
      }
      function B() {
        return <ToolbarWas controls={useControlsWas(rows, { filters })} />;
      }
      n += 1;
      if (normalise(renderToStaticMarkup(<A />)) !== normalise(renderToStaticMarkup(<B />))) differed.push(String(selectAll));
    }
    expect(differed).toEqual([]);
    expect(n).toBe(3);
  });
});
