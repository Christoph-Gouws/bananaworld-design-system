/**
 * Truck layout — CR-DESIGN-SYSTEM-028. The pure half of <TruckDiagram>: which position sits where,
 * which spaces are over a standard truck, and where the drop blocks start. No React, so the delivery
 * note (a React-PDF document, which cannot draw the DOM component) draws its picture from the SAME
 * rows and cannot disagree with the screen.
 *
 *  - Two wide. Row r holds positions 2r-1 (left) and 2r (right); row 1 is at the cab.
 *  - A pallet is never hidden: the count is `positions`, or, when a slot lies past it, that slot's row filled.
 *  - A `taken` slot never carries a label (another packhouse's pallet number is never drawn).
 *  - "drop" here is a delivery stop, not drag-and-drop. The app sets each slot's drop; the kit only
 *    groups consecutive rows into blocks and never reorders or checks them.
 */
export type TruckSlotState = "empty" | "filled" | "taken" | "selected";
export type TruckDropEnd = "cab" | "doors";

export interface TruckSlot {
  readonly position: number;
  /** The pallet number. Dropped for a `taken` slot. */
  readonly label?: string;
  readonly state: TruckSlotState;
  readonly note?: string;
  /** The delivery stop this space belongs to; a whole number ≥ 1, anything else is ignored. */
  readonly drop?: number;
}

export interface TruckDiagramCell extends TruckSlot {
  readonly overStandard: boolean;
  /** The odd space in a row shared by two drops: it carries its own drop tag. */
  readonly showDrop: boolean;
}

export interface TruckDiagramRow {
  /** 1 = behind the cab. */
  readonly row: number;
  readonly cells: readonly [TruckDiagramCell, TruckDiagramCell | null];
  readonly overStandard: boolean;
  /** The block's drop; null when the picture has fewer than two blocks. */
  readonly drop: number | null;
  /** "cab" on the first block's rows, "doors" on the last block's, null in between. */
  readonly dropEnd: TruckDropEnd | null;
  readonly startsBlock: boolean;
}

const wholeAtLeast = (n: number, min: number): number | undefined =>
  Number.isInteger(n) && n >= min ? n : undefined;

interface PendingRow {
  readonly cells: [TruckDiagramCell, TruckDiagramCell | null];
  readonly blockDrop: number | null;
}

export function truckDiagramRows(
  positions: number,
  slots: readonly TruckSlot[],
  standardPositions?: number,
): TruckDiagramRow[] {
  const byPosition = new Map<number, TruckSlot>();
  for (const slot of slots) {
    if (wholeAtLeast(slot.position, 1) !== undefined && !byPosition.has(slot.position)) {
      byPosition.set(slot.position, slot);
    }
  }
  const asked = Number.isFinite(positions) ? Math.max(0, Math.floor(positions)) : 0;
  // Slots past `positions` add whole rows (an even count); an odd `positions` itself is honoured.
  const highest = Math.max(0, ...byPosition.keys());
  const total = highest > asked ? highest + (highest % 2) : asked;
  const standard = typeof standardPositions === "number" ? standardPositions : Infinity;

  const cell = (position: number): TruckDiagramCell => {
    const slot = byPosition.get(position);
    const state = slot?.state ?? "empty";
    return {
      position,
      state,
      label: state === "taken" ? undefined : slot?.label,
      note: slot?.note,
      drop: slot && wholeAtLeast(slot.drop ?? NaN, 1),
      overStandard: position > standard,
      showDrop: false,
    };
  };

  // Block drop per row: the left cell's drop, else the right's, else the row above's.
  const rows: PendingRow[] = [];
  let carried: number | null = null;
  for (let r = 1; r * 2 - 1 <= total; r++) {
    const left = cell(r * 2 - 1);
    const right = r * 2 <= total ? cell(r * 2) : null;
    const blockDrop: number | null = left.drop ?? right?.drop ?? carried;
    carried = blockDrop;
    rows.push({
      cells: [
        { ...left, showDrop: left.drop !== undefined && left.drop !== blockDrop },
        right && { ...right, showDrop: right.drop !== undefined && right.drop !== blockDrop },
      ],
      blockDrop,
    });
  }

  return markBlocks(rows);
}

// Consecutive rows with the same block drop are one block. Fewer than two blocks draw no lines.
function markBlocks(rows: readonly PendingRow[]): TruckDiagramRow[] {
  const starts = rows.map(
    (row, i) => row.blockDrop !== null && row.blockDrop !== (rows[i - 1]?.blockDrop ?? null),
  );
  const blockCount = starts.filter(Boolean).length;
  const drawBlocks = blockCount >= 2;
  let block = 0;
  return rows.map(({ cells, blockDrop }, i) => {
    if (starts[i]) block++;
    const inBlock = drawBlocks && blockDrop !== null;
    return {
      row: i + 1,
      cells,
      overStandard: cells.some((c) => c?.overStandard),
      drop: inBlock ? blockDrop : null,
      dropEnd: !inBlock ? null : block === 1 ? "cab" : block === blockCount ? "doors" : null,
      startsBlock: drawBlocks && starts[i]!,
    };
  });
}
