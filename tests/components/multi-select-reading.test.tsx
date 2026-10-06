import { describe, expect, it } from "vitest";

import {
  multiSelectAllTickedFooter,
  multiSelectAllTickedLabel,
  multiSelectAllTickedToggle,
  multiSelectReadingOf,
  multiSelectTicked,
  type MultiSelectReading,
} from "../../src/components/multi-select-reading";

// CR-DESIGN-SYSTEM-013 — the `allTicked` arithmetic, every transition of plan §1, as pure functions.
//
// 🔴 THESE ARE THE RULES BOTH SURFACES RENDER. The grid's cell and the toolbar's control call nothing
//    else to decide which boxes are ticked, what a tick does or what the trigger and footer say, so a
//    transition proven here is proven for both. The driven specs beside this file prove the wiring.

const BATCHES = [
  { value: "b1", label: "SBF-001" },
  { value: "b2", label: "SBF-002" },
  { value: "b3", label: "SBF-003" },
];

const ALL: MultiSelectReading = { mode: "all" };
const NONE: MultiSelectReading = { mode: "none" };

function untick(reading: MultiSelectReading, value: string): MultiSelectReading {
  return multiSelectAllTickedToggle(BATCHES, reading, value, false);
}
function tick(reading: MultiSelectReading, value: string): MultiSelectReading {
  return multiSelectAllTickedToggle(BATCHES, reading, value, true);
}

describe("from EVERYTHING — every box ticked", () => {
  it("🔴 every box shows ticked while nothing is narrowed — the owner's whole ask", () => {
    expect(BATCHES.map((b) => multiSelectTicked(ALL, b.value))).toEqual([true, true, true]);
  });

  it("🔴 unticking one hides JUST that one — 'everything except', never 'only the rest'", () => {
    expect(untick(ALL, "b2")).toEqual({ mode: "except", excluded: ["b2"] });
  });

  it("unticking every box one by one ends in the draft, not in a filter that hides everything", () => {
    expect(untick(untick(untick(ALL, "b1"), "b2"), "b3")).toEqual(NONE);
  });
});

describe("from EVERYTHING EXCEPT — some unticked", () => {
  const exceptB2: MultiSelectReading = { mode: "except", excluded: ["b2"] };

  it("only the hidden box is clear", () => {
    expect(BATCHES.map((b) => multiSelectTicked(exceptB2, b.value))).toEqual([true, false, true]);
  });

  it("unticking another adds it, in DISPLAYED order however it was unticked", () => {
    expect(untick({ mode: "except", excluded: ["b3"] }, "b1")).toEqual({
      mode: "except",
      excluded: ["b1", "b3"],
    });
  });

  it("🔴 re-ticking the last hidden one collapses to EVERYTHING — not an empty exclusion", () => {
    expect(tick(exceptB2, "b2")).toEqual(ALL);
  });

  it("re-ticking one of two hidden leaves the other hidden", () => {
    expect(tick({ mode: "except", excluded: ["b1", "b2"] }, "b1")).toEqual({
      mode: "except",
      excluded: ["b2"],
    });
  });

  it("🔴 a hidden id the options no longer offer is PRESERVED through the next untick (CR-010 F1)", () => {
    expect(untick({ mode: "except", excluded: ["b9"] }, "b1")).toEqual({
      mode: "except",
      excluded: ["b1", "b9"],
    });
  });
});

describe("from NOTHING TICKED — the draft", () => {
  it("every box shows clear", () => {
    expect(BATCHES.map((b) => multiSelectTicked(NONE, b.value))).toEqual([false, false, false]);
  });

  it("🔴 ticking one narrows to ONLY that one — the form follows how the reader got there", () => {
    expect(tick(NONE, "b3")).toEqual({ mode: "only", values: ["b3"] });
  });
});

describe("from ONLY — ticked from nothing", () => {
  const onlyB1: MultiSelectReading = { mode: "only", values: ["b1"] };

  it("ticking another adds it, in displayed order", () => {
    expect(tick({ mode: "only", values: ["b3"] }, "b1")).toEqual({
      mode: "only",
      values: ["b1", "b3"],
    });
  });

  it("🔴 ticking the last box collapses to EVERYTHING — every box ticked means nothing is hidden", () => {
    expect(tick(tick(onlyB1, "b2"), "b3")).toEqual(ALL);
  });

  it("unticking the last ticked box returns to the draft", () => {
    expect(untick(onlyB1, "b1")).toEqual(NONE);
  });

  it("a chosen id the options no longer offer is preserved, as everywhere else", () => {
    expect(tick({ mode: "only", values: ["b9"] }, "b2")).toEqual({
      mode: "only",
      values: ["b2", "b9"],
    });
  });
});

describe("reading a stored value", () => {
  it("an exclusion reads 'except'; an include list reads 'only'; neither reads 'all'", () => {
    expect(multiSelectReadingOf([], ["b2"])).toEqual({ mode: "except", excluded: ["b2"] });
    expect(multiSelectReadingOf(["b1"], [])).toEqual({ mode: "only", values: ["b1"] });
    expect(multiSelectReadingOf([], [])).toEqual(ALL);
  });
});

describe("the words — the owner's layout B", () => {
  it("the trigger rests on the empty text for everything AND for the draft", () => {
    expect(multiSelectAllTickedLabel("All batches", BATCHES, ALL)).toEqual({ text: "All batches", more: 0 });
    expect(multiSelectAllTickedLabel("All batches", BATCHES, NONE)).toEqual({ text: "All batches", more: 0 });
  });

  it("🔴 'everything except' COUNTS on the trigger — '2 of 3 batches'", () => {
    expect(
      multiSelectAllTickedLabel("All batches", BATCHES, { mode: "except", excluded: ["b2"] }),
    ).toEqual({ text: "2 of 3 batches", more: 0 });
  });

  it("an empty text that is not 'All …' says 'shown' rather than guess a noun", () => {
    expect(
      multiSelectAllTickedLabel("Any batch", BATCHES, { mode: "except", excluded: ["b2"] }).text,
    ).toBe("2 of 3 shown");
  });

  it("'only' keeps today's wording — the first chosen, then how many more", () => {
    expect(
      multiSelectAllTickedLabel("All batches", BATCHES, { mode: "only", values: ["b1", "b3"] }),
    ).toEqual({ text: "SBF-001", more: 1 });
  });

  it("🔴 the footer NAMES what is hidden — the half the trigger leaves out", () => {
    expect(multiSelectAllTickedFooter(BATCHES, { mode: "except", excluded: ["b1", "b3"] })).toBe(
      "Hidden: SBF-001, SBF-003",
    );
    // A hidden id the list no longer offers keeps its raw id rather than vanishing from the sentence.
    expect(multiSelectAllTickedFooter(BATCHES, { mode: "except", excluded: ["b9"] })).toBe(
      "Hidden: b9",
    );
  });

  it("the footer in the other three states", () => {
    expect(multiSelectAllTickedFooter(BATCHES, ALL)).toBe("Nothing hidden");
    expect(multiSelectAllTickedFooter(BATCHES, NONE)).toBe(
      "Nothing ticked — showing everything until you tick one",
    );
    expect(multiSelectAllTickedFooter(BATCHES, { mode: "only", values: ["b1", "b9"] })).toBe(
      "2 chosen",
    );
  });
});
