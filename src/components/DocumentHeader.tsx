"use client";

// The DOCUMENT HEADER — the chrome every browser transaction form carries (EPIC-023-M003).
//
// Anchors: the browser form standard (owner instruction 2026-08-06 — "all forms must be homogeneous…
//          they must have headers"), owner ruling Q10/Q12 (the DATE TOP LEFT, non-negotiable), the owner
//          instruction of 2026-08-08 (the DOCUMENT NUMBER TOP RIGHT), the approved option-c mockup, and
//          `tests/contract/transaction-form-standard.test.ts`, which is what keeps the eleven from
//          drifting apart again.
//
// ============================================================================
// ⚠ PROMOTED OUT OF Bananaworld-DC AT CR-DESIGN-SYSTEM-002. THIS IS THAT MOVE, LANDED.
// ============================================================================
// It lived at `bananaworld-dc/src/components/ui/DocumentHeader.tsx` until this change. CR-DC-039 removed
// its session read, which was the precondition — a component that reads DC's session cannot be worn by
// the CRM. Everything below is what DC shipped, unchanged in behaviour: same four slots, same order,
// same states, same strings, same class names. ONLY THE TWO IMPORT SPECIFIERS BELOW DIFFER, because the
// file has moved house; the anchors to DC's own decisions are kept because they are still the true
// account of why this code looks the way it does.
//
// 🔴 DC DOES NOT CHANGE WHEN THIS LANDS. It keeps importing from `@/components/ui`, whose barrel
//    re-exports this package exactly as it already re-exports every other shared primitive, and it bumps
//    its pin in its OWN change against the MERGED sha on `main` — never a branch sha (KI-M001E19-002).
//    Between the two halves the header exists in both trees. That is not drift; that is how a pinned
//    estate moves, and it ends when DC's half lands.
//
// ============================================================================
// 🔴 THE CHROME IS MANDATORY. THE BODY IS NOT. THIS FILE IS ONLY THE CHROME.
// ============================================================================
// "Homogeneous" means these four slots, in this order, on every desk form — and it means nothing more
// than that (epic brief §5). How a form's LINES come into being is a property of the transaction —
// authored, derived, or absent — and forcing one shape onto all of them would make DispatchForm worse,
// which is the owner's own objection. Nothing in this file has an opinion about a body.
//
// 🔴 THE NON-REGRESSION RULE OUTRANKS THE STANDARD, AND THAT IS WHY THE DATE SLOT TAKES A CONTROL.
//    Two forms already own an EDITABLE business date — SalesOrderForm's Order date and the new delivery
//    run's Run date. The mockup draws both as plain slots because it is a still picture of a header, not
//    a statement that the field became read-only; turning a working input into a label would REMOVE A
//    CAPABILITY, which conforming must never do. So those two pass their existing control into the date
//    slot and keep it. Every other form passes a formatted value, and M005 is where the date becomes
//    editable everywhere.
//
// ⚠ IT IS FACTORED OUT OF AdjustmentSheet's local `DocumentHeader` (CR-DC-031), which was the only
//   conforming header in the building. Its `<dl>`/`<dt>`/`<dd>` shape is kept for the same reason it was
//   chosen: nothing in a read-only slot is an input, and a `<label>` with no control to label is a lie
//   to a screen reader. The Document no. slot, when it IS an input, uses a real `<Label htmlFor>`.

import { useId, type ReactElement, type ReactNode } from "react";

// ⚠ `Input` COMES FROM THE SIBLING MODULE, NOT FROM `./index`. This file is re-exported by that barrel,
//   so importing back through it would be a cycle. Before the promotion this line read
//   `from "@bananaworld/design-system"` and carried the same warning for the same reason, one hop out;
//   it is the identical component either way. ADOPT the shared design system, never fork.
import { Input } from "./Input";

// ⚠ THE PURE LEAF, never a `document-number` barrel — `describeDocumentDate` has no `node:`, no `pg`
//   and no `process.env`, which is exactly why it can be imported by a client component. Before the
//   promotion this line read `from "@/lib/document-number/document-date"`, DC's own pure half; the
//   describer crossed with the component and the SQL, column map and validation stayed in DC
//   (CR-DESIGN-SYSTEM-002 decision D-4). 🔴 NO `@/…` PATH MAY EVER APPEAR IN THIS FILE — an app import
//   in a package five repos pin is the whole failure this promotion exists to make impossible, and both
//   `tsc --noEmit` and a spec in `tests/components/DocumentHeader.test.tsx` are set to catch one.
import { describeDocumentDate, type DocumentDateMood } from "../lib";

