/* eslint-disable */
// ============================================================================
// CR-DESIGN-SYSTEM-010 — BYTE-IDENTITY HARNESS
// ============================================================================
// 🔴 THE ADDITIVE CLAIM IS MEASURED, NOT ARGUED. Five apps pin this package by git sha and each bumps
//    when it chooses, so a caller that exists today must render the same bytes after this change.
//    Every prop shape an existing caller can pass is rendered against BOTH trees in one process — the
//    working `src/` and `baseline-tmp/src/`, which is `main@3143646` materialised by
//    `runs/change-09/output/byte-identity-setup.mjs` — and the whole markup is compared.
//
// ⚠ RADIX MINTS A FRESH `id` PER RENDER, so two renders of the SAME component differ on those ids
//   alone (CR-DESIGN-SYSTEM-009 handover, point 10). Only the generated portion is normalised.
//
// ⚠ THIS FILE IS NOT PART OF THE SHIPPED SUITE. It is run once, its counts are recorded in
//   `test-results.md`, and it is archived to `runs/change-09/output/` — it cannot run from there
//   because `baseline-tmp/` is deleted before the change is staged.
//
// EXPECTED DIFFERENCES, and nothing else: the three states the findings name.
//   1. a `<td>` given the LEGACY HTML `width` attribute        (F3 — it was swallowed, now forwarded)
//   2. a multi tick-list holding an id its options do not offer (F1 — under-counted, now counted)
//   3. the master row's own markup                              (F2 — only reachable with the menu open,
//                                                                    so it is asserted by the specs,
//                                                                    not here)
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";

import * as Now from "../../src/components/Table";
import * as Was from "../../baseline-tmp/src/components/Table";
import { GridFilterRow as GridFilterRowNow } from "../../src/components/GridFilterRow";
import { GridFilterRow as GridFilterRowWas } from "../../baseline-tmp/src/components/GridFilterRow";
import { GridHeadCell as GridHeadCellNow } from "../../src/components/GridHeadCell";
import { GridHeadCell as GridHeadCellWas } from "../../baseline-tmp/src/components/GridHeadCell";
import {
  DataTableToolbar as ToolbarNow,
  useTableControls as useControlsNow,
} from "../../src/components/DataTableToolbar";
import {
  DataTableToolbar as ToolbarWas,
  useTableControls as useControlsWas,
} from "../../baseline-tmp/src/components/DataTableToolbar";

/** Radix's per-render generated ids, and nothing else. */
function normalise(html: string): string {
  return html.replace(/radix-[A-Za-z0-9_:-]+/g, "radix-ID");
}

interface Shape {
  readonly name: string;
  readonly now: ReactElement;
  readonly was: ReactElement;
}

/** Renders both, compares whole markup, and returns the names that differed. */
function diff(shapes: readonly Shape[]): readonly string[] {
  const out: string[] = [];
  for (const s of shapes) {
    if (normalise(renderToStaticMarkup(s.now)) !== normalise(renderToStaticMarkup(s.was))) {
      out.push(s.name);
    }
  }
  return out;
}

const ALIGNS = [undefined, "left", "right", "center"] as const;
const VALIGNS = [undefined, "top", "middle", "bottom"] as const;
const WRAPS = [undefined, "wrap", "nowrap", "truncate"] as const;
const STEPS = [undefined, "narrow", "medium", "wide", "full"] as const;
const BOOLS = [undefined, true, false] as const;
const CLASSES = [undefined, "font-bold"] as const;
const DENSITIES = [undefined, "default", "compact"] as const;
const TABLE_WIDTHS = [undefined, "narrow", "medium", "wide", "full"] as const;

