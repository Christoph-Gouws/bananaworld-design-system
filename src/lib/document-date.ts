// The DOCUMENT DATE'S DAY LINE — how a chosen calendar day is described beneath a date box.
//
// ⚠ PROMOTED FROM Bananaworld-DC AT CR-DESIGN-SYSTEM-002, and it is deliberately only HALF of DC's
//   `src/lib/document-number/document-date.ts`. That file is 420 lines and mostly not presentation:
//   the SQL fragments (`DOCUMENT_DATE_NOW_SQL`, `documentDateSql`, `documentDateTimestampSql`), the
//   column map (`DOCUMENT_DATE_COLUMN`), the row readers (`documentDateFor`, `toDcDay`) and the
//   validator (`isValidDocumentDate`) are business rules and database shape, which TECH-COMP-003
//   excludes from this package outright. THEY STAY IN DC. What crossed is the leaf below — two
//   calendar-day strings in, a mood and two labels out. No IO, no `node:`, no `process.env`.
//
// 🔴 WHY THE DESCRIBER CROSSED AT ALL, RATHER THAN THE APP SUPPLYING THE SENTENCES. Hoisting the
//    description into a prop was the "purer" option and it was rejected: it puts the wording and the
//    colour rule back into each app, so the CRM would spell its own "Is that right?" and pick its own
//    threshold. That is the second copy that drifts — precisely what promoting the header exists to
//    prevent. A shared header whose sentences are supplied by the caller is not a shared header.
//    (CR-DESIGN-SYSTEM-002 decision D-4.)

// ===========================================================================
// EPIC-023-M005 — THE DAY LINE (option C, and it is the whole reason option C was chosen)
// ===========================================================================

/**
 * How far back a date may be before the form stops being quiet and asks. Owner-set at the mockup gate of
 * 2026-08-08 ("60 days back, or any date in the future").
 *
 * 🔴 ONE CONSTANT. The screen and its tests read the same number, so the threshold cannot be one value
 *    in the component and another in the spec that claims to prove it.
 *
 * ⚠ IT NEVER BLOCKS A SAVE. It changes a colour and a sentence. The owner was shown that cost — "at 59
 *   days the form is quiet and at 61 it is not, and that edge has no meaning" — and accepted it. That is
 *   also why it is presentation and may live here: the server applies no bound of its own (DECISION-259).
 *
 * ⚠ IT IS NOT OVERRIDABLE, AND THAT IS THE POINT (CR-DESIGN-SYSTEM-002 decision D-5). Uniformity across
 *   the apps is what this package is for. If a consumer ever genuinely needs a different number, that is
 *   an additive optional prop in a later change — not configurability built in anticipation of one.
 */
export const DOCUMENT_DATE_WARN_DAYS = 60;

/** What the form should say beneath the date box. */
export type DocumentDateMood =
  /** On today. A plain box, hint "Today". No line. */
  | "today"
  /** 1..DOCUMENT_DATE_WARN_DAYS back. One quiet blue line naming the day, with Undo. */
  | "informed"
  /** Past the threshold, or ANY future day. Amber border, "Is that right?", with Undo. */
  | "questioned";

export interface DocumentDateDescription {
  readonly mood: DocumentDateMood;
  /** "Friday 7 August", or "Thursday 7 August 2025" when the year is not the current one. */
  readonly dayLabel: string;
  /** "1 day back" · "367 days back" · "3 days ahead". Empty on today. */
  readonly distanceLabel: string;
  /** Positive = in the past. Negative = in the future. 0 = today. */
  readonly daysBack: number;
}

/**
 * Describe a chosen day against the caller's today, in the caller's own calendar (option C's contract).
 *
 * 🔴 THE YEAR IS PRINTED ONLY WHEN IT IS NOT THE CURRENT YEAR — "Friday 7 August" vs "Thursday 7 August
 *    2025". That is straight off the approved mockup and it is what makes the typo the option exists to
 *    catch — meaning 2026 and typing 2025 — unmissable rather than a difference of one character.
 *
 * ⚠ BOTH ARGUMENTS ARE BARE CALENDAR DAYS AND THE ARITHMETIC IS DONE IN UTC, deliberately. A calendar
 *   day has no timezone; anchoring both ends at UTC midnight makes the distance exact and immune to DST
 *   (South Africa has none today, but a UTC-anchored subtraction cannot acquire the bug later either).
 *   The caller's calendar enters through `today`, which the app takes from its own clock — in DC, from
 *   `toDcDay(new Date())`. 🔴 THIS PACKAGE NEVER READS A CLOCK OR A TIMEZONE OF ITS OWN: it is handed
 *   both days. That is what lets a second app, in a second region, wear the same header honestly.
 */
export function describeDocumentDate(chosen: string, today: string): DocumentDateDescription {
  const daysBack = Math.round((utcMillis(today) - utcMillis(chosen)) / 86_400_000);
  const sameYear = chosen.slice(0, 4) === today.slice(0, 4);
  return {
    mood: moodFor(daysBack),
    dayLabel: formatDayLabel(chosen, sameYear),
    distanceLabel: formatDistance(daysBack),
    daysBack,
  };
}

function moodFor(daysBack: number): DocumentDateMood {
  if (daysBack === 0) return "today";
  // 🔴 ANY future day is questioned, however near. "Tomorrow" on a document that records work already
  //    done is a slip in every case the shared control covers — and the three forms where a future date
  //    IS normal (the delivery run above all) keep their OWN control and never reach this function.
  if (daysBack < 0 || daysBack > DOCUMENT_DATE_WARN_DAYS) return "questioned";
  return "informed";
}

function formatDistance(daysBack: number): string {
  if (daysBack === 0) return "";
  const magnitude = Math.abs(daysBack);
  const unit = magnitude === 1 ? "day" : "days";
  return daysBack > 0 ? `${magnitude} ${unit} back` : `${magnitude} ${unit} ahead`;
}

// ⚠ THE WEEKDAY IS FORMATTED SEPARATELY AND JOINED WITH A SPACE, and that is not fussiness. Asking
//   `Intl` for weekday + day + month + YEAR in one call yields "Thursday, 7 August 2025" — with a comma
//   the approved mockup does not have. Two calls and a join give the drawn string exactly.
// ⚠ UTC, not a regional zone: the input is a bare calendar day, anchored at UTC midnight below.
//   Rendering it in a +02:00 zone would be correct today and is one DST rule away from not being.
const WEEKDAY = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "long" });
const DAY_MONTH = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
});
const DAY_MONTH_YEAR = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDayLabel(day: string, sameYear: boolean): string {
  const [year, month, date] = day.split("-").map(Number) as [number, number, number];
  const instant = new Date(Date.UTC(year, month - 1, date));
  const rest = sameYear ? DAY_MONTH.format(instant) : DAY_MONTH_YEAR.format(instant);
  return `${WEEKDAY.format(instant)} ${rest}`;
}

function utcMillis(day: string): number {
  const [year, month, date] = day.split("-").map(Number) as [number, number, number];
  return Date.UTC(year, month - 1, date);
}