// ---------------------------------------------------------------------------
// 🔴 THE CANONICAL SLOT ORDER. IT IS DATA, AND THE RENDER IS A MAP OVER IT.
// ---------------------------------------------------------------------------
//
// Order is expressed ONCE, here, and the JSX below walks this array — so a slot cannot be re-ordered by
// editing the markup and leaving a constant behind saying otherwise. The contract test imports this
// array and asserts it equals the standard's HEADER_SLOTS; `DocumentHeader.test.tsx` asserts the
// rendered DOM comes out in this order. Neither alone would be enough: the constant could drift from the
// markup, and a DOM test alone would not say what the standard IS.
export const DOCUMENT_HEADER_SLOTS = ["Date", "DC", "Raised by", "Document no."] as const;

// 🔴 CR-DC-046 — `PRE_EPIC_HEADER_SLOTS` REMOVED, 2026-08-12. It held the slot order the stock
//    adjustment rendered with the flag OFF (the Document no. second). The owner ruled the flag permanent
//    and ON (DECISION-358), so the far-right order above is the ONLY order, which is what production has
//    rendered since the EPIC-023 flip.

export type DocumentHeaderSlot = (typeof DOCUMENT_HEADER_SLOTS)[number];

// ---------------------------------------------------------------------------
// The Document no. slot's five states (option-c.html §3 — these are contract, not illustration)
// ---------------------------------------------------------------------------
//
//   "absent"    — this document has no number of its own yet. Dashed em-dash, "Not numbered yet".
//                 Goods received, stock transfer and stock adjustment until EPIC-023-M004.
//   "auto"      — a number the caller may not change. A sunken, read-only VALUE: not an input, and not
//                 in the tab order. They still see it, because they need it to find the document again.
//   "editable"  — a live input, pre-filled with the preview. Typing over it adds the "Changed" pill, the
//                 warn border, the one-sentence consequence and Undo.
//
// ⚠ FIVE VISIBLE STATES, THREE ARMS, AND BOTH NUMBERS ARE RIGHT. The five the mockup draws are
//   `absent` · `auto` · `editable`-calm · `editable`-warn (Changed) · `editable`-error (collision): the
//   last three are the `mood` split inside the one arm (`slotMood`, below). 🔴 DO NOT "RECONCILE" THIS
//   BY COLLAPSING IT TO THREE OR SPLITTING IT TO FIVE — either changes what a user sees.
export type DocumentNumberSlotState =
  | { readonly kind: "absent" }
  | { readonly kind: "auto"; readonly code: string | null }
  | {
      readonly kind: "editable";
      readonly value: string;
      readonly preview: string | null;
      readonly changed: boolean;
      /** e.g. "Next number. Taken when you post." — the moment this document comes into being. */
      readonly hint: string;
      /** e.g. "order" — used in "The next order still takes SO-01247." */
      readonly documentNoun: string;
      /** A server refusal shown against the field (the taken-number collision). */
      readonly error: string | null;
      readonly onChange: (next: string) => void;
      readonly onUndo: () => void;
    };

/**
 * The DATE slot's states (EPIC-023-M005, the approved option-c mockup — these are contract, not
 * illustration).
 *
 *   "value"    — shown, not offered. A person without RBAC-PERM-096, or a document from before this
 *                change whose date is `null` (an em dash, hint "No date recorded"). 🔴 A VALUE, NOT A
 *                DISABLED INPUT: "you could change this, but not now" is the wrong statement, and the
 *                refusal is the server's either way (RBAC-PRINCIPLE-001).
 *   "editable" — the box. On today it is plain, hint "Today". Off today it grows one line naming the
 *                day out loud, with Undo — blue for ordinary back-dating, amber past the threshold or
 *                for any future day. 🔴 IT NEVER BLOCKS THE SAVE.
 */
