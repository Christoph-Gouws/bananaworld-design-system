import type { ReactNode } from "react";
import { Scale } from "lucide-react";
import { StatTile, StatTileRow } from "../../../src";

// CR-DESIGN-SYSTEM-035 — every existing StatTile caller shape (packhouse DashboardParts.tsx:36,
// EndOfShiftOffice.tsx:102-133, and the kit spec shapes). `extra` is spread on top to prove that
// tone="default" / labelCase="upper" change nothing.
export type Extra = Record<string, unknown>;

export function shapes(extra: Extra = {}): Record<string, ReactNode> {
  const e = extra as Record<string, never>;
  const base: Record<string, ReactNode> = {
    plain: <StatTile label="Pallets" value="156" {...e} />,
    unit: <StatTile label="Pallets" value="156" unit="pal." sub="2 814,00 units" {...e} />,
    nullValue: <StatTile label="Waste" value={null} sub="No shift opened yet" {...e} />,
    emptyString: <StatTile label="Waste" value="" unit="kg" {...e} />,
    noWords: <StatTile accent icon={<Scale />} value="12" sub="x" label="Bunches in" {...e} />,
    wordsPt: (
      <StatTile
        accent
        icon={<Scale />}
        value={null}
        label="Lixo"
        words={{ empty: "Sem dados" }}
        {...e}
      />
    ),
    linkedDash: (
      <StatTile
        accent
        href="/cold-rooms"
        prefetch={false}
        label="Cold rooms"
        value="7"
        sub={
          <>
            Waiting <b>7</b> pal.
          </>
        }
        words={{ empty: "Nothing" }}
        data-testid="tile-cold"
        {...e}
      />
    ),
    linkedAria: <StatTile label="A" value="1" href="/x" aria-label="Open A" {...e} />,
    classData: <StatTile label="A" value="1" className="custom" data-foo="bar" {...e} />,
    linkedPlain: <StatTile label="A" value="1" href="/x" {...e} />,
    row: (
      <StatTileRow>
        <StatTile label="A" value="1" {...e} />
        <StatTile label="B" value="2" unit="kg" {...e} />
        <StatTile label="C" value={null} {...e} />
      </StatTileRow>
    ),
  };
  const out: Record<string, ReactNode> = {};
  for (const [k, v] of Object.entries(base)) {
    out[k] = v;
    out[`${k}@tablet`] = <div data-surface="tablet">{v}</div>;
  }
  return out;
}
