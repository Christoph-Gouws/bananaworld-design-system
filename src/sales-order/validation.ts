// Shared sales-order — boundary input validation. Pure — no IO.
//
// Promoted verbatim from Bananaworld-DC (EPIC-006-M002) into the shared design-system so DC and the CRM
// reject the same malformed order with the same messages. The Route Handler returns 400 with the issue
// list before any DB work. Live checks (customer/address/masters existence + active, pallet matching,
// lifecycle state) need live data and stay in DC's repository.
//
// Anchors: DC QUALITY-LOGIC-003 (validate at the boundary).

import { isPriceUom } from "../pricing";
import type { SalesOrderInput } from "./types";

export interface ValidationIssue {
  readonly field: string;
  readonly message: string;
}

const MAX_NOTES = 2000;
// ISO calendar date, e.g. 2026-06-08 (the date input's native format).
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isPositiveNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

// Boundary validation shared by create + update (draft). Pricing + allocation are resolved server-side
// at save/post; a draft may omit the delivery address + dispatch date (required only at Post — checked
// in DC's repository). Only lines actually sent are validated — and a sent line must be complete.
export function validateSalesOrder(input: SalesOrderInput): ValidationIssue[] {
  if (input === null || typeof input !== "object") {
    return [{ field: "_root", message: "A sales order is required." }];
  }
  const issues: ValidationIssue[] = [];

  if (isBlank(input.customer_id)) {
    issues.push({ field: "customer_id", message: "Choose a customer." });
  }
  if (
    input.requested_dispatch_date !== null &&
    input.requested_dispatch_date !== undefined &&
    input.requested_dispatch_date !== "" &&
    !ISO_DATE.test(input.requested_dispatch_date)
  ) {
    issues.push({
      field: "requested_dispatch_date",
      message: "Enter a valid dispatch date.",
    });
  }
  if (
    input.order_date !== null &&
    input.order_date !== undefined &&
    input.order_date !== "" &&
    !ISO_DATE.test(input.order_date)
  ) {
    issues.push({ field: "order_date", message: "Enter a valid order date." });
  }
  if (typeof input.notes === "string" && input.notes.length > MAX_NOTES) {
    issues.push({
      field: "notes",
      message: `Notes must be ${MAX_NOTES} characters or fewer.`,
    });
  }

  if (!Array.isArray(input.lines)) {
    issues.push({ field: "lines", message: "Lines must be a list." });
    return issues;
  }

  input.lines.forEach((line, index) => {
    if (line === null || typeof line !== "object") {
      issues.push({
        field: `lines[${index}]`,
        message: "Each order line is required.",
      });
      return;
    }
    if (isBlank(line.item_id)) {
      issues.push({
        field: `lines[${index}].item_id`,
        message: "Choose an item.",
      });
    }
    if (isBlank(line.container_type_id)) {
      issues.push({
        field: `lines[${index}].container_type_id`,
        message: "Choose a container.",
      });
    }
    if (!isPositiveNumber(line.quantity)) {
      issues.push({
        field: `lines[${index}].quantity`,
        message: "Enter a quantity greater than zero.",
      });
    }
    if (!isPriceUom(line.uom)) {
      issues.push({ field: `lines[${index}].uom`, message: "Choose a unit." });
    }
    if (
      line.override_unit_price !== null &&
      line.override_unit_price !== undefined &&
      !(
        typeof line.override_unit_price === "number" &&
        line.override_unit_price >= 0
      )
    ) {
      issues.push({
        field: `lines[${index}].override_unit_price`,
        message: "A price override must be zero or more.",
      });
    }
  });

  return issues;
}