export type DocumentDateSlotState =
  | { readonly kind: "value"; readonly value: string | null; readonly hint?: string }
  | {
      readonly kind: "editable";
      /** `YYYY-MM-DD`, what the box holds. */
      readonly value: string;
      /** The caller's calendar day, for the "is this today?" comparison. */
      readonly today: string;
      readonly onChange: (next: string) => void;
      readonly onUndo: () => void;
      /** A server refusal shown against the field. */
      readonly error: string | null;
    };

// ---------------------------------------------------------------------------
// 🔴 CR-DC-039 — WHOSE FACTS THE MIDDLE TWO SLOTS SHOW. THE HEADER DESCRIBES THE **DOCUMENT**.
// ---------------------------------------------------------------------------
//
// Until that change both middle slots came from `useAuth()` — the CURRENT SESSION — so on a NEW form
// they were right (you are the person raising it, in your depot) and on an EXISTING one they were not:
// open an order somebody else raised and the header named YOU. The component had no notion of which of
// the two moments it was in, and the comment on `raisedByName` claiming this "is the value the server
// writes to created_by" was true at the instant of creation and false ever after.
//
// 🔴 REQUIRED, AND DISCRIMINATED — A CALLER CANNOT LAND IN THE WRONG CASE BY OMISSION, because omitting
//    it does not compile.
//
// ⚠ WHY THE DISCRIMINANT STAYS EVEN THOUGH BOTH ARMS CARRY THE SAME TWO FIELDS. Not for the render —
//   the render is identical, deliberately so. It is there so the CALL SITE states which moment it is
//   in, which is the only thing a check can read. Without it, a form that wrongly wires the session in
//   would be byte-indistinguishable from one that is correct, and the fence in
//   `transaction-form-standard.test.ts` would have nothing to assert. That repo's own repeated lesson:
//   a check that cannot fail gets filed as compliance. 🔴 DO NOT "SIMPLIFY" IT AWAY.
//
// ⚠ AND IT IS WHAT MAKES THIS HEADER WEARABLE BY A SECOND APP. Both fields are plain `string | null`
//   NAMES — there is no `warehouse_id`, no `legal_entity`, no tenancy identifier of any kind. The
//   component is never told what the depot IS, only what it is CALLED, so it cannot scope anything and
//   an app whose equivalent concept is not a depot at all can still fill the slot honestly.
export type DocumentOrigin =
  | {
      /** No document exists yet. The session IS this document's future author, and that is honest. */
      readonly kind: "new";
      readonly dcName: string | null;
      readonly raisedBy: string | null;
    }
  | {
      /**
       * A document that EXISTS — its OWN recorded values. `null` = nothing recorded (a row from before
       * the column, or one raised by the CRM handoff service principal): render the empty state the
       * slot already has. 🔴 NEVER THE VIEWER, and never a fabricated name — that is the defect.
       */
      readonly kind: "existing";
      readonly dcName: string | null;
      readonly raisedBy: string | null;
    };