// ---------------------------------------------------------------------------------------------
// 1. The table family — the container, the table's three answers, the sections and the row.
// ---------------------------------------------------------------------------------------------
describe("byte-identity: the table family", () => {
  it("TableContainer / TableHeader / TableBody are untouched", () => {
    const shapes: Shape[] = [];
    for (const cls of CLASSES) {
      shapes.push({
        name: `TableContainer className=${String(cls)}`,
        now: <Now.TableContainer className={cls}>x</Now.TableContainer>,
        was: <Was.TableContainer className={cls}>x</Was.TableContainer>,
      });
      shapes.push({
        name: `TableHeader className=${String(cls)}`,
        now: (
          <table>
            <Now.TableHeader className={cls} />
          </table>
        ),
        was: (
          <table>
            <Was.TableHeader className={cls} />
          </table>
        ),
      });
      shapes.push({
        name: `TableBody className=${String(cls)}`,
        now: (
          <table>
            <Now.TableBody className={cls} />
          </table>
        ),
        was: (
          <table>
            <Was.TableBody className={cls} />
          </table>
        ),
      });
    }
    expect(diff(shapes)).toEqual([]);
    expect(shapes.length).toBe(6);
  });

  it("Table — every density × wrap × columnWidth", () => {
    const shapes: Shape[] = [];
    for (const density of DENSITIES)
      for (const wrap of WRAPS)
        for (const columnWidth of TABLE_WIDTHS)
          for (const cls of CLASSES) {
            const name = `Table d=${String(density)} w=${String(wrap)} cw=${String(columnWidth)} c=${String(cls)}`;
            shapes.push({
              name,
              now: (
                <Now.Table density={density} wrap={wrap} columnWidth={columnWidth} className={cls}>
                  <Now.TableBody>
                    <Now.TableRow>
                      <Now.TableCell>x</Now.TableCell>
                    </Now.TableRow>
                  </Now.TableBody>
                </Now.Table>
              ),
              was: (
                <Was.Table density={density} wrap={wrap} columnWidth={columnWidth} className={cls}>
                  <Was.TableBody>
                    <Was.TableRow>
                      <Was.TableCell>x</Was.TableCell>
                    </Was.TableRow>
                  </Was.TableBody>
                </Was.Table>
              ),
            });
          }
    expect(diff(shapes)).toEqual([]);
    expect(shapes.length).toBe(120);
  });

  it("TableRow — interactive × valign × className, and the CR-007 row/cell precedence surface", () => {
    const shapes: Shape[] = [];
    for (const interactive of BOOLS)
      for (const rowValign of VALIGNS)
        for (const cellValign of VALIGNS)
          for (const cls of CLASSES) {
            const name = `Row i=${String(interactive)} rv=${String(rowValign)} cv=${String(cellValign)} c=${String(cls)}`;
            shapes.push({
              name,
              now: (
                <Now.Table>
                  <Now.TableBody>
                    <Now.TableRow interactive={interactive} valign={rowValign} className={cls}>
                      <Now.TableCell valign={cellValign}>x</Now.TableCell>
                    </Now.TableRow>
                  </Now.TableBody>
                </Now.Table>
              ),
              was: (
                <Was.Table>
                  <Was.TableBody>
                    <Was.TableRow interactive={interactive} valign={rowValign} className={cls}>
                      <Was.TableCell valign={cellValign}>x</Was.TableCell>
                    </Was.TableRow>
                  </Was.TableBody>
                </Was.Table>
              ),
            });
          }
    expect(diff(shapes)).toEqual([]);
    expect(shapes.length).toBe(96);
  });
});

