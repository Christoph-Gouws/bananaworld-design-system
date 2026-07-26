// A4 §Test list — group G: shared sales-order boundary validation (T-V1..V10). This is the contract
// both writers reject malformed input against, so DC and the CRM refuse the same order with the same
// messages. Malformed shapes are cast through `unknown` — they model untrusted HTTP bodies, which the
// compiler cannot see.
import { describe, expect, it } from "vitest";
import {
  validateSalesOrder,
  type SalesOrderInput,
} from "../../src/sales-order";

type Loose = Record<string, unknown>;

function order(
  overrides: Loose = {},
  lineOverrides: Loose | null = {},
): SalesOrderInput {
  const line =
    lineOverrides === null
      ? null
      : {
          item_id: "item-1",
          container_type_id: "ctype-1",
          quantity: 10,
          uom: "units",
          ...lineOverrides,
        };
  return {
    customer_id: "cust-1",
    lines: line === null ? [] : [line],
    ...overrides,
  } as unknown as SalesOrderInput;
}

const fields = (input: SalesOrderInput): string[] =>
  validateSalesOrder(input).map((i) => i.field);

describe("validateSalesOrder — boundary validation", () => {
  it("T-V1 a valid order → no issues", () => {
    expect(validateSalesOrder(order())).toEqual([]);
  });

  it("T-V2 blank customer_id → one issue on customer_id", () => {
    expect(fields(order({ customer_id: "   " }))).toContain("customer_id");
  });

  it("T-V3 non-positive / non-numeric quantity → issue on lines[0].quantity", () => {
    for (const quantity of [0, -1, Number.NaN, "5"]) {
      expect(fields(order({}, { quantity }))).toContain("lines[0].quantity");
    }
  });

  it("T-V4 a negative override → issue on lines[0].override_unit_price", () => {
    expect(fields(order({}, { override_unit_price: -0.01 }))).toContain(
      "lines[0].override_unit_price",
    );
  });

  it("T-V5 an override of exactly 0 is allowed", () => {
    expect(fields(order({}, { override_unit_price: 0 }))).not.toContain(
      "lines[0].override_unit_price",
    );
  });

  it("T-V6 an unknown UOM → issue on lines[0].uom", () => {
    expect(fields(order({}, { uom: "boxes" }))).toContain("lines[0].uom");
  });

  it("T-V7 malformed ISO dates → issues on both date fields", () => {
    const f = fields(
      order({
        requested_dispatch_date: "08/06/2026",
        order_date: "not-a-date",
      }),
    );
    expect(f).toContain("requested_dispatch_date");
    expect(f).toContain("order_date");
  });

  it("T-V8 notes over 2000 characters → issue on notes", () => {
    expect(fields(order({ notes: "x".repeat(2001) }))).toContain("notes");
  });

  it("T-V9 lines that is not an array → issue on lines", () => {
    expect(
      fields({
        customer_id: "cust-1",
        lines: "nope",
      } as unknown as SalesOrderInput),
    ).toContain("lines");
  });

  it("T-V10 an empty lines array is valid at this layer (header-only draft)", () => {
    expect(validateSalesOrder(order({}, null))).toEqual([]);
  });
});