export interface DocumentHeaderProps {
  /** Defaults to "Date". SalesOrderForm passes "Order date"; the delivery run passes "Run date". */
  readonly dateLabel?: string;
  /** The formatted date, when the form does not own an editable one. */
  readonly dateValue?: string | null;
  /**
   * The form's OWN date control, rendered in the top-left slot instead of a value. This is the
   * non-regression seam — see the file header. When present, `dateValue` is ignored.
   *
   * 🔴 IT SURVIVES M005 UNCHANGED, AND THAT IS OWNER RULING Q1. Three forms own an editable business
   *    date TODAY — the sales order's Order date, the delivery run's Run date, the fuel slip's Date on
   *    the slip — open to anyone who may raise the document. Putting them behind RBAC-PERM-096 would
   *    take away a field people have, which conforming must never do. They keep this prop; the other
   *    nine take `documentDate` below.
   */
  readonly dateControl?: ReactNode;
  readonly dateHint?: string;
  /**
   * 🔴 EPIC-023-M005 — THE SHARED DATE SLOT. Hand it `useDocumentDate(...).slot`. When present it wins
   *    over `dateValue` and `dateHint`; `dateControl` still wins over it, because a form that already
   *    owns a working control keeps it (see above).
   */
  readonly documentDate?: DocumentDateSlotState;
  readonly documentNumber: DocumentNumberSlotState;
  /**
   * 🔴 EPIC-023-M007 — THE PDF CONTROL, RENDERED INSIDE THE DOCUMENT NO. SLOT, UNDER THE VALUE.
   *
   * The owner's pick: option B's PLACEMENT — the control sits with the document number, top right — with
   * option C's list behaviour where a document has more than one sheet (M011). `option-b.html` draws it
   * exactly here on every screen.
   *
   * ⚠ IT IS A `ReactNode`, AND THAT IS DELIBERATE RATHER THAN A SHORTCUT. The plan supposed the header
   *   could build the control itself from a transaction key it "already needs for the number" — it does
   *   not have one: this component takes a rendered `DocumentNumberSlotState`, never a key. Taking the
   *   control as a node means the SURFACE writes `<DocumentPdf transactionKey="…" documentId={…} />`,
   *   which is what the form-standard guard reads. A guard that could only see "the header renders
   *   something" would be the recorded M003 trap — once every form takes a shared component, a scan
   *   degrades to proving they import something.
   *
   * ⚠ NOT A SECOND WORDING SEAM. The node the surface passes carries no label: `DocumentPdf` reads the
   *   one word from the print registry. Passing a node lets a surface choose WHICH DOCUMENT, never what
   *   the button says. It is also why this package never learns which document is being printed.
   */
  readonly documentPdf?: ReactNode;
  /**
   * Defaults to "DC". The word printed over the SECOND slot, and nothing more. CR-CRM-015 passes its
   * own word; Bananaworld-DC passes nothing and gets "DC".
   *
   * 🔴 IT NAMES THE SLOT; IT DOES NOT MOVE IT, AND IT IS NOT AN IDENTITY. `DOCUMENT_HEADER_SLOTS`
   *    remains the ONE expression of which slots exist and in what order — "DC" is this slot's
   *    canonical NAME there and stays exactly as it reads, character for character, because
   *    Bananaworld-DC's `tests/contract/transaction-form-standard.test.ts` scans this file's SOURCE for
   *    that declaration. This prop is presentation sitting BESIDE the array: the array says WHICH slot,
   *    this says what THIS APP calls it. 🔴 NEVER MOVE THE OVERRIDE INTO THE ARRAY.
   *
   * ⚠ SAME SHAPE AS `dateLabel`, DELIBERATELY — one optional prop defaulted at the point of use, no
   *   discriminant, no second slot list. It is the VALUE half's argument applied to the LABEL: both
   *   `DocumentOrigin` arms carry a plain `string | null` NAME with no tenancy identifier, so "the
   *   component is never told what the depot IS, only what it is CALLED" (above) was already true of
   *   what the slot SHOWS. The word printed over it was the one thing left hard-coded.
   *
   * 🔴 THE SLOT IS ALWAYS PRESENT — OMISSION IS NOT OFFERED (CR-DESIGN-SYSTEM-005, layout A). An app
   *    with nothing for this slot passes `dcName: null` and gets the empty state the slot already has:
   *    a dashed, dimmed em dash reading "not filled in". Dropping the slot would put Document no. in
   *    column 3 of a `lg:grid-cols-4` strip, and "the document number top right" is the owner
   *    instruction of 2026-08-08. Pinned by a spec that fails the day a hole appears.
   */
  readonly dcLabel?: string;
  /**
   * 🔴 CR-DC-039 — REQUIRED. Whose DC and whose name the middle two slots show. See `DocumentOrigin`.
   *
   * Hand it `useDocumentOrigin(...)` — DC's one hook that reads the session, and only on the "no
   * document yet" branch. Twelve forms each calling `useAuth()` themselves would be twelve chances to
   * reintroduce the defect that change exists to remove. 🔴 THE HOOK STAYS IN THE APP: reading a
   * session is exactly what this package may not do (TECH-CON-004 / TECH-COMP-003), which is the same
   * line that keeps `PermissionGate` and the sync indicators in their apps.
   */
  readonly origin: DocumentOrigin;
}

/** The second line of the taken-number refusal — the owner's addition of 2026-08-08 (KI-M002-06). */
export const DOCUMENT_NUMBER_WHERE_TO_SET = "Numbering is set under Masters → Document Numbers.";