// ---------------------------------------------------------------------------------------------
// 2. TableCell — the interface F3 touched. Every shape that was EXPRESSIBLE before this change.
// ---------------------------------------------------------------------------------------------
describe("byte-identity: TableCell", () => {
  it("🔴 EVERY PRE-EXISTING PROP SHAPE IS UNMOVED — align × numeric × muted × valign × wrap × step × className", () => {
    const shapes: Shape[] = [];
    for (const align of ALIGNS)
      for (const numeric of [undefined, true] as const)
        for (const muted of [undefined, true] as const)
          for (const valign of VALIGNS)
            for (const wrap of WRAPS)
              for (const width of STEPS)
                for (const cls of CLASSES) {
                  const name = `Cell a=${String(align)} n=${String(numeric)} m=${String(muted)} v=${String(valign)} w=${String(wrap)} s=${String(width)} c=${String(cls)}`;
                  shapes.push({
                    name,
                    now: (
                      <Now.Table wrap="truncate">
                        <Now.TableBody>
                          <Now.TableRow>
                            <Now.TableCell
                              align={align}
                              numeric={numeric}
                              muted={muted}
                              valign={valign}
                              wrap={wrap}
                              width={width}
                              className={cls}
                            >
                              Item name
                            </Now.TableCell>
                          </Now.TableRow>
                        </Now.TableBody>
                      </Now.Table>
                    ),
                    was: (
                      <Was.Table wrap="truncate">
                        <Was.TableBody>
                          <Was.TableRow>
                            <Was.TableCell
                              align={align}
                              numeric={numeric}
                              muted={muted}
                              valign={valign}
                              wrap={wrap}
                              width={width}
                              className={cls}
                            >
                              Item name
                            </Was.TableCell>
                          </Was.TableRow>
                        </Was.TableBody>
                      </Was.Table>
                    ),
                  });
                }
    expect(diff(shapes)).toEqual([]);
    expect(shapes.length).toBe(2560);
  });

  it("🔴 THE LEGACY HTML `width` IS THE ONE EXPECTED DIFFERENCE (F3) — and it differs in the repaired direction", () => {
    // `TdHTMLAttributes.width` is `number | string`. Before this change the design-system step
    // swallowed it; after it, it reaches the `<td>` again. `as never` is how the BASELINE compiles at
    // all — that type error IS the finding, and it is what a consumer's own `tsc` hit at its pin bump.
    for (const legacy of [120, "120", "50%"] as const) {
      const now = renderToStaticMarkup(
        <Now.Table>
          <Now.TableBody>
            <Now.TableRow>
              <Now.TableCell width={legacy}>Qty</Now.TableCell>
            </Now.TableRow>
          </Now.TableBody>
        </Now.Table>,
      );
      const was = renderToStaticMarkup(
        <Was.Table>
          <Was.TableBody>
            <Was.TableRow>
              <Was.TableCell width={legacy as never}>Qty</Was.TableCell>
            </Was.TableRow>
          </Was.TableBody>
        </Was.Table>,
      );
      expect(now).not.toBe(was);
      expect(now).toContain(`width="${String(legacy)}"`);
      expect(was).not.toContain("width=");
      // Nothing else moved: strip the restored attribute and the two are identical again.
      expect(now.replace(` width="${String(legacy)}"`, "")).toBe(was);
    }
  });
});

// ---------------------------------------------------------------------------------------------
// 3. TableHead — deliberately NOT widened (ThHTMLAttributes declares no `width`).
// ---------------------------------------------------------------------------------------------
describe("byte-identity: TableHead", () => {
  it("every pre-existing shape — align × sortable × sortDir × wrap × step × className", () => {
    const shapes: Shape[] = [];
    for (const align of ALIGNS)
      for (const sortable of [undefined, true, false] as const)
        for (const sortDir of [undefined, null, "asc", "desc"] as const)
          for (const wrap of WRAPS)
            for (const width of STEPS)
              for (const cls of CLASSES) {
                const name = `Head a=${String(align)} s=${String(sortable)} d=${String(sortDir)} w=${String(wrap)} s=${String(width)} c=${String(cls)}`;
                shapes.push({
                  name,
                  now: (
                    <Now.Table wrap="truncate">
                      <Now.TableHeader>
                        <Now.TableRow>
                          <Now.TableHead
                            align={align}
                            sortable={sortable}
                            sortDir={sortDir}
                            wrap={wrap}
                            width={width}
                            className={cls}
                          >
                            Code
                          </Now.TableHead>
                        </Now.TableRow>
                      </Now.TableHeader>
                    </Now.Table>
                  ),
                  was: (
                    <Was.Table wrap="truncate">
                      <Was.TableHeader>
                        <Was.TableRow>
                          <Was.TableHead
                            align={align}
                            sortable={sortable}
                            sortDir={sortDir}
                            wrap={wrap}
                            width={width}
                            className={cls}
                          >
                            Code
                          </Was.TableHead>
                        </Was.TableRow>
                      </Was.TableHeader>
                    </Was.Table>
                  ),
                });
              }
    expect(diff(shapes)).toEqual([]);
    expect(shapes.length).toBe(1920);
  });
});

