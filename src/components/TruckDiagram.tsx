import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { cn } from "../lib";
import {
  truckDiagramRows,
  type TruckDiagramCell,
  type TruckDiagramRow,
  type TruckDropEnd,
  type TruckSlot,
} from "./truck-diagram-layout";

/**
 * TruckDiagram — CR-DESIGN-SYSTEM-028 (UX-THM-004). A truck seen from above, two spaces wide, rows
 * numbered from the cab (top) to the doors (bottom). The app hands in every space's state, pallet
 * number and drop; the kit only draws them.
 *
 *  - No client directive, no hook: a read-only picture renders on the server. `onSlotTap` and
 *    `dropLabel` are functions, so only a client parent can pass them.
 *  - Each tappable space is a native <button> (keyboard, focus, screen reader for free), never a
 *    hand-rolled widget. A `taken` space is never a button; without `onSlotTap` nothing is.
 *  - `taken` never shows a pallet number, even if the caller passes one (the layout drops it).
 *  - Drop blocks ("drop" = a delivery stop, not drag-and-drop): consecutive rows of one drop form a
 *    block with a labelled divider. On a back-loaded reefer the app puts the last drop at the cab
 *    and the first by the doors; the kit never reorders. Fewer than two blocks draw no lines.
 *  - `standardPositions` has no default: the 30 is the packhouse's business value, not the kit's.
 *  - The state is never colour alone: border style, a check icon and words say it too. Tokens only.
 *  - The delivery-note PDF cannot draw this component; it maps `truckDiagramRows` instead.
 */
export interface TruckDiagramWords {
  readonly diagram: string;
  readonly position: string;
  readonly empty: string;
  readonly taken: string;
  readonly selected: string;
  readonly overStandard: string;
}

export interface TruckDiagramProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Number of spaces. May exceed the standard; a slot past it still draws. */
  readonly positions: number;
  readonly slots: readonly TruckSlot[];
  /** Absent = read-only: nothing is focusable. */
  readonly onSlotTap?: (position: number) => void;
  /** Shown at the cab end, e.g. "Cab". */
  readonly frontLabel: string;
  /** Shown at the doors end, e.g. "Doors". */
  readonly backLabel: string;
  /** Spaces past this get the warning style. No default. */
  readonly standardPositions?: number;
  readonly words?: Partial<TruckDiagramWords>;
  /** Divider and tag words; the tag is called with `end = null`. */
  readonly dropLabel?: (drop: number, end: TruckDropEnd | null) => string;
}

const DEFAULT_WORDS: TruckDiagramWords = {
  diagram: "Truck loading positions",
  position: "Position",
  empty: "Empty",
  taken: "Taken",
  selected: "Selected",
  overStandard: "More than a standard truck",
};

const defaultDropLabel = (drop: number, end: TruckDropEnd | null): string =>
  end === "cab"
    ? `Drop ${drop} · unloaded last`
    : end === "doors"
      ? `Drop ${drop} · unloaded first`
      : `Drop ${drop}`;

const ROOT =
  "mx-auto w-full min-w-0 max-w-md text-fg print:break-inside-avoid [[data-surface=tablet]_&]:max-w-lg";
const END_BLOCK =
  "m-0 border-2 border-fg px-4 py-2 text-center text-sm font-bold uppercase tracking-wide [overflow-wrap:anywhere]";
const BODY = "border-x-2 border-fg px-2 py-2";
const LIST = "m-0 grid list-none grid-cols-2 gap-2 p-0";
const DIVIDER =
  "m-0 flex items-center gap-2 py-2 text-sm font-extrabold text-fg [overflow-wrap:anywhere]";
const RULE = "h-0 min-w-4 flex-1 border-t-[3px] border-fg";
const WARNING =
  "m-0 flex items-center gap-1.5 py-2 text-sm font-semibold text-warning-fg [overflow-wrap:anywhere]";
const SPACE =
  "relative flex h-full min-h-12 min-w-0 w-full flex-col items-start justify-center gap-0.5 rounded-md border-2 px-2 py-1 text-left " +
  "[[data-surface=tablet]_&]:min-h-14 print:min-h-8";
const TAPPABLE =
  "touch-manipulation select-none transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus";
const HATCH =
  "bg-[repeating-linear-gradient(45deg,var(--color-surface-sunken),var(--color-surface-sunken)_6px,var(--color-surface-muted)_6px,var(--color-surface-muted)_12px)]";
const STATE_CLASS = {
  empty: "border-dashed border-border-strong bg-surface text-fg-subtle",
  filled: "border-solid border-accent bg-accent-subtle text-fg",
  selected: "border-solid border-fg bg-accent-subtle text-fg",
  taken: `border-dotted border-border ${HATCH} text-fg-muted`,
} as const;