/**
 * The four-slot document header.
 *
 * 🔴 CR-DC-046 — IT ALWAYS RENDERS, AND ALWAYS IN THE CANONICAL ORDER. The flag that used to decide
 *    whether a form got a header at all, and in which order, is gone (DECISION-358): every form on the
 *    ON path had one, which is what production has rendered since the EPIC-023 flip.
 *
 * 🔴 AND THAT IS WHY THIS COMPONENT TAKES NO FLAG PROP (CR-DESIGN-SYSTEM-002 decision D-3). A shared
 *    component cannot read an app's feature flags, so the honest shape would have been a prop — but
 *    there is no longer a question for it to answer. Adding one now would be configurability built in
 *    anticipation of a decision the owner has already closed.
 */
export function DocumentHeader(props: DocumentHeaderProps): ReactElement {
  const numberInputId = useId();
  const dateInputId = useId();

  const slots = DOCUMENT_HEADER_SLOTS;

  return (
    <dl className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
      {slots.map((slot) => {
        if (slot === "Date") {
          // 🔴 THE ORDER OF PRECEDENCE IS THE NON-REGRESSION RULE, EXPRESSED AS CODE. A form's OWN
          //    control wins over the shared slot, which wins over a plain value — so the three forms
          //    that already had a date box keep exactly the box they had.
          if (props.dateControl === undefined && props.documentDate !== undefined) {
            return (
              <DocumentDateSlot
                key={slot}
                label={props.dateLabel ?? "Date"}
                state={props.documentDate}
                inputId={dateInputId}
              />
            );
          }
          return (
            <HeaderSlot
              key={slot}
              label={props.dateLabel ?? "Date"}
              value={props.dateValue ?? null}
              control={props.dateControl}
              hint={props.dateHint}
            />
          );
        }
        // 🔴 CR-DC-039 — BOTH MIDDLE SLOTS COME FROM THE DOCUMENT, NEVER FROM THE SESSION. `null` is
        //    the empty state the slot already has ("nothing filled in"), which is what a row with no
        //    recorded author gets. It is NOT filled in from the viewer.
        // ⚠ AND THE WORD OVER IT IS THE WEARING APP'S (CR-DESIGN-SYSTEM-005). `??`, not `||` —
        //   identical to `dateLabel` above, so a caller passing "" gets the same thing from both props
        //   and the two cannot drift. The slot itself is not optional: see `dcLabel`.
        if (slot === "DC") {
          return <HeaderSlot key={slot} label={props.dcLabel ?? "DC"} value={props.origin.dcName} />;
        }
        if (slot === "Raised by") {
          return <HeaderSlot key={slot} label="Raised by" value={props.origin.raisedBy} />;
        }
        return (
          <DocumentNumberSlot
            key={slot}
            state={props.documentNumber}
            inputId={numberInputId}
            pdf={props.documentPdf}
          />
        );
      })}
    </dl>
  );
}

// 🔴 CR-DC-039 — `raisedByName` IS NOT IN THIS FILE, and was already out of it before the promotion. It
//    lives at DC's `@/components/document-number/use-document-origin`: it takes a `useAuth` user and
//    would drag the session dependency straight back in. Without it this component is PURE
//    PRESENTATION, which is the ONLY reason it was eligible to move here at all. It is still ONE
//    definition in DC, imported, never re-derived.
//
// ⚠ THE SECOND EFFECT DC'S COMMENT ANTICIPATED IS THIS FILE. DC recorded that a component reading no
//   session was "the PRECONDITION for promoting this header into `@bananaworld/design-system`, where
//   Sheet, SlideOver and Modal already live, so the CRM can wear the same header rather than a second
//   copy that drifts", and that the move was "its own change in the design-system lane". That change is
//   CR-DESIGN-SYSTEM-002 and it is this file. 🔴 THE CRM DOES NOT ADOPT HERE — that is
//   `CR-CRM-document-header-parity`, in the crm lane, after this one. Nothing in this file anticipates
//   it: no new slot, no CRM-shaped variant, no configurability added in advance.