// ---------------------------------------------------------------------------------------------
// 4. GridHeadCell — untouched by this change, guarded because it reads the same width context.
// ---------------------------------------------------------------------------------------------
describe("byte-identity: GridHeadCell", () => {
  it("every pre-existing shape", () => {
    const shapes: Shape[] = [];
    for (const align of [undefined, "left", "right"] as const)
      for (const sortDir of [undefined, null, "asc", "desc"] as const)
        for (const sortPosition of [undefined, null, 1, 2] as const)
          for (const grouped of BOOLS)
            for (const pinned of BOOLS)
              for (const width of STEPS)
                for (const tableWrap of [undefined, "truncate"] as const) {
                  const name = `GHC a=${String(align)} d=${String(sortDir)} p=${String(sortPosition)} g=${String(grouped)} pin=${String(pinned)} w=${String(width)} tw=${String(tableWrap)}`;
                  shapes.push({
                    name,
                    now: (
                      <Now.Table wrap={tableWrap}>
                        <Now.TableHeader>
                          <Now.TableRow>
                            <GridHeadCellNow
                              columnKey="room"
                              label="Room"
                              align={align}
                              sortDir={sortDir}
                              sortPosition={sortPosition}
                              grouped={grouped}
                              pinned={pinned}
                              width={width}
                            />
                          </Now.TableRow>
                        </Now.TableHeader>
                      </Now.Table>
                    ),
                    was: (
                      <Was.Table wrap={tableWrap}>
                        <Was.TableHeader>
                          <Was.TableRow>
                            <GridHeadCellWas
                              columnKey="room"
                              label="Room"
                              align={align}
                              sortDir={sortDir}
                              sortPosition={sortPosition}
                              grouped={grouped}
                              pinned={pinned}
                              width={width}
                            />
                          </Was.TableRow>
                        </Was.TableHeader>
                      </Was.Table>
                    ),
                  });
                }
    expect(diff(shapes)).toEqual([]);
    expect(shapes.length).toBe(4320);
  });
});

// ---------------------------------------------------------------------------------------------
// 5. GridFilterRow — the row F1 lives in.
// ---------------------------------------------------------------------------------------------
const ROOMS = [
  { id: "cold-1", label: "Cold room 1" },
  { id: "cold-2", label: "Cold room 2" },
  { id: "ripening-3", label: "Ripening room 3" },
];

describe("byte-identity: GridFilterRow", () => {
  it("every kind × value state × leadingCells × density — the SINGLE-value paths are untouched", () => {
    const shapes: Shape[] = [];
    const kinds = ["text", "numberMin", "select", "dateRange"] as const;
    const values = [
      {},
      { room: { kind: "text" as const, value: "abc" } },
      { room: { kind: "numberMin" as const, value: "5" } },
      { room: { kind: "select" as const, value: "cold-1" } },
      { room: { kind: "dateRange" as const, from: "2026-01-01", to: null } },
    ];
    for (const kind of kinds)
      for (const [vi, values_] of values.entries())
        for (const leadingCells of [undefined, 0, 2] as const)
          for (const density of DENSITIES)
            for (const width of STEPS) {
              const columns = [
                {
                  key: "room",
                  kind,
                  label: "Room",
                  placeholder: "All rooms",
                  options: ROOMS,
                  width,
                },
              ];
              const name = `GFR k=${kind} v=${String(vi)} lc=${String(leadingCells)} d=${String(density)} w=${String(width)}`;
              shapes.push({
                name,
                now: (
                  <Now.Table density={density} wrap="truncate">
                    <Now.TableHeader>
                      <GridFilterRowNow
                        columns={columns}
                        values={values_}
                        leadingCells={leadingCells}
                        onChange={() => undefined}
                      />
                    </Now.TableHeader>
                  </Now.Table>
                ),
                was: (
                  <Was.Table density={density} wrap="truncate">
                    <Was.TableHeader>
                      <GridFilterRowWas
                        columns={columns}
                        values={values_}
                        leadingCells={leadingCells}
                        onChange={() => undefined}
                      />
                    </Was.TableHeader>
                  </Was.Table>
                ),
              });
            }
    expect(diff(shapes)).toEqual([]);
    expect(shapes.length).toBe(900);
  });

  it("a `multiple` cell whose stored ids the options STILL offer is unmoved", () => {
    const shapes: Shape[] = [];
    const states = [
      {},
      { room: { kind: "select" as const, value: "cold-1" } },
      { room: { kind: "select" as const, value: "cold-1", values: ["cold-1", "cold-2"] } },
      {
        room: {
          kind: "select" as const,
          value: "cold-1",
          values: ["cold-1", "cold-2", "ripening-3"],
        },
      },
    ];
    for (const [i, values_] of states.entries())
      for (const density of DENSITIES) {
        const columns = [
          {
            key: "room",
            kind: "select" as const,
            multiple: true,
            label: "Room",
            placeholder: "All rooms",
            options: ROOMS,
          },
        ];
        shapes.push({
          name: `multi v=${String(i)} d=${String(density)}`,
          now: (
            <Now.Table density={density}>
              <Now.TableHeader>
                <GridFilterRowNow columns={columns} values={values_} onChange={() => undefined} />
              </Now.TableHeader>
            </Now.Table>
          ),
          was: (
            <Was.Table density={density}>
              <Was.TableHeader>
                <GridFilterRowWas columns={columns} values={values_} onChange={() => undefined} />
              </Was.TableHeader>
            </Was.Table>
          ),
        });
      }
    expect(diff(shapes)).toEqual([]);
    expect(shapes.length).toBe(12);
  });

  it("🔴 A RETIRED ID IS THE SECOND EXPECTED DIFFERENCE (F1) — and it differs in the repaired direction", () => {
    const columns = [
      {
        key: "room",
        kind: "select" as const,
        multiple: true,
        label: "Room",
        placeholder: "All rooms",
        options: ROOMS,
      },
    ];
    const values = { room: { kind: "select" as const, value: "cold-1", values: ["cold-1", "cold-9"] } };
    const now = renderToStaticMarkup(
      <Now.Table>
        <Now.TableHeader>
          <GridFilterRowNow columns={columns} values={values} onChange={() => undefined} />
        </Now.TableHeader>
      </Now.Table>,
    );
    const was = renderToStaticMarkup(
      <Was.Table>
        <Was.TableHeader>
          <GridFilterRowWas columns={columns} values={values} onChange={() => undefined} />
        </Was.TableHeader>
      </Was.Table>,
    );
    expect(normalise(now)).not.toBe(normalise(was));
    expect(now).toContain("+1"); // two values are narrowing, so the trigger counts two
    expect(was).not.toContain("+1"); // the shipped cell counted one and dropped the other
  });
});

