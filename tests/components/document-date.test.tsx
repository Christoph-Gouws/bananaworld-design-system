import { describe, expect, it } from "vitest";

import {
  describeDocumentDate,
  DOCUMENT_DATE_WARN_DAYS,
} from "../../src/lib/document-date";

// CR-DESIGN-SYSTEM-002 — the day line beneath the header's date box, promoted out of Bananaworld-DC.
//
// Mirrors the `describeDocumentDate` half of DC's `tests/unit/document-date.test.ts`. Only that half
// crossed: DC's SQL fragments, its column map, its row readers and its validator stayed in DC, being
// business rules and database shape (TECH-COMP-003), and their specs stayed with them.
//
// ⚠ IT LIVES UNDER `tests/components/` AND IS A `.tsx` WITH NO JSX IN IT, deliberately. The `engines`
//   vitest project globs only `tests/pricing/**` and `tests/sales-order/**`; the `components` project
//   globs `tests/components/**/*.test.tsx`. Placing it here is what let this change add a suite
//   WITHOUT editing `vitest.config.ts` — the config edit is the thing five pinned consumers would have
//   to reason about. The function under test touches no DOM, so the DOM environment cannot mask
//   anything: it takes two strings and returns a mood and two labels.

describe("describeDocumentDate — option C's whole mechanism", () => {
  const TODAY = "2026-08-08"; // a Saturday

  it("says nothing on today", () => {
    const d = describeDocumentDate(TODAY, TODAY);
    expect(d.mood).toBe("today");
    expect(d.daysBack).toBe(0);
    expect(d.distanceLabel).toBe("");
  });

  it("names the day out loud for ordinary back-dating, and stays calm", () => {
    // The mockup's own example, character for character: "Friday 7 August · 1 day back".
    const d = describeDocumentDate("2026-08-07", TODAY);
    expect(d.mood).toBe("informed");
    expect(d.dayLabel).toBe("Friday 7 August");
    expect(d.distanceLabel).toBe("1 day back");
  });

  it("prints the YEAR only when it is not the current one — which is what catches the typo", () => {
    // 🔴 THE FAILURE OPTION C EXISTS FOR: meaning 2026 and typing 2025. One character in a date box is
    //    invisible; "Thursday 7 August 2025 · 366 days back" is not.
    const d = describeDocumentDate("2025-08-07", TODAY);
    expect(d.dayLabel).toBe("Thursday 7 August 2025");
    // ⚠ CARRIED ACROSS WITH DC'S OWN NOTE INTACT: the approved mockup drew "367 days back" for this
    //   exact pair and the arithmetic in the drawing is wrong — 2025-08-07 to 2026-08-08 is 366 days.
    //   The shipped code counts days; the mockup's label was illustration. Recorded in DC's
    //   known-issues at the time, and repeated here rather than silently matched.
    expect(d.distanceLabel).toBe("366 days back");
    expect(d.mood).toBe("questioned");
  });

  it("questions past the owner's threshold and stays quiet AT it", () => {
    const at = describeDocumentDate(dayBefore(TODAY, DOCUMENT_DATE_WARN_DAYS), TODAY);
    const past = describeDocumentDate(dayBefore(TODAY, DOCUMENT_DATE_WARN_DAYS + 1), TODAY);
    expect(at.daysBack).toBe(DOCUMENT_DATE_WARN_DAYS);
    expect(at.mood).toBe("informed");
    expect(past.mood).toBe("questioned");
  });

  it("questions ANY future day, however near, and says 'ahead' rather than 'back'", () => {
    const d = describeDocumentDate("2026-08-09", TODAY);
    expect(d.mood).toBe("questioned");
    expect(d.daysBack).toBe(-1);
    expect(d.distanceLabel).toBe("1 day ahead");
  });

  it("pluralises honestly", () => {
    expect(describeDocumentDate("2026-08-06", TODAY).distanceLabel).toBe("2 days back");
    expect(describeDocumentDate("2026-08-10", TODAY).distanceLabel).toBe("2 days ahead");
  });

  it("joins the weekday to the rest with a SPACE, never a comma", () => {
    // ⚠ Asking `Intl` for weekday + day + month + year in one call yields "Thursday, 7 August 2025".
    //   The approved mockup has no comma, which is why the label is built from two formatters.
    expect(describeDocumentDate("2025-08-07", TODAY).dayLabel).not.toContain(",");
    expect(describeDocumentDate("2026-08-07", TODAY).dayLabel).not.toContain(",");
  });

  it("holds the owner's threshold at 60, in ONE place the screen and this spec both read", () => {
    // 🔴 The threshold cannot be one value in the component and another in the spec that claims to
    //    prove it. It is also NOT overridable (decision D-5): uniformity across the apps is the point.
    expect(DOCUMENT_DATE_WARN_DAYS).toBe(60);
  });

  it("reads both ends in UTC, so the answer does not depend on where the test runs", () => {
    // ⚠ A calendar day has no timezone. Anchoring both ends at UTC midnight makes the distance exact
    //   and immune to DST — and it is what lets a second app, in a second region, wear this header.
    expect(describeDocumentDate("2026-01-01", "2026-12-31").daysBack).toBe(364);
    expect(describeDocumentDate("2026-03-01", "2026-03-01").mood).toBe("today");
  });
});

/** N days before a `YYYY-MM-DD`, in UTC (a calendar day has no timezone). */
function dayBefore(day: string, days: number): string {
  const [y, m, d] = day.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d - days)).toISOString().slice(0, 10);
}