// One header field. A null value is a slot with nothing in it yet — dashed and dimmed, so it reads as
// "not filled in" rather than as a value of "—".
function HeaderSlot({
  label,
  value,
  hint,
  control,
  extra,
}: {
  readonly label: string;
  readonly value: string | null;
  readonly hint?: string;
  readonly control?: ReactNode;
  /** EPIC-023-M007 — anything rendered UNDER the slot's value. Today that is the PDF control. */
  readonly extra?: ReactNode;
}): ReactElement {
  return (
    <div className="min-w-0 space-y-1.5">
      <dt className="text-xs font-medium text-fg-muted">{label}</dt>
      {control !== undefined ? (
        <dd>{control}</dd>
      ) : (
        <dd
          className={[
            "flex h-9 items-center rounded-md border px-3 text-sm",
            value === null
              ? "border-dashed border-border bg-surface-muted text-fg-subtle"
              : "border-border bg-surface-muted font-medium text-fg",
          ].join(" ")}
        >
          {value ?? "—"}
        </dd>
      )}
      {hint !== undefined && <dd className="text-xs text-fg-subtle">{hint}</dd>}
      {extra !== undefined && <dd>{extra}</dd>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// The DATE slot (EPIC-023-M005) — option C: quiet until it moves, then it says the day out loud
// ---------------------------------------------------------------------------
//
// 🔴 EVERY STRING BELOW IS LIFTED FROM THE APPROVED option-c MOCKUP. "Friday 7 August · 1 day back",
//    "Is that right?", "Today", "No date recorded" — the owner picked this option over one that showed
//    nothing and one that painted a correct Friday the same colour as a wrong 2025. Saying the weekday
//    and the distance in words is the whole mechanism.
//
// 🔴 IT NEVER BLOCKS A SAVE. Amber is a question, not a refusal. A genuinely old document must be
//    capturable, and DC's server agrees — `resolveDocumentDateOverride` applies no business bound either
//    (DECISION-259). Two rules disagreeing would leave the person with the old document no way through.
function DocumentDateSlot({
  label,
  state,
  inputId,
}: {
  readonly label: string;
  readonly state: DocumentDateSlotState;
  readonly inputId: string;
}): ReactElement {
  if (state.kind === "value") {
    // Shown, not offered — no permission, or a pre-epic document with no business date at all.
    // ⚠ A null renders as an em dash and is NEVER guessed at from `created_at`: that would put a date
    //   on a document nobody chose (the CR-DC-035 `pack_date` rule, same shape).
    return <HeaderSlot label={label} value={state.value} hint={state.hint} />;
  }

  const day = describeDocumentDate(state.value, state.today);

  return (
    <div className="min-w-0 space-y-1.5">
      {/* A real <label> here, because this slot IS a control. */}
      <label htmlFor={inputId} className="text-xs font-medium text-fg-muted">
        {label}
      </label>
      <Input
        id={inputId}
        type="date"
        value={state.value}
        onChange={(e) => state.onChange(e.target.value)}
        className={dateBorder(state.error, day.mood)}
        aria-invalid={state.error !== null ? true : undefined}
      />
      {state.error !== null && (
        <p role="alert" className="text-xs font-medium text-danger-fg">
          {state.error}
        </p>
      )}
      {state.error === null && day.mood === "today" && (
        <p className="text-xs text-fg-subtle">Today</p>
      )}
      {state.error === null && day.mood === "informed" && (
        <p className="text-xs font-medium text-info-fg">
          {day.dayLabel} <span className="font-normal text-fg-muted">· {day.distanceLabel}</span>{" "}
          <UndoDate onUndo={state.onUndo} />
        </p>
      )}
      {state.error === null && day.mood === "questioned" && (
        <p className="text-xs text-warning-fg">
          {/* 🔴 THE TYPO THIS OPTION EXISTS TO CATCH: meaning 2026 and typing 2025. The YEAR is printed
              only when it is not the current one, so "Thursday 7 August 2025 · 367 days back" is
              unmissable where a one-character difference in a date box is not. */}
          <b>
            {day.dayLabel} · {day.distanceLabel}.
          </b>{" "}
          Is that right? <UndoDate onUndo={state.onUndo} />
        </p>
      )}
    </div>
  );
}

function UndoDate({ onUndo }: { readonly onUndo: () => void }): ReactElement {
  return (
    <button
      type="button"
      onClick={onUndo}
      className="font-semibold text-info underline-offset-2 hover:underline"
    >
      Undo
    </button>
  );
}

// The date box's border. An error outranks the day's mood; ordinary back-dating gets NO colour at all,
// which is the difference between option C and option B and the reason C was chosen.
function dateBorder(error: string | null, mood: DocumentDateMood): string | undefined {
  if (error !== null) return "border-danger focus-visible:ring-danger/30";
  if (mood === "questioned") return "border-warning focus-visible:ring-warning/30";
  return undefined;
}

// The slot's three moods, named. Two plain functions rather than nested ternaries or a keyed lookup:
// a nested conditional in JSX is what `sonarjs/no-nested-conditional` exists to stop, and a
// `LOOKUP[mood]` is a computed index the security rules flag. Both readings would also be worse than
// this one — these three states are the approved mockup's contract and read better named than inlined.
type DocumentNumberMood = "error" | "warn" | "calm";

function slotMood(state: {
  readonly error: string | null;
  readonly changed: boolean;
}): DocumentNumberMood {
  if (state.error !== null) return "error";
  if (state.changed) return "warn";
  return "calm";
}

function moodBorder(mood: DocumentNumberMood): string | undefined {
  if (mood === "error") return "border-danger focus-visible:ring-danger/30";
  if (mood === "warn") return "border-warning focus-visible:ring-warning/30";
  return undefined;
}

// The Document no. slot. Every string below is lifted from the approved option-c mockup.
function DocumentNumberSlot({
  state,
  inputId,
  pdf,
}: {
  readonly state: DocumentNumberSlotState;
  readonly inputId: string;
  /** 🔴 EPIC-023-M007 — the PDF control, under the value/input in all three of this slot's states. */
  readonly pdf?: ReactNode;
}): ReactElement {
  if (state.kind === "absent") {
    return <HeaderSlot label="Document no." value={null} hint="Not numbered yet" extra={pdf} />;
  }
  if (state.kind === "auto") {
    // 🔴 A VALUE, NOT A DISABLED INPUT. A disabled input still sits in the document as a control and
    //    reads as "you could change this, but not now"; this slot means "this is not yours to change".
    //    And the refusal is not this element — the server refuses a `document_number` in the body with
    //    403 whatever the screen renders (RBAC-PRINCIPLE-001).
    return (
      <HeaderSlot label="Document no." value={state.code} hint="Given automatically" extra={pdf} />
    );
  }

  const mood = slotMood(state);

  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        {/* A real <label> here, because this slot IS a control. */}
        <label htmlFor={inputId} className="text-xs font-medium text-fg-muted">
          Document no.
        </label>
        {state.changed && (
          <span className="rounded-full bg-warning-subtle px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-warning-fg">
            Changed
          </span>
        )}
      </div>
      <Input
        id={inputId}
        value={state.value}
        onChange={(e) => state.onChange(e.target.value)}
        className={moodBorder(mood)}
        aria-invalid={mood === "error" ? true : undefined}
        autoComplete="off"
        spellCheck={false}
      />
      {mood === "error" && (
        <p role="alert" className="text-xs font-medium text-danger-fg">
          {state.error}
          <br />
          {/* The second line the owner agreed on 2026-08-08 (KI-M002-06) — so the person can act
              instead of guessing. ⚠ It is a UI addition BESIDE the server's message, not a change to
              it: `DocumentNumberCollisionError` still carries the owner's one sentence verbatim. */}
          <span className="font-normal">{DOCUMENT_NUMBER_WHERE_TO_SET}</span>
        </p>
      )}
      {mood === "warn" && (
        <p className="text-xs text-warning-fg">
          {/* 🔴 THE ONE CONSEQUENCE PEOPLE GET WRONG ABOUT MANUAL NUMBERING, said in the place it
              happens — the whole reason option C was chosen over option A. */}
          Automatic numbering will not move. The next {state.documentNoun} still takes{" "}
          {state.preview ?? "the next number"}.{" "}
          <button
            type="button"
            onClick={state.onUndo}
            className="font-semibold text-info underline-offset-2 hover:underline"
          >
            Undo
          </button>
        </p>
      )}
      {mood === "calm" && <p className="text-xs text-fg-subtle">{state.hint}</p>}
      {/* 🔴 EPIC-023-M007 — the PDF control, under the input. Same slot, same corner, in all three of
          this slot's states, so a document does not move its own button depending on whether its
          number happens to be editable. */}
      {pdf}
    </div>
  );
}