// ---------------------------------------------------------------------------------------------
// 6. DataTableToolbar — the SEVEN SHIPPED SCREENS' population. None declares `selectAll`.
// ---------------------------------------------------------------------------------------------
interface Row {
  readonly id: string;
  readonly depot: string | null;
  readonly day: string | null;
}
const ROWS: readonly Row[] = [
  { id: "1", depot: "Cape Town", day: "2026-01-01" },
  { id: "2", depot: "Durban", day: null },
  { id: "3", depot: null, day: "2026-02-02" },
];

function ToolbarNowHarness({ kind }: { readonly kind: "select" | "multiSelect" }): ReactElement {
  const controls = useControlsNow(ROWS, {
    getSearchText: (r) => r.depot ?? "",
    filters: [
      { kind, key: "depot", label: "Depots", accessor: (r: Row) => r.depot } as never,
      { kind: "dateRange", key: "day", label: "Day", accessor: (r: Row) => r.day } as never,
    ],
  });
  return <ToolbarNow controls={controls} />;
}
function ToolbarWasHarness({ kind }: { readonly kind: "select" | "multiSelect" }): ReactElement {
  const controls = useControlsWas(ROWS, {
    getSearchText: (r: Row) => r.depot ?? "",
    filters: [
      { kind, key: "depot", label: "Depots", accessor: (r: Row) => r.depot } as never,
      { kind: "dateRange", key: "day", label: "Day", accessor: (r: Row) => r.day } as never,
    ],
  });
  return <ToolbarWas controls={controls} />;
}

describe("byte-identity: DataTableToolbar", () => {
  it("🔴 THE SHIPPED TOOLBAR POPULATION IS UNMOVED — select and multiSelect, neither declaring selectAll", () => {
    const shapes: Shape[] = [];
    for (const kind of ["select", "multiSelect"] as const) {
      shapes.push({
        name: `toolbar ${kind}`,
        now: <ToolbarNowHarness kind={kind} />,
        was: <ToolbarWasHarness kind={kind} />,
      });
    }
    expect(diff(shapes)).toEqual([]);
    expect(shapes.length).toBe(2);
  });
});