function SpaceBody({
  cell,
  words,
  dropLabel,
}: {
  cell: TruckDiagramCell;
  words: TruckDiagramWords;
  dropLabel: NonNullable<TruckDiagramProps["dropLabel"]>;
}) {
  const { position, state, label, note, drop, showDrop } = cell;
  const text =
    state === "taken" ? (
      <span className="text-sm font-semibold">{words.taken}</span>
    ) : label ? (
      <span className="text-sm font-bold tabular-nums [overflow-wrap:anywhere] sm:text-base">
        {label}
      </span>
    ) : (
      <span className="sr-only">{words.empty}</span>
    );
  // The {" "} nodes keep the parts apart in the accessible name; they are invisible in the flex column.
  return (
    <>
      <span className="text-xs tabular-nums">
        <span className="sr-only">{words.position} </span>
        {position}
      </span>{" "}
      {text}{" "}
      {state === "selected" ? (
        <>
          <Check aria-hidden="true" className="absolute right-1 top-1 h-4 w-4" />
          <span className="sr-only">{words.selected}</span>{" "}
        </>
      ) : null}
      {note ? <span className="text-xs [overflow-wrap:anywhere]">{note}</span> : null}{" "}
      {showDrop && drop !== undefined ? (
        <span className="rounded border border-fg bg-surface px-1 text-[0.6875rem] font-semibold text-fg">
          {dropLabel(drop, null)}
        </span>
      ) : null}
    </>
  );
}

function Section({
  rows,
  warn,
  words,
  dropLabel,
  onSlotTap,
}: {
  rows: readonly TruckDiagramRow[];
  warn: boolean;
  words: TruckDiagramWords;
  dropLabel: NonNullable<TruckDiagramProps["dropLabel"]>;
  onSlotTap: TruckDiagramProps["onSlotTap"];
}) {
  const first = rows[0]!;
  const heading =
    first.startsBlock && first.drop !== null ? dropLabel(first.drop, first.dropEnd) : null;
  const items: ReactNode[] = rows.flatMap((row) =>
    row.cells.map((cell) => {
      if (!cell) return null;
      const classes = cn(
        SPACE,
        STATE_CLASS[cell.state],
        cell.overStandard && cell.state !== "selected" && "border-warning",
        cell.overStandard && cell.state === "empty" && "bg-warning-subtle",
      );
      const body = <SpaceBody cell={cell} words={words} dropLabel={dropLabel} />;
      const tappable = onSlotTap !== undefined && cell.state !== "taken";
      return (
        <li key={cell.position}>
          {tappable ? (
            <button
              type="button"
              className={cn(classes, TAPPABLE)}
              onClick={() => onSlotTap(cell.position)}
            >
              {body}
            </button>
          ) : (
            <div className={classes}>{body}</div>
          )}
        </li>
      );
    }),
  );
  const list = (
    <>
      {warn ? (
        <p className={WARNING}>
          <TriangleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
          {words.overStandard}
        </p>
      ) : null}
      <ol start={first.cells[0].position} className={LIST}>
        {items}
      </ol>
    </>
  );
  return heading === null ? (
    list
  ) : (
    <>
      <p className={DIVIDER}>
        <span aria-hidden="true" className={RULE} />
        <span className="text-center">{heading}</span>
        <span aria-hidden="true" className={RULE} />
      </p>
      <div role="group" aria-label={heading}>
        {list}
      </div>
    </>
  );
}

// A new section starts at the first row, at every drop block, and where the standard truck ends.
function sections(rows: readonly TruckDiagramRow[]): { rows: TruckDiagramRow[]; warn: boolean }[] {
  const out: { rows: TruckDiagramRow[]; warn: boolean }[] = [];
  rows.forEach((row, i) => {
    const warn = row.overStandard && !rows[i - 1]?.overStandard;
    if (i === 0 || row.startsBlock || warn) out.push({ rows: [], warn: Boolean(warn) });
    out[out.length - 1]!.rows.push(row);
  });
  return out;
}

export const TruckDiagram = forwardRef<HTMLDivElement, TruckDiagramProps>(function TruckDiagram(
  {
    positions,
    slots,
    onSlotTap,
    frontLabel,
    backLabel,
    standardPositions,
    words,
    dropLabel = defaultDropLabel,
    className,
    ...rest
  },
  ref,
) {
  const w: TruckDiagramWords = {
    diagram: words?.diagram ?? DEFAULT_WORDS.diagram,
    position: words?.position ?? DEFAULT_WORDS.position,
    empty: words?.empty ?? DEFAULT_WORDS.empty,
    taken: words?.taken ?? DEFAULT_WORDS.taken,
    selected: words?.selected ?? DEFAULT_WORDS.selected,
    overStandard: words?.overStandard ?? DEFAULT_WORDS.overStandard,
  };
  const rows = truckDiagramRows(positions, slots, standardPositions);
  return (
    <div ref={ref} role="group" aria-label={w.diagram} {...rest} className={cn(ROOT, className)}>
      <p className={cn(END_BLOCK, "rounded-t-3xl")}>{frontLabel}</p>
      <div className={BODY}>
        {sections(rows).map((section) => (
          <Section
            key={section.rows[0]!.row}
            rows={section.rows}
            warn={section.warn}
            words={w}
            dropLabel={dropLabel}
            onSlotTap={onSlotTap}
          />
        ))}
      </div>
      <p className={cn(END_BLOCK, "rounded-b-md")}>{backLabel}</p>
    </div>
  );
});
